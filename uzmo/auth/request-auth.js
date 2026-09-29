import {isSessionValid} from "./session.js";
export async function authenticateRequest(request,env){
 const token=request.headers.get("Authorization")?.replace(/^Bearer\s+/i,"");
 if(!token) return null;
 const db=env?.UZMO_DB;
 if(!db)return null;
 const row=await db.prepare("SELECT id,user_id,org_id,role,created_at,expires_at FROM uzmo_sessions WHERE id=?").bind(token).first();
 return row&&isSessionValid({user_id:row.user_id,expires_at:row.expires_at})?{id:row.id,userId:row.user_id,orgId:row.org_id,role:row.role}:null;
}
export function requirePermission(session,permission,can){
 if(!session)return {ok:false,status:401,error:"Authentication required."};
 if(!can(session.role,permission))return {ok:false,status:403,error:"Forbidden."};
 return {ok:true};
}
