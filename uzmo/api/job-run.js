import { createWorkflowStore } from "../workflows/store.js";
import { createJobStore } from "../workflows/job-store.js";
import { executeJob } from "../workflows/executor.js";
import { guard } from "../auth/runtime-guard.js";

export async function handleJobRun(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;
  const body = await request.json().catch(() => ({}));
  if (!body.jobId || typeof body.jobId !== "string") return json({ error: "jobId is required" }, 400);
  const workflows = createWorkflowStore();
  const jobs = createJobStore(env);
  const job = await jobs.get(body.jobId);
  if (!job) return json({ error: "Job not found" }, 404);
  if (job.input?.userId && job.input.userId !== access.session.userId && access.session.role !== "owner") {
    return json({ error: "Forbidden." }, 403);
  }
  return json({ status: "executed", job: await executeJob(job, { workflowStore: workflows, jobStore: jobs, env }) });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
