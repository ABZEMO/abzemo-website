import { buildPlan } from "../orchestrator/planner.js";
import { createAgentRuntime } from "../agents/runtime.js";
import { createModelGateway } from "../core/model-gateway.js";
import { requiresHumanApproval, createApprovalRequest } from "../core/approval.js";
import { transitionJob } from "./jobs.js";
import { createApprovalStore } from "./approval-store.js";

export async function executeJob(job, { workflowStore, jobStore, env = {} }) {
  const workflow = await workflowStore.get(job.workflowId, job.input?.orgId || job.orgId);
  if (!workflow) {
    return await jobStore.put(transitionJob(job, "failed", { error: "Workflow not found." }));
  }

  try {
    const goal = job.input?.goal || workflow.goal || workflow.name;
    const plan = buildPlan(goal);

    let approved = false;
    if (requiresHumanApproval(plan)) {
      const approvalId = typeof job.input?.approvalId === "string" ? job.input.approvalId : "";
      if (approvalId && job.input?.approved === true && env?.UZMO_DB) {
        const approval = await createApprovalStore(env).get(approvalId, job.input?.orgId || job.orgId);
        approved = Boolean(approval && approval.status === "approved" && approval.jobId === job.id && approval.requestedBy === job.input?.userId);
      }
      if (!approved) {
        return await jobStore.put(
          transitionJob(
            { ...job, status: "running" },
            "paused",
            {
              result: {
                status: "approval_required",
                approval: createApprovalRequest(plan, job.input?.userId || "system")
              }
            }
          )
        );
      }
    }

    const result = await createAgentRuntime({ modelGateway: createModelGateway(env) }).run({
      goal,
      plan,
      context: {
        ...(job.input?.context || {}),
        userId: job.input?.userId,
        orgId: job.input?.orgId,
        env
      },
      env
    });

    const status = result.status === "failed" ? "failed" : "completed";
    return await jobStore.put(transitionJob({ ...job, status: "running" }, status, { result }));
  } catch (error) {
    return await jobStore.put(
      transitionJob({ ...job, status: "running" }, "failed", {
        error: error.message || "Job execution failed"
      })
    );
  }
}
