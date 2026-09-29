const SIDE_EFFECTS = new Set(["send", "publish", "delete", "purchase", "pay", "post", "approve", "deploy"]);

export function requiresHumanApproval(plan) {
  return Boolean(
    plan?.requiresApproval ||
    plan?.requires_approval ||
    plan?.steps?.some(step => SIDE_EFFECTS.has(String(step?.action || "").toLowerCase())) ||
    plan?.tools?.some(tool => SIDE_EFFECTS.has(String(tool?.action || tool?.id || "").toLowerCase()))
  );
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
