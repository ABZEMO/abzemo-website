import { validateStudioGraph } from "./schema.js";
export function compileStudioGraph(graph) {
  validateStudioGraph(graph);
  const incoming=new Map(graph.nodes.map(n=>[n.id,0]));
  for(const e of graph.edges) incoming.set(e.target,(incoming.get(e.target)||0)+1);
  const queue=graph.nodes.filter(n=>(incoming.get(n.id)||0)===0).map(n=>n.id);
  const ordered=[];
  while(queue.length){const id=queue.shift();ordered.push(id);for(const e of graph.edges.filter(x=>x.source===id)){incoming.set(e.target,incoming.get(e.target)-1);if(incoming.get(e.target)===0)queue.push(e.target);}}
  if(ordered.length!==graph.nodes.length) throw new Error("Studio graph contains a cycle.");
  return ordered.map(id=>graph.nodes.find(n=>n.id===id));
}
