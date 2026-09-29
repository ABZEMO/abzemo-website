import { createRuntimeStores } from "../workflows/runtime-stores.js";
import { executeJob } from "../workflows/executor.js";
import { guard } from "../auth/runtime-guard.js";

export async function handleJobRun(request, env) {
  if (request.method !== "POST") return json({ error: "POST required" }, 405);

  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;

  const body = await request.json().catch(() => ({}));
  if (!body.jobId || typeof body.jobId !== "string") {
    return json({ error: "jobId is required" }, 400);
  }

  const stores = createRuntimeStores(env);
  const job = await stores.jobs.get(body.jobId);

  if (!job || job.input?.orgId !== access.session.orgId || job.input?.userId !== access.session.userId) {
    return json({ error: "Job not found" }, 404);
  }

  if (job.status !== "queued") {
    return json({ error: "Job is not executable from status: " + job.status }, 409);
  }

  const claimed = stores.jobs.claim
    ? await stores.jobs.claim(job.id, "manual:" + access.session.userId)
    : null;

  if (!claimed || claimed.status !== "running") {
    return json({ error: "Job could not be claimed." }, 409);
  }

  return json({
    status: "executed",
    job: await executeJob(claimed, {
      workflowStore: stores.workflows,
      jobStore: stores.jobs,
      env
    })
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
