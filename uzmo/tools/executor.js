import { getTool } from "./registry.js";\nimport { createGoogleWorkspace } from "../integrations/google-workspace.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createToolExecutor({ fetchImpl = fetch } = {}) {
  return {
    async execute(toolId, input = {}, context = {}) {
      const tool = getTool(toolId);
      if (!tool) throw new Error(`Unknown UZMO tool: ${toolId}`);

      if (tool.requiresApproval && !context.approved) {
        return {
          status: "approval_required",
          tool: toolId,
          message: "Human approval is required before this side effect can run."
        };
      }

      if (toolId === "webhook") return executeWebhook(fetchImpl, input);\n      if (["gmail","google_calendar","google_drive","google_sheets"].includes(toolId)) return executeGoogle(toolId,input,context);
      if (toolId === "http_api") return executeHttpApi(fetchImpl, input, context);

      return {
        status: "adapter_pending",
        tool: toolId,
        message: "The tool is registered and selected, but its provider adapter is not configured.",
        input
      };
    }
  };
}

async function executeWebhook(fetchImpl, input) {
  const url = String(input.url || "");
  if (!/^https?:\/\//i.test(url)) throw new Error("A valid webhook URL is required.");
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input.body ?? {})
  });
  return { status: response.ok ? "completed" : "failed", tool: "webhook", http_status: response.status };
}

async function executeHttpApi(fetchImpl, input, context) {
  const url = String(input.url || "");
  if (!/^https?:\/\//i.test(url)) throw new Error("A valid HTTP API URL is required.");
  const method = String(input.method || "GET").toUpperCase();
  if (!SAFE_METHODS.has(method) && !context.approved) {
    return { status: "approval_required", tool: "http_api", message: "Approval required for a state-changing HTTP request." };
  }
  const response = await fetchImpl(url, {
    method,
    headers: input.headers || {},
    body: SAFE_METHODS.has(method) ? undefined : JSON.stringify(input.body ?? {})
  });
  return { status: response.ok ? "completed" : "failed", tool: "http_api", http_status: response.status };
}
