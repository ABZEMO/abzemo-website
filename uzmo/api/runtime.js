import { buildPlan } from "../orchestrator/planner.js";
import { createAgentRuntime } from "../agents/runtime.js";
import { createModelGateway } from "../core/model-gateway.js";
import { createApprovalRequest, requiresHumanApproval } from "../core/approval.js";
import { createApprovalToken, verifyApprovalToken } from "../core/approval-token.js";
import { createMemoryStore } from "../memory/store.js";
import { guard } from "../auth/runtime-guard.js";
import { createJob, transitionJob } from "../workflows/jobs.js";
import { createJobStore } from "../workflows/job-store.js";

const memory = createMemoryStore();

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
    return json({ status: "planned", plan: buildPlan(body.goal) });
  }

  if (action === "execute") {
    const goal = typeof body.goal === "string" ? body.goal : "";
    const plan = body.plan || buildPlan(goal);
    if (!goal && !body.plan) return json({ error: "goal or plan is required" }, 400);
    const approval = await verifyApprovalToken(body.approvalToken, env.UZMO_APPROVAL_SECRET, userId, orgId, plan);
    if (requiresHumanApproval(plan) && !approval) return json({ status: "approval_required", approval: { required: true } }, 200);
    const jobStore = createJobStore(env);
    const job = createJob({
      workflowId: body.workflowId || "uzmo.execute",
      input: { goal: goal || plan.goal || "", plan, context: body.context || {}, userId, orgId }
    });
    await jobStore.put(job);
    await jobStore.put(transitionJob(job, "running", { attempts: 1 }));

    const result = await createAgentRuntime({ modelGateway: createModelGateway(env) }).run({
      goal: goal || plan.goal || "",
      plan,
      context: { ...(body.context || {}), userId, orgId, approved: Boolean(approval) },
      env
    });
    const status = result.status === "approval_required" ? "paused" : result.status === "failed" ? "failed" : "completed";
    const completedJob = transitionJob({ ...job, status: "running", attempts: 1 }, status, { result });
    await jobStore.put(completedJob);
    return json({ product: "UZMO", jobId: job.id, durablePersistence: jobStore.configured, plan, ...result });
  }

  if (action === "job.get") {
    if (!body.jobId || typeof body.jobId !== "string") return json({ error: "jobId is required" }, 400);
    const job = await createJobStore(env).get(body.jobId);
    return json({ status: job ? "ok" : "not_found", job });
  }

  if (action === "job.list") {
    return json({ status: "ok", jobs: await createJobStore(env).list() });
  }

  if (action === "approve") {
    const plan = body.plan;
    if (!plan) return json({ error: "plan is required" }, 400);
    if (!requiresHumanApproval(plan)) return json({ error: "Approval is not required for this plan." }, 400);
    if (!env.UZMO_APPROVAL_SECRET) return json({ error: "UZMO approval secret is not configured." }, 503);
    const approval = createApprovalRequest(plan, userId);
    const { token, expiresAt } = await createApprovalToken({ id: approval.id, userId, orgId, plan }, env.UZMO_APPROVAL_SECRET);
    return json({ status: "approved", approval: { id: approval.id, token, status: "approved", created_at: approval.created_at, expires_at: new Date(expiresAt).toISOString() } });
  }

  if (action === "memory.add") return json({ status: "stored", item: memory.add({ ...(body.item || {}), userId, orgId }) });
  if (action === "memory.list") return json({ status: "ok", items: memory.list().filter(item => item.userId === userId && item.orgId === orgId) });
  if (action === "memory.clear") {
    memory.clear(item => item.userId === userId && item.orgId === orgId);
    return json({ status: "cleared" });
  }
  return json({ error: "Unknown runtime action" }, 400);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}
