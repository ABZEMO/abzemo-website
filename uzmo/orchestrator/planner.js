import { createPlanContract, normalizeGoal } from "../core/contracts.js";
import { selectAgents } from "../agents/registry.js";
import { selectTools } from "../tools/registry.js";

const APPROVAL_TERMS = ["send", "publish", "delete", "purchase", "pay", "post", "approve", "deploy"];

export function buildPlan(rawGoal) {
  const goal = normalizeGoal(rawGoal);
  if (!goal) throw new Error("goal is required");

  const agents = selectAgents(goal);
  const tools = selectTools(goal, agents);
  const requiresApproval = APPROVAL_TERMS.some(term => goal.toLowerCase().includes(term));

  return createPlanContract({
    goal,
    intent: inferIntent(goal),
    agents: agents.map(({ id, name }) => ({ id, name })),
    tools: tools.map(({ id, name }) => ({ id, name })),
    requiresApproval
  });
}

function inferIntent(goal) {
  const text = goal.toLowerCase();
  if (/(every day|daily|every week|weekly|recurring|schedule|automate)/.test(text)) return "automation";
  if (/(research|investigate|compare|find)/.test(text)) return "research";
  if (/(report|brief|summary|dashboard)/.test(text)) return "reporting";
  if (/(email|send|mail)/.test(text)) return "communication";
  if (/(sheet|spreadsheet|data|database|calculate)/.test(text)) return "data";
  return "general_task";
}
