import {createRuntimeStores} from "../workflows/runtime-stores.js";
import {createTriggerDispatcher} from "../workflows/dispatcher.js";
import {guard} from "../auth/runtime-guard.js";
export async function handleTriggers(request,env){
 if(request.method!=="POST")return json({error:"POST required"},405);
 const access=await guard(request,env,"execute_safe");if(!access.ok)return access.response;
 const stores=createRuntimeStores(env);const dispatcher=createTriggerDispatcher({workflowStore:stores.workflows,jobStore:stores.jobs,orgId:access.session.orgId});
 const body=await request.json().catch(()=>({}));
 if(body.type==="event")return json({status:"dispatched",jobs:await dispatcher.dispatchEvent(body.event||{})},202);
 return json({error:"Supported trigger dispatch: event"},400);
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}