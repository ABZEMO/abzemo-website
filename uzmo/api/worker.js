import { buildPlan } from "../orchestrator/planner.js";
import { createModelGateway } from "../core/model-gateway.js";
import { handleRuntime } from "./runtime.js";
import { handleSecurity } from "./security.js";
import { handleMemory } from "./memory.js";
import { handleKnowledge } from "./knowledge.js";
import { handleIntegrations } from "./integrations.js";
import { handleAgent } from "./agent.js";
import { handleAutomations } from "./automations.js";
import { handleStudio } from "./studio.js";
import { handleJobs } from "./jobs.js";
import { handleTriggers } from "./triggers.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "uzmo-api", version: "0.1.0" });

    if (url.pathname === "/api/plan" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      try { return json({ status: "planned", ...buildPlan(body.goal) }); }
      catch (error) { return json({ error: error.message || "Unable to build plan" }, 400); }
    }
    if (url.pathname === "/api/agent") {
      try { return withCors(await handleAgent(request, env)); }
      catch (error) { return json({ error: error.message || "Agent request failed" }, 500); }
    }
    if (url.pathname === "/api/triggers") {
      try { return withCors(await handleTriggers(request)); }
      catch (error) { return json({ error: error.message || "Trigger request failed" }, 500); }
    }
    if (url.pathname === "/api/jobs") {
      try { return withCors(await handleJobs(request)); }
      catch (error) { return json({ error: error.message || "Job request failed" }, 500); }
    }
    if (url.pathname === "/api/studio") {
      try { return withCors(await handleStudio(request)); }
      catch (error) { return json({ error: error.message || "Studio request failed" }, 500); }
    }
    if (url.pathname === "/api/automations") {
      try { return withCors(await handleAutomations(request)); }
      catch (error) { return json({ error: error.message || "Automation request failed" }, 500); }
    }
    if (url.pathname === "/api/integrations" && request.method === "GET") {
      return withCors(await handleIntegrations(request));
    }
    if (url.pathname === "/api/knowledge") {
      try { return withCors(await handleKnowledge(request, env)); }
      catch (error) { return json({ error: error.message || "Knowledge request failed" }, 500); }
    }
    if (url.pathname === "/api/memory") {
      try { return withCors(await handleMemory(request, env)); }
      catch (error) { return json({ error: error.message || "Memory request failed" }, 500); }
    }
    if (url.pathname === "/api/runtime") {
      try { return withCors(await handleRuntime(request)); }
      catch (error) { return json({ error: error.message || "Runtime request failed" }, 500); }
    }
    if (url.pathname === "/api/security") {
      try { return withCors(await handleSecurity(request, env)); }
      catch (error) { return json({ error: error.message || "Security request failed" }, 500); }
    }
    if (url.pathname === "/api/model/status" && request.method === "GET") {
      const gateway = createModelGateway(env);
      return json({ product: "UZMO", configured: gateway.configured, providers: gateway.providers });
    }
    if (url.pathname === "/api/model/complete" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (!Array.isArray(body.messages) || !body.messages.length) return json({ error: "messages is required" }, 400);
      try { return json(await createModelGateway(env).complete(body.messages, body.options || {})); }
      catch (error) { return json({ error: error.message || "Model request failed" }, 502); }
    }
    return json({ error: "Not found" }, 404);
  }
};

function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}
function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
