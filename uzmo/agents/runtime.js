import { createModelGateway } from "../core/model-gateway.js";
import { createToolExecutor } from "../tools/executor.js";

const DEFAULT_MAX_STEPS = 8;

export function createAgentRuntime({ modelGateway, toolExecutor = createToolExecutor(), maxSteps = DEFAULT_MAX_STEPS } = {}) {
  return {
    async run({ goal, plan, context = {}, env = {}, onEvent = () => {} }) {
      const gateway = modelGateway || createModelGateway(env);
      const events = [];
      const emit = event => {
        const value = { timestamp: new Date().toISOString(), ...event };
        events.push(value);
        onEvent(value);
      };

      emit({ type: "runtime.started", goal });

      if (!plan?.steps?.length) {
        emit({ type: "runtime.completed" });
        return { status: "completed", events };
      }

      if (plan.requiresApproval && !context.approved) {
        emit({ type: "approval.required" });
        return { status: "approval_required", events, plan };
      }

      const results = [];
      const messages = [
        { role: "system", content: "You are UZMO, a tool-using agent orchestrator. Never claim an action succeeded unless its tool result confirms it." },
        { role: "user", content: goal }
      ];

      for (let index = 0; index < Math.min(plan.steps.length, maxSteps); index += 1) {
        const step = plan.steps[index];
        emit({ type: "step.started", step: step.id, tool: step.tool || null });

        if (step.tool) {
          const result = await toolExecutor.execute(step.tool, step.input || {}, context);
          results.push({ step: step.id, result });
          emit({ type: "tool.completed", step: step.id, status: result.status });

          if (result.status === "approval_required" || result.status === "failed") {
            emit({ type: "runtime.stopped", status: result.status });
            return { status: result.status, events, results };
          }
        }
      }

      if (gateway.configured) {
        const completion = await gateway.complete(
          [...messages, { role: "user", content: JSON.stringify(results) }],
          { provider: context.provider }
        );
        emit({ type: "model.completed", provider: completion.provider, model: completion.model });
        emit({ type: "runtime.completed" });
        return { status: "completed", events, results, response: completion.text };
      }

      emit({ type: "runtime.completed" });
      return { status: "completed", events, results };
    }
  };
}
