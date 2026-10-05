import test from "node:test";
import assert from "node:assert/strict";
import { createModelGateway } from "../uzmo/core/model-gateway.js";

test("Gemini function-call arguments are normalized for the runtime", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push(JSON.parse(options.body));
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ functionCall: { name: "http", args: { url: "https://example.com", method: "GET" } } }] } }],
      usageMetadata: { totalTokenCount: 1 }
    }), { status: 200, headers: { "content-type": "application/json" } });
  };
  const gateway = createModelGateway({ UZMO_GEMINI_API_KEY: "test", UZMO_MODEL_PROVIDER: "gemini" }, fetchImpl);
  const result = await gateway.complete([{ role: "user", content: "inspect example.com" }], { tools: [{ function: { name: "http", parameters: { type: "object", properties: {} } } }] });
  assert.equal(calls.length, 1);
  assert.deepEqual(result.tool_calls[0], {
    id: result.tool_calls[0].id,
    name: "http",
    arguments: { url: "https://example.com", method: "GET" }
  });
});
