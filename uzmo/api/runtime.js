import { buildPlan } from "../orchestrator/planner.js";
import { createApprovalRequest, requiresHumanApproval } from "../core/approval.js";
import { createWorkflowDefinition } from "../workflows/definition.js";
import { createJob } from "../workflows/jobs.js";
import { createRuntimeStores } from "../workflows/runtime-stores.js";
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
        approval: createApprovalRequest(plan, access.session.userId)
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

    const goal = normalizeGoal(body.goal);
    if (!goal) return json({ error: "goal is required" }, 400);

    const plan = buildPlan(goal);
    if (!requiresHumanApproval(plan)) {
      return json({ error: "This goal does not require human approval." }, 400);
    }

    return json({
      status: "pending",
      approval: createApprovalRequest(plan, access.session.userId)
    }, 202);
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
