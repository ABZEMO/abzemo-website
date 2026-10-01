export async function audit(env,{userId=null,orgId=null,action,resource=null,metadata={}}){
 if(!env?.UZMO_DB)return;
 await env.UZMO_DB.prepare("INSERT INTO uzmo_audit_log (id,user_id,org_id,action,resource,metadata_json,created_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),userId,orgId,action,resource,JSON.stringify(metadata),new Date().toISOString()).run();
}
