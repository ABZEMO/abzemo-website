import {createWorkflowStore} from "../workflows/store.js";
import {createJobStore} from "../workflows/job-store.js";
import {createTriggerDispatcher} from "../workflows/dispatcher.js";
const workflows=createWorkflowStore(),jobs=createJobStore();
const dispatcher=createTriggerDispatcher({workflowStore:workflows,jobStore:jobs});
export async function handleTriggers(request){
 if(request.method!=="POST") return json({error:"POST required"},405);
 const body=await request.json().catch(()=>({}));
 if(body.type==="event") return json({status:"dispatched",jobs:dispatcher.dispatchEvent(body.event||{})},202);
 return json({error:"Supported trigger dispatch: event"},400);
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}
