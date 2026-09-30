import {MAX_JOB_ATTEMPTS} from "./jobs.js";

const jobs=new Map();

export function createJobStore(){
 return {
  put(job){jobs.set(job.id,structuredClone(job));return job;},
  get(id){return jobs.get(id)||null;},
  list(){return [...jobs.values()];},
  claim(id,workerId,now=new Date().toISOString()){
   const job=jobs.get(id);
   if(!job||job.status!=="queued"||job.attempts>=MAX_JOB_ATTEMPTS)return null;
   const claimed={...job,status:"running",attempts:(job.attempts||0)+1,lockedBy:workerId,updatedAt:now};
   jobs.set(id,structuredClone(claimed));
   return structuredClone(claimed);
  },
  remove(id){return jobs.delete(id);}
 };
}
