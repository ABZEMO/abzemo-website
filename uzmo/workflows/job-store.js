const jobs=new Map();
export function createJobStore(){
 return {
  put(job){jobs.set(job.id,structuredClone(job));return job;},
  get(id){return jobs.get(id)||null;},
  list(){return [...jobs.values()];},
  remove(id){return jobs.delete(id);}
 };
}
