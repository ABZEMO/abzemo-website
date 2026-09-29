const TABLE="uzmo_workflows";
function decode(r){
 return {id:r.id,orgId:r.org_id,name:r.name,trigger:JSON.parse(r.trigger_json||"{}"),steps:JSON.parse(r.steps_json||"[]"),approval:JSON.parse(r.approval_json||"null"),enabled:Boolean(r.enabled),version:r.version,nextRunAt:r.next_run_at||null,createdAt:r.created_at,updatedAt:r.updated_at};
}
export function createDurableWorkflowStore(env){
 const db=env?.UZMO_DB;
 return {configured:Boolean(db),
  async put(w){
   if(!db)return {status:"unconfigured",workflow:w};
   await db.prepare("INSERT OR REPLACE INTO uzmo_workflows (id,org_id,name,trigger_json,steps_json,approval_json,enabled,version,next_run_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(w.id,w.orgId||null,w.name,JSON.stringify(w.trigger||{}),JSON.stringify(w.steps||[]),JSON.stringify(w.approval||null),w.enabled?1:0,w.version||1,w.nextRunAt||null,w.createdAt||new Date().toISOString(),new Date().toISOString()).run();
   return {status:"stored",workflow:w};
  },
  async get(id,orgId){if(!db)return null;const r=await db.prepare("SELECT * FROM "+TABLE+" WHERE id=? AND org_id=?").bind(id,orgId).first();return r?decode(r):null;},
  async list(orgId){if(!db)return [];const r=await db.prepare("SELECT * FROM "+TABLE+" WHERE org_id=? ORDER BY updated_at DESC").bind(orgId).all();return (r.results||[]).map(decode);},
  async claimDueSchedule(workflow,job,now,next){
   if(!db)return null;
   const inserted=await db.prepare("INSERT OR IGNORE INTO uzmo_jobs (id,workflow_id,status,attempts,input_json,result_json,error,scheduled_for,schedule_key,locked_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(job.id,job.workflowId,job.status,job.attempts||0,JSON.stringify(job.input||{}),JSON.stringify(job.result||null),job.error||null,job.scheduledFor||null,job.scheduleKey||null,job.lockedBy||null,job.createdAt,job.updatedAt).run();
   await db.prepare("UPDATE "+TABLE+" SET next_run_at=?,updated_at=? WHERE id=? AND org_id=? AND enabled=1 AND next_run_at IS NOT NULL AND next_run_at<=?").bind(next.toISOString(),new Date().toISOString(),workflow.id,workflow.orgId,now.toISOString()).run();
   return {inserted:inserted.meta?.changes===1,job};
  }
 };
}