import { buildPlan } from "../orchestrator/planner.js";
import { createApprovalRequest, requiresHumanApproval } from "../core/approval.js";
import { createWorkflowDefinition } from "../workflows/definition.js";
import { createJob } from "../workflows/jobs.js";
import { createRuntimeStores } from "../workflows/runtime-stores.js";
import { createApprovalStore } from "../workflows/approval-store.js";
import { audit } from "../auth/audit.js";
import { guard } from "../auth/runtime-guard.js";

export async function handleRuntime(request, env) {
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;
  if (request.method !== "POST") return json({ error: "POST required" }, 405);

  const body = await request.json().catch(() => ({}));
  const action = body.action || "plan";

  if (action === "plan") {
    const goal = normalizeGoal(body.goal);
    if (!goal) return json({ error: "goal is required" }, 400);
    return json({ status: "planned", plan: buildPlan(goal) });
  }

  if (action === "execute") {
    const goal = normalizeGoal(body.goal);
    if (!goal) return json({ error: "goal is required; client-supplied plans are not accepted" }, 400);

    const plan = buildPlan(goal);
    if (requiresHumanApproval(plan)) {
      return json({
        status: "approval_required",
        approval: await persistApproval(env, access.session.orgId, access.session.userId, goal, plan)
      }, 202);
    }

    const stores = createRuntimeStores(env);
    const workflow = createWorkflowDefinition({
      id: crypto.randomUUID(),
      name: plan.goal,
      orgId: access.session.orgId,
      trigger: { type: "manual" },
      steps: []
    });
    await stores.workflows.put(workflow);

    const job = createJob({
      workflowId: workflow.id,
      input: {
        goal: plan.goal,
        userId: access.session.userId,
        orgId: access.session.orgId
      }
    });
    await stores.jobs.put(job);

    return json({
      status: "queued",
      workflow,
      job,
      persistence: stores.durable ? "d1" : "memory"
    }, 202);
  }

  if (action === "approve") {
    if (access.session.role !== "owner" && access.session.role !== "admin") {
      return json({ error: "Approval requires admin or owner role." }, 403);
    }

    const approvalId = typeof body.approvalId === "string" ? body.approvalId.trim() : "";
    const goal = normalizeGoal(body.goal);
    const approvalStore = createApprovalStore(env);

    if (approvalId) {
      const pending = await approvalStore.get(approvalId, access.session.orgId);
      if (!pending || pending.requestedBy !== access.session.userId && access.session.role !== "owner" && access.session.role !== "admin") {
        return json({ error: "Approval not found." }, 404);
      }
      if (pending.status !== "pending") return json({ error: "Approval is no longer pending." }, 409);
      const plan = pending.plan;
      if (!requiresHumanApproval(plan)) return json({ error: "Approval is not required for this plan." }, 400);

      const stores = createRuntimeStores(env);
      const workflow = createWorkflowDefinition({
        id: crypto.randomUUID(),
        name: pending.goal,
        orgId: access.session.orgId,
        trigger: { type: "manual" },
        steps: []
      });
      await stores.workflows.put(workflow);
      const job = createJob({
        workflowId: workflow.id,
        input: { goal: pending.goal, userId: pending.requestedBy, orgId: access.session.orgId, approvalId: pending.id, approved: true }
      });
      await stores.jobs.put(job);
      const approved = await approvalStore.approve(approvalId, access.session.orgId, access.session.userId, job.id);
      if (!approved) return json({ error: "Approval could not be completed; it may have expired or already been used." }, 409);
      await audit(env,{userId:access.session.userId,orgId:access.session.orgId,action:"approval.approved",resource:approvalId,metadata:{jobId:job.id}});
      return json({ status:"queued", approval:approved, workflow, job },202);
    }

    if (!goal) return json({ error: "goal is required" }, 400);
    const plan = buildPlan(goal);
    if (!requiresHumanApproval(plan)) return json({ error: "This goal does not require human approval." }, 400);
    const approval = await persistApproval(env, access.session.orgId, access.session.userId, goal, plan);
    return json({ status: "pending", approval }, 202);
  }

  return json({ error: "Unknown runtime action" }, 400);
}

function normalizeGoal(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 8000) : "";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}


async function persistApproval(env, orgId, userId, goal, plan) {
  const store = createApprovalStore(env);
  const approval = await store.create({orgId,requestedBy:userId,goal,plan});
  await audit(env,{userId,orgId,action:"approval.requested",resource:approval.id,metadata:{goal}});
  return approval;
}
