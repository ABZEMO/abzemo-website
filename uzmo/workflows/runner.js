import { createToolExecutor } from "../tools/executor.js";
import { requiresHumanApproval } from "../core/approval.js";

export function createWorkflowRunner({ toolExecutor = createToolExecutor() } = {}) {
  return {
    async run(plan, context = {}) {
      if (!plan?.steps?.length) return { status: "completed", steps: [] };

      if (requiresHumanApproval(plan) && !context.approved) {
        return {
          status: "approval_required",
          approval: { required: true, plan },
          steps: []
        };
      }

      const results = [];
      for (const step of plan.steps) {
        const result = await toolExecutor.execute(step.tool, step.input || {}, context);
        results.push({ step: step.id, ...result });
        if (result.status === "approval_required" || result.status === "failed") {
          return { status: result.status, steps: results };
        }
      }
      return { status: "completed", steps: results };
    }
  };
}
