import { createPersistentMemory } from "../memory/persistent-store.js";
import { createSemanticMemory } from "../memory/semantic.js";

export async function handleMemory(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const body = await request.json().catch(() => ({}));
  const memory = createPersistentMemory(env);
  if (!memory.configured) return json({ status: "unconfigured", message: "UZMO_DB is not configured." }, 503);

  if (body.action === "search") {
    const semantic = createSemanticMemory({ store: memory, embed: createEmbedder(env) });
    return json({ items: await semantic.search(String(body.query || ""), { userId: body.userId, orgId: body.orgId, limit: body.limit }) });
  }
  if (body.action === "put") {
    const semantic = createSemanticMemory({ store: memory, embed: createEmbedder(env) });
    return json(await semantic.index({ user_id: body.userId, org_id: body.orgId, kind: body.kind || "memory", content: body.content, metadata: body.metadata }));
  }
  return json({ error: "Unknown memory action" }, 400);
}

function createEmbedder(env) {
  return async text => {
    if (typeof env.UZMO_EMBEDDING_FUNCTION === "function") return env.UZMO_EMBEDDING_FUNCTION(text);
    return [];
  };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
