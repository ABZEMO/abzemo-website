import {createWorkflowStore} from "../workflows/store.js";
import {createJobStore} from "../workflows/job-store.js";
import {executeJob} from "../workflows/executor.js";
const workflows=createWorkflowStore(),jobs=createJobStore();
export async function handleJobRun(request,env){
 if(request.method!=="POST") return json({error:"POST required"},405);
 const body=await request.json().catch(()=>({}));
 const job=jobs.get(body.jobId);
 if(!job) return json({error:"Job not found"},404);
 return json({status:"executed",job:await executeJob(job,{workflowStore:workflows,jobStore:jobs,env})});
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}
