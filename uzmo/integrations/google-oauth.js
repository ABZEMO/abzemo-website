import {createGoogleWorkspace} from "./google-workspace.js";

export async function handleGoogleOAuth(request,env){
  const url=new URL(request.url); const google=createGoogleWorkspace(env);
  if(url.pathname!=="/api/integrations/google/oauth") return null;
  if(request.method==="GET") return Response.json({configured:google.configured,authorization_url:google.configured?google.authorizationUrl(crypto.randomUUID(),env.UZMO_GOOGLE_REDIRECT_URI||""):null});
  return new Response(JSON.stringify({error:"Unsupported OAuth method"}),{status:405,headers:{"content-type":"application/json"}});
}
