import { buildPlan } from "../orchestrator/planner.js";
import { createWorkflowRunner } from "../workflows/runner.js";
import { createApprovalRequest } from "../core/approval.js";
import { createMemoryStore } from "../memory/store.js";
import { guard } from "../auth/runtime-guard.js";

const memory = createMemoryStore();
const runner = createWorkflowRunner();

export async function handleRuntime(request, env) {
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;

  if (request.method !== "POST") return json({ error: "POST required" }, 405);

  const body = await request.json().catch(() => ({}));
  const action = body.action || "plan";
  const userId = access.session.userId;

  if (action === "plan") {
    const plan = buildPlan(body.goal || "");
    return json({ status: "planned", plan });
  }

  if (action === "execute") {
    const plan = body.plan || buildPlan(body.goal || "");
    const result = await runner.run(plan, {
      approved: body.approved === true,
      userId
    });
    return json(result);
  }

  if (action === "approve") {
    if (access.session.role !== "owner" && access.session.role !== "admin") {
      return json({ error: "Approval requires admin or owner role." }, 403);
    }
    const plan = body.plan;
    if (!plan) return json({ error: "plan is required" }, 400);
    const approval = createApprovalRequest(plan, userId);
    return json({ status: approval.status, approval });
  }

  if (action === "memory.add") {
    const item = memory.add(body.item || {});
    return json({ status: "stored", item });
  }

  if (action === "memory.list") {
    return json({ status: "ok", items: memory.list() });
  }

  if (action === "memory.clear") {
    memory.clear();
    return json({ status: "cleared" });
  }

  return json({ error: "Unknown runtime action" }, 400);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
