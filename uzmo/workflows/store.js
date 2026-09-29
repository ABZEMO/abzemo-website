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
      return orgId ? values.filter(workflow => workflow.orgId === orgId).map(structuredClone) : values.map(structuredClone);
    },
    claimDueSchedule(workflow, job, now, next) {
      const current = memory.get(workflow.id);
      if (!current || current.orgId !== workflow.orgId || !current.enabled || !current.nextRunAt || new Date(current.nextRunAt) > now) {
        return { inserted: false, job };
      }
      memory.set(workflow.id, structuredClone({ ...current, nextRunAt: next.toISOString() }));
      return { inserted: true, job };
    },
    remove(id) { return memory.delete(id); }
  };
}
