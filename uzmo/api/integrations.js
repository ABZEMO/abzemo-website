import { listConnectorManifests } from "../integrations/manifest.js";

export async function handleIntegrations(request) {
  if (request.method === "GET") return json({ integrations: listConnectorManifests() });
  return json({ error: "GET required" }, 405);
}
function json(payload, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
