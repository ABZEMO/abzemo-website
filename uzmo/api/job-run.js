import {createRuntimeStores} from "../workflows/runtime-stores.js";
import {executeJob} from "../workflows/executor.js";
import {guard} from "../auth/runtime-guard.js";
export async function handleJobRun(request,env){
 if(request.method!=="POST")return json({error:"POST required"},405);
 const access=await guard(request,env,"execute_safe");if(!access.ok)return access.response;
 const body=await request.json().catch(()=>({}));
 const stores=createRuntimeStores(env);
 const job=await stores.jobs.get(body.jobId);
 if(!job||job.input?.orgId!==access.session.orgId)return json({error:"Job not found"},404);
 return json({status:"executed",job:await executeJob(job,{workflowStore:stores.workflows,jobStore:stores.jobs,env})});
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}