import { buildPlan } from "../orchestrator/planner.js";
import { createAgentRuntime } from "../agents/runtime.js";
import { createModelGateway } from "../core/model-gateway.js";
import { guard } from "../auth/runtime-guard.js";

export async function handleAgent(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const access = await guard(request, env);
  if (!access.ok) return access.response;
  const body = await request.json().catch(() => ({}));
  if (!body.goal || typeof body.goal !== "string") return json({ error: "goal is required" }, 400);
  const plan = buildPlan(body.goal);
  const result = await createAgentRuntime({ modelGateway: createModelGateway(env) }).run({
    goal: body.goal,
    plan,
    context: { ...(body.context || {}), userId: access.session.userId, orgId: access.session.orgId },
    env
  });
  return json({ product: "UZMO", plan, ...result });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
