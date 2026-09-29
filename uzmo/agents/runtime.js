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

      if (plan?.requiresApproval && !context.approved) {
        emit({ type: "approval.required" });
        return { status: "approval_required", events, plan };
      }

      const results = [];
      const messages = [
        { role: "system", content: "You are UZMO, a tool-using agent orchestrator. Use tools when they are needed. Never claim an action succeeded unless its tool result confirms it." },
        ...(Array.isArray(context.messages) ? context.messages.slice(-12) : []),
        { role: "user", content: goal }
      ];
      const schemas = toolSchemas();

      if (!gateway.configured) {
        emit({ type: "runtime.completed", reason: "model_not_configured" });
        return { status: "completed", events, results, verification: verifyExecution({ goal, results }) };
      }

      let completion = null;
      for (let step = 0; step < maxSteps; step += 1) {
        emit({ type: "model.requested", step: step + 1 });
        completion = await gateway.complete(messages, { provider: context.provider, tools: schemas, tool_choice: "auto" });
        const calls = completion.tool_calls || [];
        emit({ type: "model.completed", step: step + 1, provider: completion.provider, model: completion.model, tool_calls: calls.length });

        if (!calls.length) break;

        for (const call of calls) {
          if (!call?.name) continue;
          emit({ type: "tool.requested", step: step + 1, tool: call.name, call_id: call.id || null });
          const result = await toolExecutor.execute(call.name, call.arguments || {}, { ...context, env });
          results.push({ step: step + 1, call_id: call.id || null, tool: call.name, input: call.arguments || {}, result });
          emit({ type: "tool.completed", step: step + 1, tool: call.name, status: result.status, call_id: call.id || null });

          if (result.status === "approval_required" || result.status === "failed") {
            emit({ type: "runtime.stopped", status: result.status });
            return { status: result.status, events, results, response: completion.text || "", verification: verifyExecution({ goal, results, response: completion.text }) };
          }

          messages.push({
            role: "assistant",
            content: completion.text || "",
            tool_calls: calls.map(item => ({ id: item.id, name: item.name, arguments: item.arguments || {} }))
          });
          messages.push({
            role: "user",
            content: JSON.stringify({ tool_result: { call_id: call.id || null, tool: call.name, result } })
          });
        }
      }

      const verification = verifyExecution({ goal, results, response: completion?.text || "" });
      emit({ type: "runtime.verified", verified: verification.verified });
      emit({ type: "runtime.completed", steps: results.length });
      return {
        status: "completed",
        events,
        results,
        response: completion?.text || "",
        tool_calls: results.map(item => ({ id: item.call_id, name: item.tool, arguments: item.input })),
        verification
      };
    }
  };
}
