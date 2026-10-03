import { can, listPermissions } from "../auth/rbac.js";
import { createPersistentMemory } from "../memory/persistent-store.js";
import { authenticateRequest, requirePermission } from "../auth/request-auth.js";

export async function handleSecurity(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const body = await request.json().catch(() => ({}));
  const session = await authenticateRequest(request, env);
  if (!session) return json({ error: "Authentication required." }, 401);
  const role = session.role;
  const action = body.action || "permissions";

  if (action === "permissions") return json({ role, permissions: listPermissions(role) });
  if (action === "check") return json({ allowed: can(role, body.permission || "read") });

  if (action === "memory.list") {
    const auth = requirePermission(session, "read", can);
    if (!auth.ok) return json({ error: auth.error }, auth.status);
    if (body.orgId && body.orgId !== session.orgId) return json({ error: "Forbidden." }, 403);
    if (body.userId && body.userId !== session.userId && !can(role, "manage_users")) return json({ error: "Forbidden." }, 403);
    return json({ items: await createPersistentMemory(env).list({ userId: body.userId || session.userId, orgId: session.orgId }) });
  }

  if (action === "memory.put") {
    const auth = requirePermission(session, "write_memory", can);
    if (!auth.ok) return json({ error: auth.error }, auth.status);
    if (body.orgId && body.orgId !== session.orgId) return json({ error: "Forbidden." }, 403);
    if (body.userId && body.userId !== session.userId && !can(role, "manage_users")) return json({ error: "Forbidden." }, 403);
    return json(await createPersistentMemory(env).put({
      user_id: body.userId || session.userId,
      org_id: session.orgId,
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
