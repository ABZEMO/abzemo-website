import { createJob } from "../workflows/jobs.js";
import { createRuntimeStores } from "../workflows/runtime-stores.js";
import { guard } from "../auth/runtime-guard.js";

export async function handleJobs(request, env) {
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;

  const stores = createRuntimeStores(env);
  if (request.method === "GET") {
    const jobs = (await stores.jobs.list()).filter(job => job.input?.orgId === access.session.orgId);
    return json({ jobs, persistence: stores.durable ? "d1" : "memory" });
  }
  if (request.method !== "POST") return json({ error: "GET or POST required" }, 405);

  const body = await request.json().catch(() => ({}));
  body.input = { ...(body.input || {}), userId: access.session.userId, orgId: access.session.orgId };
  try {
    const job = createJob(body);
    await stores.jobs.put(job);
    return json({ status: "queued", job, persistence: stores.durable ? "d1" : "memory" }, 202);
  } catch (error) {
    return json({ error: error.message || "Unable to create job" }, 400);
  }
}
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
