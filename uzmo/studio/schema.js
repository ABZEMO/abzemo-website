export const NODE_TYPES = ["trigger","agent","tool","condition","transform","approval","output"];
export function validateStudioGraph(graph={}) {
  if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) throw new Error("Studio graph requires nodes and edges.");
  const ids=new Set();
  for(const node of graph.nodes){ if(!node.id||!NODE_TYPES.includes(node.type)) throw new Error("Invalid Studio node."); if(ids.has(node.id)) throw new Error("Duplicate Studio node id."); ids.add(node.id); }
  for(const edge of graph.edges){ if(!ids.has(edge.source)||!ids.has(edge.target)) throw new Error("Studio edge references an unknown node."); }
  return {valid:true,nodeCount:graph.nodes.length,edgeCount:graph.edges.length};
}
export function createStudioWorkflow({id,name,graph,metadata={}}={}) {
  if(!id||!name) throw new Error("Studio workflow id and name are required.");
  validateStudioGraph(graph);
  return {id,name,graph,metadata,version:1};
}
