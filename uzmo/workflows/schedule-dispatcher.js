import {createJob} from "./jobs.js";
import {nextRunAt} from "./scheduler.js";
export function findDueSchedules(workflows,now=new Date()){return workflows.filter(w=>w.enabled&&w.trigger?.type==="schedule"&&w.nextRunAt&&new Date(w.nextRunAt)<=now);}
export async function queueDueSchedules({workflows,workflowStore,jobStore,now=new Date()}){
 const due=findDueSchedules(workflows,now),jobs=[];
 for(const w of due){
  const next=nextRunAt(w.trigger,now);
  if(!next||typeof next!=="string")continue;
  const job=createJob({workflowId:w.id,input:{trigger:"schedule",orgId:w.orgId},scheduledFor:now.toISOString(),scheduleKey:w.id+":"+w.nextRunAt});
  if(typeof workflowStore.claimDueSchedule==="function"){
   const result=await workflowStore.claimDueSchedule(w,job,now,new Date(next));
   if(result?.inserted)jobs.push(job);
  }else{
   jobs.push(await jobStore.put(job));
   await workflowStore.put({...w,nextRunAt:next});
  }
 }
 return jobs;
}