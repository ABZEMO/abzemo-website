const memory = new Map();
export function createWorkflowStore() {
  return {
    put(workflow) { memory.set(workflow.id, structuredClone(workflow)); return workflow; },
    get(id) { return memory.get(id) || null; },
    list() { return [...memory.values()]; },
    remove(id) { return memory.delete(id); }
  };
}
