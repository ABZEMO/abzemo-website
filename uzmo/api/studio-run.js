import {createStudioWorkflow} from "../studio/schema.js";
import {studioToWorkflow} from "../workflows/studio-runtime.js";
import {createJob} from "../workflows/jobs.js";
import {createDurableJobStore} from "../workflows/durable-store.js";
export async function handleStudioRun(request,env){
 if(request.method!=="POST") return json({error:"POST required"},405);
 const body=await request.json().catch(()=>({}));
 try{
  const studio=createStudioWorkflow(body);
  const workflow=studioToWorkflow(studio);
  const job=createJob({workflowId:workflow.id,input:{goal:body.goal||workflow.name,context:body.context||{}}});
  const store=createDurableJobStore(env); if(store.configured) await store.put(job);
  return json({status:"queued",workflow,job,persistence:store.configured?"d1":"memory"},202);
 }catch(error){return json({error:error.message||"Unable to queue Studio workflow"},400);}
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}
