export const UZMO_VERSION = "0.1.0";

export function normalizeGoal(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 8000);
}

export function createPlanContract({ goal, intent, agents, tools, requiresApproval = false }) {
  return {
    product: "UZMO",
    version: UZMO_VERSION,
    goal,
    intent,
    agents,
    tools,
    requiresApproval,
    stages: [
      { id: "understand", status: "complete" },
      { id: "plan", status: "complete" },
      { id: "select_agents", status: "complete" },
      { id: "select_tools", status: "complete" },
      { id: "execute", status: requiresApproval ? "awaiting_approval" : "ready" },
      { id: "verify", status: "pending" }
    ]
  };
}
