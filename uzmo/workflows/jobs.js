export const JOB_STATES=["queued","running","paused","completed","failed","cancelled"];
export function createJob({workflowId,input={},scheduledFor=null}={}) {
  if(!workflowId) throw new Error("workflowId is required.");
  return {id:crypto.randomUUID(),workflowId,input,scheduledFor,status:"queued",attempts:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}
export function transitionJob(job,status,patch={}) {
  if(!JOB_STATES.includes(status)) throw new Error("Invalid job state.");
  return {...job,...patch,status,updatedAt:new Date().toISOString()};
}
