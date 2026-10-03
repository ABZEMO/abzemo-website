import { createPersistentMemory } from "../memory/persistent-store.js";
import { createSemanticMemory } from "../memory/semantic.js";
import { guard } from "../auth/runtime-guard.js";
import { can } from "../auth/rbac.js";

export async function handleMemory(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;
  const body = await request.json().catch(() => ({}));
  const memory = createPersistentMemory(env);
  if (!memory.configured) return json({ status: "unconfigured", message: "Memory storage is not configured." }, 503);

  const userId = body.userId || access.session.userId;
  const orgId = body.orgId || access.session.orgId;
  if (orgId !== access.session.orgId) return json({ error: "Forbidden." }, 403);
  if (userId !== access.session.userId && !can(access.session.role, "manage_users")) return json({ error: "Forbidden." }, 403);

  if (body.action === "search") {
    const semantic = createSemanticMemory({ store: memory, embed: createEmbedder(env) });
    return json({ items: await semantic.search(String(body.query || ""), { userId, orgId, limit: body.limit }) });
  }
  if (body.action === "put") {
    if (!can(access.session.role, "write_memory")) return json({ error: "Forbidden." }, 403);
    const semantic = createSemanticMemory({ store: memory, embed: createEmbedder(env) });
    return json(await semantic.index({ user_id: userId, org_id: orgId, kind: body.kind || "memory", content: body.content, metadata: body.metadata }));
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
