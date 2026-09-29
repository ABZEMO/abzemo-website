import {createWorkflowDefinition} from "../workflows/definition.js";
import {validateSchedule,nextRunAt} from "../workflows/scheduler.js";
import {createRuntimeStores} from "../workflows/runtime-stores.js";
import {guard} from "../auth/runtime-guard.js";
export async function handleAutomations(request,env){
 const access=await guard(request,env,"execute_safe");if(!access.ok)return access.response;
 const stores=createRuntimeStores(env);
 if(request.method==="GET")return json({automations:await stores.workflows.list(access.session.orgId),persistence:stores.durable?"d1":"memory"});
 if(request.method!=="POST")return json({error:"GET or POST required"},405);
 const body=await request.json().catch(()=>({}));
 try{const workflow=createWorkflowDefinition({...body,orgId:access.session.orgId});const schedule=validateSchedule(workflow.trigger);if(!schedule.valid)return json({error:schedule.error},400);const saved={...workflow,nextRunAt:nextRunAt(workflow.trigger)};await stores.workflows.put(saved);return json({status:"created",workflow:saved,persistence:stores.durable?"d1":"memory"},201);}
 catch(error){return json({error:error.message},400);}
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}