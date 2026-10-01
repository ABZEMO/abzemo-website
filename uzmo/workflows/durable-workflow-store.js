const TABLE="uzmo_workflows";
export function createDurableWorkflowStore(env){
 const db=env?.UZMO_DB;
 return {configured:Boolean(db),
 async put(w){if(!db)return {status:"unconfigured",workflow:w};await db.prepare("INSERT OR REPLACE INTO uzmo_workflows (id,org_id,name,trigger_json,steps_json,approval_json,enabled,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(w.id,w.orgId||null,w.name,JSON.stringify(w.trigger||{}),JSON.stringify(w.steps||[]),JSON.stringify(w.approval||null),w.enabled?1:0,w.version||1,w.createdAt||new Date().toISOString(),new Date().toISOString()).run();return {status:"stored",workflow:w};},
 async get(id,orgId){if(!db)return null;const r=await db.prepare("SELECT * FROM uzmo_workflows WHERE id=? AND org_id=?").bind(id,orgId).first();if(!r)return null;return {id:r.id,orgId:r.org_id,name:r.name,trigger:JSON.parse(r.trigger_json||"{}"),steps:JSON.parse(r.steps_json||"[]"),approval:JSON.parse(r.approval_json||"null"),enabled:Boolean(r.enabled),version:r.version};},
 async list(orgId){if(!db)return [];const r=await db.prepare("SELECT * FROM uzmo_workflows WHERE org_id=? ORDER BY updated_at DESC").bind(orgId).all();return r.results||[];}
 };}
