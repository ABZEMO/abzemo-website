import { createJob } from "../workflows/jobs.js";
import { createJobStore } from "../workflows/job-store.js";
import { guard } from "../auth/runtime-guard.js";

const store = createJobStore();

export async function handleJobs(request, env) {
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;
  if (request.method === "GET") return json({ jobs: store.list() });
  if (request.method !== "POST") return json({ error: "GET or POST required" }, 405);

  const body = await request.json().catch(() => ({}));
  body.input = { ...(body.input || {}), userId: access.session.userId, orgId: access.session.orgId };

  try {
    const job = store.put(createJob(body));
    return json({ status: "queued", job }, 202);
  } catch (error) {
    return json({ error: error.message || "Unable to create job" }, 400);
  }
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
