import { buildPlan } from "../orchestrator/planner.js";
import { createModelGateway } from "../core/model-gateway.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "uzmo-api", version: "0.1.0" });
    }

    if (url.pathname === "/api/plan" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      try {
        const plan = buildPlan(body.goal);
        return json({ status: "planned", ...plan });
      } catch (error) {
        return json({ error: error.message || "Unable to build plan" }, 400);
      }
    }

    if (url.pathname === "/api/model/status" && request.method === "GET") {
      const gateway = createModelGateway(env);
      return json({ product: "UZMO", configured: gateway.configured });
    }

    if (url.pathname === "/api/model/complete" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        return json({ error: "messages is required" }, 400);
      }
      try {
        const result = await createModelGateway(env).complete(body.messages, body.options || {});
        return json(result);
      } catch (error) {
        return json({ error: error.message || "Model request failed" }, 502);
      }
    }

    return json({ error: "Not found" }, 404);
  }
};

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
