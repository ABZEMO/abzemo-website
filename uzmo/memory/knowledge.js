import { createPersistentMemory } from "./persistent-store.js";
import { createSemanticMemory } from "./semantic.js";
import { createEmbeddingGateway } from "./embeddings.js";
import { chunkText } from "./chunker.js";

export function createKnowledgeService(env) {
  const store = createPersistentMemory(env);
  const embeddings = createEmbeddingGateway(env);
  const semantic = createSemanticMemory({ store, embed: text => embeddings.embed(text) });
  return {
    configured: store.configured,
    async ingest({ content, userId, orgId, source, metadata = {}, chunking = {} } = {}) {
      if (!store.configured) return { status: "unconfigured", message: "UZMO_DB is not configured." };
      const chunks = chunkText(content, chunking);
      if (!chunks.length) return { status: "empty", chunks: 0 };
      const vectors = await embeddings.embed(chunks);
      const ids = [];
      for (let i = 0; i < chunks.length; i += 1) {
        const result = await store.put({
          user_id: userId, org_id: orgId, kind: "knowledge",
          content: chunks[i],
          metadata: { ...metadata, source: source || null, chunk_index: i, chunk_count: chunks.length, embedding: vectors[i] || [] }
        });
        if (result.id) ids.push(result.id);
      }
      return { status: "indexed", chunks: chunks.length, ids, embeddings: Boolean(vectors.length) };
    },
    async search(query, options = {}) { return semantic.search(query, options); }
  };
}
