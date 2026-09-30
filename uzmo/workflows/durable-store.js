import {MAX_JOB_ATTEMPTS} from "./jobs.js";

const TABLE="uzmo_jobs";
const LEASE_MS=10*60*1000;
function decode(r){return {...r,workflowId:r.workflow_id,input:JSON.parse(r.input_json||"{}"),result:JSON.parse(r.result_json||"null"),scheduledFor:r.scheduled_for,createdAt:r.created_at,updatedAt:r.updated_at,lockedBy:r.locked_by,scheduleKey:r.schedule_key||null};}
export function createDurableJobStore(env){
 const db=env?.UZMO_DB;
 return {configured:Boolean(db),
  async put(job){if(!db)return {status:"unconfigured",job};await db.prepare("INSERT OR REPLACE INTO "+TABLE+" (id,workflow_id,status,attempts,input_json,result_json,error,scheduled_for,schedule_key,locked_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(job.id,job.workflowId,job.status,job.attempts||0,JSON.stringify(job.input||{}),JSON.stringify(job.result||null),job.error||null,job.scheduledFor||null,job.scheduleKey||null,job.lockedBy||null,job.createdAt,job.updatedAt).run();return {status:"stored",job};},
  async claim(id,workerId,now=new Date().toISOString()){if(!db)return null;const r=await db.prepare("UPDATE "+TABLE+" SET status='running',attempts=attempts+1,locked_by=?,updated_at=? WHERE id=? AND status='queued' AND attempts<? RETURNING *").bind(workerId,now,id,MAX_JOB_ATTEMPTS).first();return r?decode(r):null;},
  async claimDue(workerId,now=new Date().toISOString(),limit=20){if(!db)return [];const stale=new Date(Date.parse(now)-LEASE_MS).toISOString();await db.prepare("UPDATE "+TABLE+" SET status=CASE WHEN attempts>=? THEN 'failed' ELSE 'queued' END,locked_by=NULL,updated_at=? WHERE status='running' AND updated_at<?").bind(MAX_JOB_ATTEMPTS,now,stale).run();const r=await db.prepare("SELECT id FROM "+TABLE+" WHERE status='queued' AND attempts<? AND (scheduled_for IS NULL OR scheduled_for<=?) ORDER BY created_at LIMIT ?").bind(MAX_JOB_ATTEMPTS,now,Math.min(Number(limit)||20,100)).all();const claimed=[];for(const row of(r.results||[])){const job=await this.claim(row.id,workerId,now);if(job)claimed.push(job);}return claimed;},
  async get(id){if(!db)return null;const r=await db.prepare("SELECT * FROM "+TABLE+" WHERE id=?").bind(id).first();return r?decode(r):null;},
  async list(limit=100){if(!db)return [];const r=await db.prepare("SELECT * FROM "+TABLE+" ORDER BY created_at DESC LIMIT ?").bind(Math.min(Number(limit)||100,500)).all();return(r.results||[]).map(decode);}
 };
}
