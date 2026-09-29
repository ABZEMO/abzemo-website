import {createStudioWorkflow} from "../studio/schema.js";
import {studioToWorkflow} from "../workflows/studio-runtime.js";
import {createJob} from "../workflows/jobs.js";
import {createRuntimeStores} from "../workflows/runtime-stores.js";
import {guard} from "../auth/runtime-guard.js";
export async function handleStudioRun(request,env){
 if(request.method!=="POST")return json({error:"POST required"},405);
 const access=await guard(request,env,"execute_safe");if(!access.ok)return access.response;
 const stores=createRuntimeStores(env);const body=await request.json().catch(()=>({}));
 try{const studio=createStudioWorkflow(body);const workflow=studioToWorkflow(studio);workflow.orgId=access.session.orgId;workflow.createdAt=new Date().toISOString();await stores.workflows.put(workflow);const job=createJob({workflowId:workflow.id,input:{goal:body.goal||workflow.name,context:body.context||{},userId:access.session.userId,orgId:access.session.orgId}});await stores.jobs.put(job);return json({status:"queued",workflow,job,persistence:stores.durable?"d1":"memory"},202);}
 catch(error){return json({error:error.message||"Unable to queue Studio workflow"},400);}
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}