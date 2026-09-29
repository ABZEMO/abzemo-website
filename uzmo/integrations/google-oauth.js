import {createGoogleWorkspace} from "./google-workspace.js";
import {createGoogleConnectionStore} from "./google-connections.js";
import {audit} from "../auth/audit.js";
import {guard} from "../auth/runtime-guard.js";

const PATH="/api/integrations/google/oauth";
const SUCCESS_PATH="/uzmo/";
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"content-type":"application/json"}});}
function redirect(env,status,message){
 const target=new URL(env?.UZMO_OAUTH_SUCCESS_URL||SUCCESS_PATH,"https://abzemo.com");
 target.searchParams.set("google",status);
 if(message)target.searchParams.set("message",message);
 return Response.redirect(target.toString(),303);
}
export async function handleGoogleOAuth(request,env){
 const url=new URL(request.url);
 if(url.pathname!==PATH)return null;

 // OAuth provider callbacks cannot carry the UZMO bearer token; the single-use
 // state binds the callback back to the authenticated user/org.
 const code=url.searchParams.get("code");
 const state=url.searchParams.get("state");
 if(code||state){
  if(!code||!state)return json({error:"OAuth callback requires code and state."},400);
  const google=createGoogleWorkspace(env);
  if(!google.configured||!env.UZMO_GOOGLE_REDIRECT_URI)return json({error:"Google OAuth is not configured."},503);
  const store=createGoogleConnectionStore(env);
  const pending=await store.consumeOAuthState(state);
  if(!pending)return redirect(env,"error","invalid_or_expired_state");
  if(pending.redirect_uri!==env.UZMO_GOOGLE_REDIRECT_URI)return redirect(env,"error","redirect_uri_mismatch");
  try{
   const tokens=await google.exchangeCode(code,pending.redirect_uri);
   await store.saveTokens({userId:pending.user_id,orgId:pending.org_id,tokens});
   await audit(env,{userId:pending.user_id,orgId:pending.org_id,action:"google.connected",resource:"google",metadata:{provider:"google"}});
   return redirect(env,"connected");
  }catch(error){
   await audit(env,{userId:pending.user_id,orgId:pending.org_id,action:"google.connect_failed",resource:"google",metadata:{reason:error.message||"oauth_exchange_failed"}});
   return redirect(env,"error","oauth_exchange_failed");
  }
 }

 const access=await guard(request,env,"manage_integrations");
 if(!access.ok)return access.response;
 const google=createGoogleWorkspace(env);
 const store=createGoogleConnectionStore(env);
 const action=url.searchParams.get("action")||"connect";

 if(request.method==="GET"&&action==="connect"){
  if(!google.configured||!env.UZMO_GOOGLE_REDIRECT_URI)return json({configured:false,error:"Set UZMO_GOOGLE_CLIENT_ID, UZMO_GOOGLE_CLIENT_SECRET and UZMO_GOOGLE_REDIRECT_URI."},503);
  const state=crypto.randomUUID();
  await store.saveOAuthState({state,userId:access.session.userId,orgId:access.session.orgId,redirectUri:env.UZMO_GOOGLE_REDIRECT_URI});
  return json({configured:true,authorization_url:google.authorizationUrl(state,env.UZMO_GOOGLE_REDIRECT_URI)});
 }
 if(request.method==="GET"&&action==="status"){
  return json(await store.status({userId:access.session.userId,orgId:access.session.orgId}));
 }
 if(request.method==="POST"&&action==="revoke"){
  await store.revoke({userId:access.session.userId,orgId:access.session.orgId});
  await audit(env,{userId:access.session.userId,orgId:access.session.orgId,action:"google.revoked",resource:"google",metadata:{provider:"google"}});
  return json({status:"revoked"});
 }
 return json({error:"Unsupported OAuth action."},405);
}
