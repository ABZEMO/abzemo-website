const GOOGLE_TOKEN_URL="https://oauth2.googleapis.com/token";
const API_ROOT="https://www.googleapis.com";

export function createGoogleWorkspace(env){
  return {
    configured:Boolean(env?.UZMO_GOOGLE_CLIENT_ID && env?.UZMO_GOOGLE_CLIENT_SECRET),
    authorizationUrl(state,redirectUri){
      const p=new URLSearchParams({client_id:env.UZMO_GOOGLE_CLIENT_ID,response_type:"code",redirect_uri:redirectUri,scope:["https://www.googleapis.com/auth/gmail.modify","https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/spreadsheets"].join(" "),access_type:"offline",prompt:"consent",state});
      return "https://accounts.google.com/o/oauth2/v2/auth?"+p;
    },
    async exchangeCode(code,redirectUri){
      const body=new URLSearchParams({code,client_id:env.UZMO_GOOGLE_CLIENT_ID,client_secret:env.UZMO_GOOGLE_CLIENT_SECRET,redirect_uri:redirectUri,grant_type:"authorization_code"});
      const r=await fetch(GOOGLE_TOKEN_URL,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
      if(!r.ok) throw new Error("Google OAuth token exchange failed.");
      return r.json();
    },
    async request(accessToken,path,options={}){
      const r=await fetch(API_ROOT+path,{...options,headers:{...(options.headers||{}),Authorization:"Bearer "+accessToken}});
      if(!r.ok) throw new Error("Google Workspace API request failed: "+r.status);
      return r.json();
    }
  };
}
