import {authenticateRequest,requirePermission} from "./request-auth.js";
import {can} from "./rbac.js";
import {rateLimit} from "./rate-limit.js";
export async function guard(request,env,permission="execute_safe"){
 const session=await authenticateRequest(request,env);
 if(!session)return {ok:false,response:new Response(JSON.stringify({error:"Authentication required."}),{status:401,headers:{"content-type":"application/json"}})};
 const auth=requirePermission(session,permission,can);
 if(!auth.ok)return {ok:false,response:new Response(JSON.stringify({error:auth.error}),{status:auth.status,headers:{"content-type":"application/json"}})};
 const rate=rateLimit(session.userId,{env});
 if(!rate.allowed)return {ok:false,response:new Response(JSON.stringify({error:"Rate limit exceeded.",retryAfterMs:rate.retryAfterMs}),{status:429,headers:{"content-type":"application/json","Retry-After":String(Math.ceil(rate.retryAfterMs/1000))}})};
 return {ok:true,session,rate};
}
