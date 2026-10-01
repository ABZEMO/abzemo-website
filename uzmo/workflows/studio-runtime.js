import {compileStudioGraph} from "../studio/compiler.js";
export function studioToWorkflow(studio){
 const nodes=compileStudioGraph(studio.graph);
 const steps=nodes.filter(n=>["agent","tool","condition","transform","approval","output"].includes(n.type)).map((n,i)=>({id:n.id||`step-${i+1}`,type:n.type,agent:n.agent,tool:n.tool,input:n.input||{},config:n.config||{}}));
 const trigger=nodes.find(n=>n.type==="trigger")?.config||{type:"manual"};
 return {id:studio.id,name:studio.name,trigger,steps,enabled:true,version:studio.version};
}
