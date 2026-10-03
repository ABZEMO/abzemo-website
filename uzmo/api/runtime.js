import { buildPlan } from "../orchestrator/planner.js";
import { createAgentRuntime } from "../agents/runtime.js";
import { createModelGateway } from "../core/model-gateway.js";
import { createApprovalRequest, requiresHumanApproval } from "../core/approval.js";
import { createMemoryStore } from "../memory/store.js";
import { guard } from "../auth/runtime-guard.js";

const memory = createMemoryStore();
const approvals = new Map();

export async function handleRuntime(request, env = {}) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);

  const body = await request.json().catch(() => ({}));
  const action = body.action || "plan";

  const permission = action === "approve" ? "approve" : "execute_safe";
  const access = await guard(request, env, permission);
  if (!access.ok) return access.response;

  const userId = access.session.userId;
  const orgId = access.session.orgId;

  if (action === "plan") {
    if (!body.goal || typeof body.goal !== "string") return json({ error: "goal is required" }, 400);
    const plan = buildPlan(body.goal);
    return json({ status: "planned", plan });
  }

  if (action === "execute") {
    const goal = typeof body.goal === "string" ? body.goal : "";
    const plan = body.plan || buildPlan(goal);
    if (!goal && !body.plan) return json({ error: "goal or plan is required" }, 400);

    const approval = getApproval(body.approvalId, userId, orgId, plan);
    if (requiresHumanApproval(plan) && !approval) {
      return json({ status: "approval_required", approval: { required: true } }, 200);
    }

    const result = await createAgentRuntime({
      modelGateway: createModelGateway(env)
    }).run({
      goal: goal || plan.goal || "",
      plan,
      context: {
        ...(body.context || {}),
        userId,
        orgId,
        approved: Boolean(approval)
      },
      env
    });
    return json({ product: "UZMO", plan, ...result });
  }

  if (action === "approve") {
    const plan = body.plan;
    if (!plan) return json({ error: "plan is required" }, 400);
    if (!requiresHumanApproval(plan)) return json({ error: "Approval is not required for this plan." }, 400);
    const approval = createApprovalRequest(plan, userId);
    const record = { ...approval, orgId, status: "approved", expiresAt: Date.now() + 10 * 60 * 1000 };
    approvals.set(approval.id, record);
    return json({
      status: "approved",
      approval: {
        id: approval.id,
        status: record.status,
        created_at: approval.created_at,
        expires_at: new Date(record.expiresAt).toISOString()
      }
    });
  }

  if (action === "memory.add") {
    const item = memory.add({ ...(body.item || {}), userId, orgId });
    return json({ status: "stored", item });
  }

  if (action === "memory.list") {
    return json({ status: "ok", items: memory.list().filter(item => item.userId === userId && item.orgId === orgId) });
  }

  if (action === "memory.clear") {
    memory.clear(item => item.userId === userId && item.orgId === orgId);
    return json({ status: "cleared" });
  }

  return json({ error: "Unknown runtime action" }, 400);
}

function getApproval(id, userId, orgId, plan) {
  if (!id) return null;
  const record = approvals.get(id);
  if (!record || record.expiresAt <= Date.now()) {
    if (record) approvals.delete(id);
    return null;
  }
  if (record.user_id !== userId || record.orgId !== orgId) return null;
  if (JSON.stringify(record.plan) !== JSON.stringify(plan)) return null;
  return record;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
