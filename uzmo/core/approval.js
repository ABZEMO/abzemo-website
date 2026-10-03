const SIDE_EFFECTS = new Set(["send", "publish", "delete", "purchase", "pay", "post", "approve", "deploy"]);

export function requiresHumanApproval(plan) {
  return Boolean(plan?.requires_approval || plan?.steps?.some(step => SIDE_EFFECTS.has(step.action)));
}

export function createApprovalRequest(plan, userId = "anonymous") {
  return {
    id: crypto.randomUUID(),
    status: "pending",
    user_id: userId,
    created_at: new Date().toISOString(),
    plan
  };
}
