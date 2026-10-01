export const TRIGGERS = ["manual", "schedule", "webhook", "event"];
export function createWorkflowDefinition({ id, name, orgId = null, trigger = { type: "manual" }, steps = [], approval = null, enabled = true } = {}) {
  if (!id || !name) throw new Error("Workflow id and name are required.");
  if (!TRIGGERS.includes(trigger.type)) throw new Error("Unsupported workflow trigger.");
  if (!Array.isArray(steps)) throw new Error("Workflow steps must be an array.");
  return { id, orgId, name, trigger, steps, approval, enabled, version: 1, createdAt: new Date().toISOString() };
}
