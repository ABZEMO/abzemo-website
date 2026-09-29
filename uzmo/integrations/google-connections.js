import {encryptSecret,decryptSecret} from "../auth/token-crypto.js";

export function createGoogleConnectionStore(env){
  const db=env?.UZMO_DB;
  return {
    async saveOAuthState({state,userId,orgId,redirectUri}){
      if(!db) throw new Error("UZMO_DB is required for Google OAuth.");
      await db.prepare("INSERT INTO uzmo_oauth_states (state,user_id,org_id,provider,redirect_uri,expires_at,created_at) VALUES (?,?,?,?,?,?,?)").bind(state,userId,orgId,"google",redirectUri,new Date(Date.now()+10*60*1000).toISOString(),new Date().toISOString()).run();
    },
    async consumeOAuthState(state){
      if(!db)return null;
      const row=await db.prepare("SELECT state,user_id,org_id,redirect_uri,expires_at FROM uzmo_oauth_states WHERE state=? AND provider='google'").bind(state).first();
      if(!row || new Date(row.expires_at)<=new Date()) return null;
      await db.prepare("DELETE FROM uzmo_oauth_states WHERE state=?").bind(state).run();
      return row;
    },
    async saveTokens({userId,orgId,tokens}){
      if(!db) throw new Error("UZMO_DB is required for Google connections.");
      const existing=await db.prepare("SELECT id,refresh_token_enc FROM uzmo_oauth_connections WHERE user_id=? AND org_id=? AND provider='google'").bind(userId,orgId).first();
      const refresh=tokens.refresh_token || (existing?.refresh_token_enc ? await decryptSecret(env,existing.refresh_token_enc) : null);
      if(!refresh) throw new Error("Google did not return a refresh token. Re-authorize with offline access.");
      const accessEnc=await encryptSecret(env,tokens.access_token);
      const refreshEnc=await encryptSecret(env,refresh);
      const expiresAt=new Date(Date.now()+Number(tokens.expires_in||3600)*1000).toISOString();
      if(existing) await db.prepare("UPDATE uzmo_oauth_connections SET access_token_enc=?,refresh_token_enc=?,expires_at=?,updated_at=?,revoked_at=NULL WHERE id=?").bind(accessEnc,refreshEnc,expiresAt,new Date().toISOString(),existing.id).run();
      else await db.prepare("INSERT INTO uzmo_oauth_connections (id,user_id,org_id,provider,access_token_enc,refresh_token_enc,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),userId,orgId,"google",accessEnc,refreshEnc,expiresAt,new Date().toISOString(),new Date().toISOString()).run();
    },
    async getAccessToken({userId,orgId,google}){
      if(!db)return null;
      const row=await db.prepare("SELECT id,access_token_enc,refresh_token_enc,expires_at FROM uzmo_oauth_connections WHERE user_id=? AND org_id=? AND provider='google' AND revoked_at IS NULL").bind(userId,orgId).first();
      if(!row)return null;
      if(new Date(row.expires_at).getTime()>Date.now()+60000) return decryptSecret(env,row.access_token_enc);
      const refresh=await decryptSecret(env,row.refresh_token_enc);
      const tokens=await google.refreshAccessToken(refresh);
      await db.prepare("UPDATE uzmo_oauth_connections SET access_token_enc=?,expires_at=?,updated_at=? WHERE id=?").bind(await encryptSecret(env,tokens.access_token),new Date(Date.now()+Number(tokens.expires_in||3600)*1000).toISOString(),new Date().toISOString(),row.id).run();
      return tokens.access_token;
    },
    async revoke({userId,orgId}){
      if(!db)return;
      await db.prepare("UPDATE uzmo_oauth_connections SET revoked_at=?,updated_at=? WHERE user_id=? AND org_id=? AND provider='google' AND revoked_at IS NULL").bind(new Date().toISOString(),new Date().toISOString(),userId,orgId).run();
    },
    async status({userId,orgId}){
      if(!db)return {connected:false,persistence:false};
      const row=await db.prepare("SELECT expires_at,revoked_at,updated_at FROM uzmo_oauth_connections WHERE user_id=? AND org_id=? AND provider='google' ORDER BY updated_at DESC LIMIT 1").bind(userId,orgId).first();
      return {connected:Boolean(row&&!row.revoked_at),expires_at:row?.expires_at||null,updated_at:row?.updated_at||null,persistence:true};
    }
  };
}
