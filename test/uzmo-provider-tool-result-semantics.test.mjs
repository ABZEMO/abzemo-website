import test from "node:test";
import assert from "node:assert/strict";
import { createModelGateway } from "../uzmo/core/model-gateway.js";

function mockFetch(bodyCapture) {
  return async (_url, options) => {
    bodyCapture.push(JSON.parse(options.body));
    return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text: "ok" }] }) };
  };
}

const messages = [
  { role: "system", content: "system" },
  { role: "user", content: "do the task" },
  { role: "assistant", content: "", tool_calls: [{ id: "call-1", name: "webhook", arguments: { url: "https://example.com", body: { ok: true } } }] },
  { role: "user", content: JSON.stringify({ tool_result: { call_id: "call-1", tool: "webhook", result: { status: "completed" } } }) }
];

test("OpenAI receives native tool and tool-result messages", async () => {
  const bodies = [];
  const gateway = createModelGateway({ UZMO_OPENAI_API_KEY: "x" }, mockFetch(bodies));
  await gateway.complete(messages, { provider: "openai" });
  const sent = bodies[0].messages;
  assert.equal(sent.at(-1).role, "tool");
  assert.equal(sent.at(-1).tool_call_id, "call-1");
  assert.equal(sent.at(-2).tool_calls[0].function.name, "webhook");
});

test("Anthropic receives native tool_use and tool_result blocks", async () => {
  const bodies = [];
  const gateway = createModelGateway({ UZMO_ANTHROPIC_API_KEY: "x" }, mockFetch(bodies));
  await gateway.complete(messages, { provider: "anthropic" });
  const sent = bodies[0].messages;
  assert.equal(sent.at(-1).content[0].type, "tool_result");
  assert.equal(sent.at(-1).content[0].tool_use_id, "call-1");
  assert.equal(sent.at(-2).content[0].type, "tool_use");
});

test("Gemini receives native functionCall and functionResponse parts", async () => {
  const bodies = [];
  const gateway = createModelGateway({ UZMO_GEMINI_API_KEY: "x" }, mockFetch(bodies));
  await gateway.complete(messages, { provider: "gemini" });
  const sent = bodies[0].contents;
  assert.ok(sent.at(-1).parts[0].functionResponse);
  assert.equal(sent.at(-2).parts[0].functionCall.name, "webhook");
});
