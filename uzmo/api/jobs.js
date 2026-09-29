import {createJob} from "../workflows/jobs.js";
import {createJobStore} from "../workflows/job-store.js";
const store=createJobStore();
export async function handleJobs(request){
 if(request.method==="GET") return json({jobs:store.list()});
 if(request.method!=="POST") return json({error:"GET or POST required"},405);
 const body=await request.json().catch(()=>({}));
 try{const job=store.put(createJob(body));return json({status:"queued",job},202);}
 catch(error){return json({error:error.message||"Unable to create job"},400);}
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}
