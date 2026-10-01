import {createJob} from "./jobs.js";
export function findDueSchedules(workflows,now=new Date()){
 return workflows.filter(w=>w.enabled&&w.trigger?.type==="schedule"&&w.nextRunAt&&new Date(w.nextRunAt)<=now);
}
export function queueDueSchedules({workflows,jobStore,now=new Date()}){
 const due=findDueSchedules(workflows,now);
 return due.map(w=>jobStore.put(createJob({workflowId:w.id,input:{trigger:"schedule"},scheduledFor:now.toISOString()})));
}
