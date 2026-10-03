import { createWorkflowDefinition } from "../workflows/definition.js";
import { validateSchedule, nextRunAt } from "../workflows/scheduler.js";
import { createWorkflowStore } from "../workflows/store.js";
import { guard } from "../auth/runtime-guard.js";
import { can } from "../auth/rbac.js";

const store = createWorkflowStore();

export async function handleAutomations(request, env) {
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;
  if (request.method === "GET") return json({ automations: store.list() });
  if (request.method !== "POST") return json({ error: "GET or POST required" }, 405);
  if (!can(access.session.role, "manage_agents")) return json({ error: "Workflow management permission required." }, 403);
  const body = await request.json().catch(() => ({}));
  try {
    const workflow = createWorkflowDefinition(body);
    const schedule = validateSchedule(workflow.trigger);
    if (!schedule.valid) return json({ error: schedule.error }, 400);
    return json({ status: "created", workflow: { ...workflow, nextRunAt: nextRunAt(workflow.trigger) } }, 201);
  } catch (error) { return json({ error: error.message }, 400); }
}
function json(payload, status=200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
