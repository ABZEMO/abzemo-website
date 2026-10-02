import { getTool } from "./registry.js";
import { createZohoCrmClient } from "../integrations/zoho-crm.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createToolExecutor({ fetchImpl = fetch } = {}) {
  return {
    async execute(toolId, input = {}, context = {}) {
      const tool = getTool(toolId);
      if (!tool) throw new Error(`Unknown UZMO tool: ${toolId}`);

      if (toolId === "zoho_crm") return executeZohoCrm(fetchImpl, input, context);
      if (tool.requiresApproval && !context.approved) {
        return { status: "approval_required", tool: toolId, message: "Human approval is required before this side effect can run." };
      }

      if (toolId === "webhook") return executeWebhook(fetchImpl, input);
      if (toolId === "http") return executeHttpApi(fetchImpl, input, context);

      return {
        status: "adapter_pending",
        tool: toolId,
        message: "The tool is registered and selected, but its provider adapter is not configured.",
        input
      };
    }
  };
}

async function executeZohoCrm(fetchImpl, input, context) {
  const env = context.env || {};
  const client = createZohoCrmClient({ env, fetchImpl });
  const action = String(input.action || "health").toLowerCase();
  if (["create", "update"].includes(action) && !context.approved) {
    return { status: "approval_required", tool: "zoho_crm", action };
  }
  if (action === "health") return client.health();
  if (action === "list") return client.list(String(input.doctype || "CRM Lead"), input.options || {});
  if (action === "get") return client.get(String(input.doctype || "CRM Lead"), input.name);
  if (action === "create") return client.create(String(input.doctype || "CRM Lead"), input.data, { approved: true });
  if (action === "update") return client.update(String(input.doctype || "CRM Lead"), input.name, input.data, { approved: true });
  throw new Error("Unsupported Zoho CRM action: " + action);
}

async function executeWebhook(fetchImpl, input) {
  const url = String(input.url || "");
  if (!/^https?:\/\//i.test(url)) throw new Error("A valid webhook URL is required.");
  const response = await fetchImpl(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input.body ?? {}) });
  return { status: response.ok ? "completed" : "failed", tool: "webhook", http_status: response.status };
}

async function executeHttpApi(fetchImpl, input, context) {
  const url = String(input.url || "");
  if (!/^https?:\/\//i.test(url)) throw new Error("A valid HTTP API URL is required.");
  const method = String(input.method || "GET").toUpperCase();
  if (!SAFE_METHODS.has(method) && !context.approved) return { status: "approval_required", tool: "http", message: "Approval required for a state-changing HTTP request." };
  const response = await fetchImpl(url, { method, headers: input.headers || {}, body: SAFE_METHODS.has(method) ? undefined : JSON.stringify(input.body ?? {}) });
  return { status: response.ok ? "completed" : "failed", tool: "http", http_status: response.status };
}
