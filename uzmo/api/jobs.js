import { createJob } from "../workflows/jobs.js";
import { createRuntimeStores } from "../workflows/runtime-stores.js";
import { guard } from "../auth/runtime-guard.js";

export async function handleJobs(request, env) {
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;

  const stores = createRuntimeStores(env);

  if (request.method === "GET") {
    const jobs = (await stores.jobs.list()).filter(job =>
      job.input?.orgId === access.session.orgId &&
      job.input?.userId === access.session.userId
    );
    return json({ jobs, persistence: stores.durable ? "d1" : "memory" });
  }

  if (request.method !== "POST") return json({ error: "GET or POST required" }, 405);

  const body = await request.json().catch(() => ({}));
  if (!body.workflowId || typeof body.workflowId !== "string") {
    return json({ error: "workflowId is required" }, 400);
  }

  const workflow = await stores.workflows.get(body.workflowId, access.session.orgId);
  if (!workflow) return json({ error: "Workflow not found" }, 404);

  const job = createJob({
    workflowId: workflow.id,
    input: {
      ...(body.input || {}),
      userId: access.session.userId,
      orgId: access.session.orgId
    },
    scheduledFor: body.scheduledFor || null,
    scheduleKey: body.scheduleKey || null
  });

  await stores.jobs.put(job);
  return json({
    status: "queued",
    job,
    persistence: stores.durable ? "d1" : "memory"
  }, 202);
}
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
