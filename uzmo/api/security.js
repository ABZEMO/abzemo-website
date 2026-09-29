import { can } from "../auth/rbac.js";
import { createPersistentMemory } from "../memory/persistent-store.js";

export async function handleSecurity(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const body = await request.json().catch(() => ({}));
  const role = body.role || "member";
  const action = body.action || "permissions";

  if (action === "permissions") return json({ role, permissions: [] });
  if (action === "check") return json({ allowed: can(role, body.permission || "read") });

  if (action === "memory.list") {
    if (!can(role, "read")) return json({ error: "forbidden" }, 403);
    return json({ items: await createPersistentMemory(env).list({ userId: body.userId, orgId: body.orgId }) });
  }

  if (action === "memory.put") {
    if (!can(role, "read")) return json({ error: "forbidden" }, 403);
    return json(await createPersistentMemory(env).put({
      user_id: body.userId,
      org_id: body.orgId,
      kind: body.kind,
      content: body.content,
      metadata: body.metadata
    }));
  }

  return json({ error: "Unknown security action" }, 400);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
