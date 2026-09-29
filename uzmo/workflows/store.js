const memory = new Map();

export function createWorkflowStore() {
  return {
    put(workflow) { memory.set(workflow.id, structuredClone(workflow)); return workflow; },
    get(id, orgId) {
      const workflow = memory.get(id);
      if (!workflow || (orgId && workflow.orgId !== orgId)) return null;
      return structuredClone(workflow);
    },
    list(orgId) {
      const values = [...memory.values()];
      return orgId ? values.filter(workflow => workflow.orgId === orgId) : values;
    },
    remove(id) { return memory.delete(id); }
  };
}
