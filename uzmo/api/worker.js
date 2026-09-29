/**
 * UZMO API boundary.
 *
 * This worker intentionally contains no provider secret and no model-specific
 * implementation. Bind provider credentials and durable services in the
 * deployment environment before enabling production execution.
 */

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
      return json({ ok: true, service: "uzmo-api" });
    }

    if (url.pathname === "/api/plan" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const goal = typeof body.goal === "string" ? body.goal.trim() : "";
      if (!goal) return json({ error: "goal is required" }, 400);

      // Production implementation: pass the goal through the UZMO
      // orchestrator and model gateway. Never expose provider secrets here.
      return json({
        status: "accepted",
        product: "UZMO",
        goal,
        next: ["understand", "plan", "select_agents", "select_tools", "execute", "verify"]
      });
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
