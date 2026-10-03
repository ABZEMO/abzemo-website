import {createWorkflowStore} from "../workflows/store.js";
import {createJobStore} from "../workflows/job-store.js";
import {queueDueSchedules} from "../workflows/schedule-dispatcher.js";

export async function handleScheduler(request, env = {}){
 if(request.method!=="POST") return json({error:"POST required"},405);
 const secret=env.UZMO_SCHEDULER_SECRET;
 if(!secret || request.headers.get("x-uzmo-scheduler-secret") !== secret) return json({error:"Forbidden."},403);
 const body=await request.json().catch(()=>({}));
 const now=body.now?new Date(body.now):new Date();
 if(Number.isNaN(now.getTime())) return json({error:"Invalid now timestamp"},400);
 const workflows=createWorkflowStore(),jobs=createJobStore(env);
 return json({status:"dispatched",jobs:await queueDueSchedules({workflows:workflows.list(),jobStore:jobs,now})},202);
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}
