import { can } from "../auth/rbac.js";
import { createPersistentMemory } from "../memory/persistent-store.js";
import { authenticateRequest, requirePermission } from "../auth/request-auth.js";

export async function handleSecurity(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);

  const session = await authenticateRequest(request, env);
  if (!session) return json({ error: "Authentication required." }, 401);

  const body = await request.json().catch(() => ({}));
  const action = body.action || "permissions";

  if (action === "permissions") {
    return json({ role: session.role, permissions: permissionsForRole(session.role) });
  }

  if (action === "check") {
    return json({ allowed: can(session.role, body.permission || "read") });
  }

  if (action === "memory.list" || action === "memory.put") {
    const permission = requirePermission(session, "read", can);
    if (!permission.ok) return json({ error: permission.error }, permission.status);

    const memory = createPersistentMemory(env);
    if (!memory.configured) return json({ status: "unconfigured", message: "UZMO_DB is not configured." }, 503);

    if (action === "memory.list") {
      return json({
        items: await memory.list({
          userId: session.userId,
          orgId: session.orgId
        })
      });
    }

    return json(await memory.put({
      user_id: session.userId,
      org_id: session.orgId,
      kind: body.kind,
      content: body.content,
      metadata: body.metadata
    }));
  }

  return json({ error: "Unknown security action" }, 400);
}

function permissionsForRole(role) {
  return ["read", "execute_safe", "manage_agents", "manage_integrations", "approve", "manage_users", "manage_security"]
    .filter(permission => can(role, permission));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}
