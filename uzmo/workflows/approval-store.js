const TABLE="uzmo_approvals";
const TTL_MS=30*60*1000;
function decode(r){return {...r,orgId:r.org_id,requestedBy:r.requested_by,approvedBy:r.approved_by,plan:JSON.parse(r.plan_json||"{}"),expiresAt:r.expires_at,createdAt:r.created_at,updatedAt:r.updated_at};}
export function createApprovalStore(env){
 const db=env?.UZMO_DB;
 return {
  configured:Boolean(db),
  async create({id=crypto.randomUUID(),orgId,requestedBy,goal,plan,expiresAt=new Date(Date.now()+TTL_MS).toISOString()}){
   if(!db)return {id,orgId,requestedBy,goal,plan,status:"pending",approvedBy:null,jobId:null,expiresAt,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
   const now=new Date().toISOString();
   await db.prepare("INSERT INTO "+TABLE+" (id,org_id,requested_by,goal,plan_json,status,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,'pending',?,?,?)").bind(id,orgId,requestedBy,goal,JSON.stringify(plan),expiresAt,now,now).run();
   return this.get(id,orgId);
  },
  async get(id,orgId){
   if(!db)return null;
   const r=await db.prepare("SELECT * FROM "+TABLE+" WHERE id=? AND org_id=?").bind(id,orgId).first();
   return r?decode(r):null;
  },
  async approve(id,orgId,userId,jobId){
   if(!db)return null;
   const now=new Date().toISOString();
   const r=await db.prepare("UPDATE "+TABLE+" SET status='approved',approved_by=?,job_id=?,updated_at=? WHERE id=? AND org_id=? AND status='pending' AND expires_at>? RETURNING *").bind(userId,jobId,now,id,orgId,now).first();
   return r?decode(r):null;
  }
 };
}