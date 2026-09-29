import {buildPlan} from "../orchestrator/planner.js";
import {createAgentRuntime} from "../agents/runtime.js";
import {createModelGateway} from "../core/model-gateway.js";
import {transitionJob} from "./jobs.js";
export async function executeJob(job,{workflowStore,jobStore,env={}}){
 const workflow=workflowStore.get(job.workflowId);
 if(!workflow) return jobStore.put(transitionJob(job,"failed",{error:"Workflow not found."}));
 jobStore.put(transitionJob(job,"running",{attempts:(job.attempts||0)+1}));
 try{
  const goal=job.input?.goal||workflow.goal||workflow.name;
  const plan=buildPlan(goal);
  const result=await createAgentRuntime({modelGateway:createModelGateway(env)}).run({goal,plan,context:job.input?.context||{},env});
  const status=result.status==="approval_required"?"paused":result.status==="failed"?"failed":"completed";
  return jobStore.put(transitionJob({...job,status:"running"},status,{result}));
 }catch(error){return jobStore.put(transitionJob({...job,status:"running"},"failed",{error:error.message||"Job execution failed"}));}
}
