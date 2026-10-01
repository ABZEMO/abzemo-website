const UZMO_STUDIO_NODE_TYPES=["Trigger","Agent","Tool","Condition","Transform","Approval","Output"];
export function createStudioNode(type,data={}){return {id:crypto.randomUUID(),type:type.toLowerCase(),data};}
export function serializeStudioGraph(nodes,edges){return {nodes,edges};}
export async function compileStudioWorkflow(workflow,endpoint="/api/studio"){
 const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(workflow)});
 if(!response.ok) throw new Error((await response.json()).error||"Studio compilation failed");
 return response.json();
}
