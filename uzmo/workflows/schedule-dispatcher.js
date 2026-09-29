import {createJob} from "./jobs.js";
import {nextRunAt} from "./scheduler.js";
export function findDueSchedules(workflows,now=new Date()){return workflows.filter(w=>w.enabled&&w.trigger?.type==="schedule"&&w.nextRunAt&&new Date(w.nextRunAt)<=now);}
export async function queueDueSchedules({workflows,workflowStore,jobStore,now=new Date()}){
 const due=findDueSchedules(workflows,now);const jobs=[];
 for(const w of due){
  jobs.push(await jobStore.put(createJob({workflowId:w.id,input:{trigger:"schedule",orgId:w.orgId},scheduledFor:now.toISOString()})));
  const next=nextRunAt(w.trigger,now);
  if(next)await workflowStore.put({...w,nextRunAt:typeof next==="string"?next:w.nextRunAt});
 }
 return jobs;
}