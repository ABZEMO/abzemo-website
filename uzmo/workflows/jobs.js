export const JOB_STATES=["queued","running","paused","completed","failed","cancelled"];
export const MAX_JOB_ATTEMPTS=3;
export function createJob({workflowId,input={},scheduledFor=null,scheduleKey=null}={}){if(!workflowId)throw new Error("workflowId is required.");return{id:crypto.randomUUID(),workflowId,input,scheduledFor,scheduleKey,status:"queued",attempts:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};}
export function transitionJob(job,status,patch={}){
 if(!JOB_STATES.includes(status))throw new Error("Invalid job state.");
 const next={...job,...patch,status,updatedAt:new Date().toISOString()};
 if(status==="failed"&&next.attempts>0&&next.attempts<MAX_JOB_ATTEMPTS)next.status="queued";
 if(["queued","paused","completed","failed","cancelled"].includes(next.status))next.lockedBy=null;
 return next;
}