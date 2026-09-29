import { createStudioWorkflow } from "../studio/schema.js";
import { compileStudioGraph } from "../studio/compiler.js";
export async function handleStudio(request){
  if(request.method!=="POST") return json({error:"POST required"},405);
  const body=await request.json().catch(()=>({}));
  try{
    const workflow=createStudioWorkflow(body);
    return json({status:"compiled",workflow,executionPlan:compileStudioGraph(workflow.graph)},200);
  }catch(error){return json({error:error.message||"Studio request failed"},400);}
}
function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:{"Content-Type":"application/json"}});}
