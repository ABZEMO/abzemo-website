import { listConnectorManifests } from "../integrations/manifest.js";
import { guard } from "../auth/runtime-guard.js";

export async function handleIntegrations(request, env) {
  const access = await guard(request, env, "execute_safe");
  if (!access.ok) return access.response;
  if (request.method === "GET") return json({ integrations: listConnectorManifests() });
  return json({ error: "GET required" }, 405);
}
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
