const TABLE="uzmo_jobs";
export function createDurableJobStore(env){
 const db=env?.UZMO_DB;
 return {
  configured:Boolean(db),
  async put(job){if(!db)return {status:"unconfigured",job};await db.prepare("INSERT OR REPLACE INTO uzmo_jobs (id,workflow_id,status,attempts,input_json,result_json,error,scheduled_for,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(job.id,job.workflowId,job.status,job.attempts||0,JSON.stringify(job.input||{}),JSON.stringify(job.result||null),job.error||null,job.scheduledFor||null,job.createdAt,job.updatedAt).run();return {status:"stored",job};},
  async claim(id, workerId, now=new Date().toISOString()){if(!db)return null;const r=await db.prepare("UPDATE uzmo_jobs SET status='running', attempts=attempts+1, updated_at=? WHERE id=? AND status='queued' RETURNING *").bind(now,id).first();return r?decode(r):null;},\n  async claimDue(workerId, now=new Date().toISOString(), limit=20){if(!db)return [];const r=await db.prepare("SELECT id FROM uzmo_jobs WHERE status='queued' AND (scheduled_for IS NULL OR scheduled_for<=?) ORDER BY created_at LIMIT ?").bind(now,Math.min(Number(limit)||20,100)).all();const claimed=[];for(const row of (r.results||[])){const job=await this.claim(row.id,workerId,now);if(job)claimed.push(job);}return claimed;},\n  async get(id){if(!db)return null;const r=await db.prepare("SELECT * FROM uzmo_jobs WHERE id=?").bind(id).first();if(!r)return null;return {...r,workflowId:r.workflow_id,input:JSON.parse(r.input_json||"{}"),result:JSON.parse(r.result_json||"null"),scheduledFor:r.scheduled_for,createdAt:r.created_at,updatedAt:r.updated_at};},
  async list(limit=100){if(!db)return [];const r=await db.prepare("SELECT * FROM uzmo_jobs ORDER BY created_at DESC LIMIT ?").bind(Math.min(Number(limit)||100,500)).all();return (r.results||[]).map(x=>({...x,workflowId:x.workflow_id,input:JSON.parse(x.input_json||"{}"),result:JSON.parse(x.result_json||"null")}));}
 };
}
