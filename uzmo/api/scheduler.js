import {createRuntimeStores} from "../workflows/runtime-stores.js";
import {queueDueSchedules} from "../workflows/schedule-dispatcher.js";
export async function handleScheduler(request,env){
 if(request.method!=="POST") return json({error:"POST required"},405);
 const body=await request.json().catch(()=>({}));
 const now=body.now?new Date(body.now):new Date();
 if(Number.isNaN(now.getTime())) return json({error:"Invalid now timestamp"},400);
 const stores=createRuntimeStores(env);
 const workflows=await stores.workflows.list(body.orgId||null);
 return json({status:"dispatched",persistence:stores.durable?"d1":"memory",jobs:queueDueSchedules({workflows,jobStore:stores.jobs,now})},202);
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}
