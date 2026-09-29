export const TRIGGERS = ["manual", "schedule", "webhook", "event"];

export function createWorkflowDefinition({ id, name, trigger = { type: "manual" }, steps = [], approval = null } = {}) {
  if (!id || !name) throw new Error("Workflow id and name are required.");
  if (!TRIGGERS.includes(trigger.type)) throw new Error("Unsupported workflow trigger.");
  return { id, name, trigger, steps, approval, version: 1 };
}
