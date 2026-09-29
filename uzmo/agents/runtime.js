import { createModelGateway } from "../core/model-gateway.js";
import { createToolExecutor } from "../tools/executor.js";
import { toolSchemas } from "../tools/schemas.js";
import { verifyExecution } from "./verification.js";

const DEFAULT_MAX_STEPS = 8;

export function createAgentRuntime({ modelGateway, toolExecutor = createToolExecutor(), maxSteps = DEFAULT_MAX_STEPS } = {}) {
  return {
    async run({ goal, plan, context = {}, env = {}, onEvent = () => {} }) {
      const gateway = modelGateway || createModelGateway(env);
      const events = [];
      const emit = event => { const value = { timestamp: new Date().toISOString(), ...event }; events.push(value); onEvent(value); };
      emit({ type: "runtime.started", goal });

      if (!plan?.steps?.length) { emit({ type: "runtime.completed" }); return { status: "completed", events }; }
      if (plan.requiresApproval && !context.approved) { emit({ type: "approval.required" }); return { status: "approval_required", events, plan }; }

      const results = [];
      const messages = [
        { role: "system", content: "You are UZMO, a tool-using agent orchestrator. Never claim an action succeeded unless its tool result confirms it." },
        ...(Array.isArray(context.messages) ? context.messages.slice(-12) : []),
        { role: "user", content: goal }
      ];
      const schemas = toolSchemas();

      for (let index = 0; index < Math.min(plan.steps.length, maxSteps); index += 1) {
        const step = plan.steps[index];
        emit({ type: "step.started", step: step.id, tool: step.tool || null });
        if (step.tool) {
          const result = await toolExecutor.execute(step.tool, step.input || {}, context);
          results.push({ step: step.id, tool: step.tool, result });
          emit({ type: "tool.completed", step: step.id, tool: step.tool, status: result.status });
          if (result.status === "approval_required" || result.status === "failed") {
            emit({ type: "runtime.stopped", status: result.status });
            return { status: result.status, events, results, verification: verifyExecution({ goal, results }) };
          }
        }
      }

      if (!gateway.configured) {
        emit({ type: "runtime.completed" });
        return { status: "completed", events, results, verification: verifyExecution({ goal, results }) };
      }

      const completion = await gateway.complete(
        [...messages, { role: "user", content: JSON.stringify(results) }],
        { provider: context.provider, tools: schemas }
      );
      emit({ type: "model.completed", provider: completion.provider, model: completion.model, tool_calls: completion.tool_calls?.length || 0 });

      const verification = verifyExecution({ goal, results, response: completion.text });
      emit({ type: "runtime.verified", verified: verification.verified });
      emit({ type: "runtime.completed" });
      return { status: "completed", events, results, response: completion.text, tool_calls: completion.tool_calls || [], verification };
    }
  };
}
