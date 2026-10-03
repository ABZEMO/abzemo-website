import test from "node:test";
import assert from "node:assert/strict";
import { chunkText } from "../uzmo/memory/chunker.js";
import { createSemanticMemory } from "../uzmo/memory/semantic.js";
import { createEmbeddingGateway } from "../uzmo/memory/embeddings.js";

test("chunkText normalizes whitespace and preserves content", () => {
  const chunks = chunkText("alpha\n\nbeta\t gamma", { size: 200, overlap: 20 });
  assert.deepEqual(chunks, ["alpha beta gamma"]);
});

test("semantic memory ranks records by cosine similarity", async () => {
  const records = [
    { id: "near", metadata_json: JSON.stringify({ embedding: [1, 0] }), content: "near" },
    { id: "far", metadata_json: JSON.stringify({ embedding: [0, 1] }), content: "far" }
  ];
  const memory = createSemanticMemory({
    store: { list: async () => records, put: async value => value },
    embed: async () => [1, 0]
  });
  const result = await memory.search("query", { limit: 2 });
  assert.equal(result[0].id, "near");
  assert.equal(result[1].id, "far");
  assert.equal(result[0].score, 1);
});

test("embedding gateway reports unconfigured when no provider key exists", async () => {
  const gateway = createEmbeddingGateway({}, async () => { throw new Error("fetch should not run"); });
  assert.equal(gateway.configured, false);
  assert.deepEqual(gateway.providers.map(p => p.configured), [false, false]);
  assert.deepEqual(await gateway.embed("hello"), []);
});
