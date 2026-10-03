import test from "node:test";
import assert from "node:assert/strict";
import { createAgentRuntime } from "../uzmo/agents/runtime.js";
import { requiresHumanApproval } from "../uzmo/core/approval.js";

test("agent runtime passes deployment environment to tool execution", async () => {
  let receivedContext;
  const runtime = createAgentRuntime({
    modelGateway: {
      configured: true,
      async complete() {
        return {
          provider: "test",
          model: "test",
          text: "",
          tool_calls: [{ id: "call-1", name: "probe", arguments: { ok: true } }]
        };
      }
    },
    toolExecutor: {
      async execute(name, input, context) {
        receivedContext = { name, input, context };
        return { status: "completed", tool: name };
      }
    },
    maxSteps: 1
  });

  const result = await runtime.run({
    goal: "probe runtime context",
    plan: {},
    context: { userId: "user-1" },
    env: { UZMO_TEST_SECRET: "present" }
  });

  assert.equal(result.status, "completed");
  assert.equal(receivedContext.name, "probe");
  assert.deepEqual(receivedContext.input, { ok: true });
  assert.equal(receivedContext.context.userId, "user-1");
  assert.equal(receivedContext.context.env.UZMO_TEST_SECRET, "present");
});

test("agent runtime stops on tool approval requirement", async () => {
  const runtime = createAgentRuntime({
    modelGateway: {
      configured: true,
      async complete() {
        return {
          provider: "test",
          model: "test",
          text: "",
          tool_calls: [{ id: "call-2", name: "state_change", arguments: {} }]
        };
      }
    },
    toolExecutor: {
      async execute() {
        return { status: "approval_required", tool: "state_change" };
      }
    }
  });

  const result = await runtime.run({
    goal: "perform a state change",
    plan: {},
    context: {},
    env: {}
  });

  assert.equal(result.status, "approval_required");
  assert.equal(result.verification.verified, false);
  assert.equal(result.events.some(event => event.type === "runtime.stopped"), true);
});

test("agent runtime enforces approval from side-effect step actions", async () => {
  let executed = false;
  const runtime = createAgentRuntime({
    modelGateway: { configured: true, async complete() { executed = true; return { provider: "test", model: "test", text: "", tool_calls: [] }; } },
    toolExecutor: { async execute() { throw new Error("must not execute"); } }
  });
  const result = await runtime.run({ goal: "send message", plan: { steps: [{ input: { action: "send" } }] }, context: {}, env: {} });
  assert.equal(result.status, "approval_required");
  assert.equal(executed, false);
});

test("agent runtime does not report pending adapters as completed", async () => {
  const runtime = createAgentRuntime({
    modelGateway: { configured: true, async complete() { return { provider: "test", model: "test", text: "", tool_calls: [{ id: "pending-1", name: "database", arguments: {} }] }; } },
    toolExecutor: { async execute() { return { status: "adapter_pending", tool: "database" }; } },
    maxSteps: 1
  });
  const result = await runtime.run({ goal: "inspect database", plan: {}, context: {}, env: {} });
  assert.equal(result.status, "adapter_pending");
  assert.equal(result.verification.verified, false);
});


test("approval detection honors canonical and legacy plan fields and step actions", () => {
  assert.equal(requiresHumanApproval({ requiresApproval: true }), true);
  assert.equal(requiresHumanApproval({ requires_approval: true }), true);
  assert.equal(requiresHumanApproval({ steps: [{ action: "send" }] }), true);
  assert.equal(requiresHumanApproval({ steps: [{ input: { action: "purchase" } }] }), true);
  assert.equal(requiresHumanApproval({ steps: [{ action: "inspect" }] }), false);
});
