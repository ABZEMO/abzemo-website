import { getTool } from "./registry.js";
import { createGoogleWorkspace } from "../integrations/google-workspace.js";
import { createGoogleConnectionStore } from "../integrations/google-connections.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const GOOGLE_SIDE_EFFECTS = new Set([
  "gmail:send",
  "google_calendar:create",
  "google_sheets:update"
]);

export function createToolExecutor({ fetchImpl = fetch } = {}) {
  return {
    async execute(toolId, input = {}, context = {}) {
      const tool = getTool(toolId);
      if (!tool) throw new Error("Unknown UZMO tool: " + toolId);

      if (tool.requiresApproval && !context.approved) {
        return {
          status: "approval_required",
          tool: toolId,
          message: "Human approval is required before this side effect can run."
        };
      }

      const googleAction = toolId + ":" + String(input.action || "");
      if (GOOGLE_SIDE_EFFECTS.has(googleAction) && !context.approved) {
        return {
          status: "approval_required",
          tool: toolId,
          message: "Human approval is required before this Google Workspace side effect can run."
        };
      }

      if (toolId === "webhook") return executeWebhook(fetchImpl, input, context);
      if (["gmail", "google_calendar", "google_drive", "google_sheets"].includes(toolId)) {
        return executeGoogle(toolId, input, context);
      }
      if (toolId === "http" || toolId === "http_api") return executeHttpApi(fetchImpl, input, context);

      return {
        status: "adapter_pending",
        tool: toolId,
        message: "The tool is registered and selected, but its provider adapter is not configured.",
        input
      };
    }
  };
}

async function executeWebhook(fetchImpl, input, context) {
  if (!context.approved) {
    return {
      status: "approval_required",
      tool: "webhook",
      message: "Human approval is required before a webhook can be invoked."
    };
  }

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

async function executeGoogle(toolId, input, context) {
  const env = context.env || {};
  const google = createGoogleWorkspace(env);
  let accessToken = context.googleAccessToken;
  if (!accessToken && context.userId && context.orgId) {
    accessToken = await createGoogleConnectionStore(env).getAccessToken({
      userId: context.userId,
      orgId: context.orgId,
      google
    });
  }
  if (!accessToken) {
    return {
      status: "authorization_required",
      tool: toolId,
      message: "Connect Google Workspace before using this tool."
    };
  }

  try {
    if (toolId === "gmail" && input.action === "list") {
      return { status: "completed", tool: toolId, data: await google.listMessages(accessToken, input.query || "", Math.min(Number(input.maxResults || 20), 100)) };
    }
    if (toolId === "gmail" && input.action === "send") {
      return { status: "completed", tool: toolId, data: await google.sendMessage(accessToken, input) };
    }
    if (toolId === "google_calendar" && input.action === "list") {
      return { status: "completed", tool: toolId, data: await google.listEvents(accessToken, input.timeMin, input.timeMax) };
    }
    if (toolId === "google_calendar" && input.action === "create") {
      return { status: "completed", tool: toolId, data: await google.createEvent(accessToken, input.event || {}) };
    }
    if (toolId === "google_drive" && input.action === "list") {
      return { status: "completed", tool: toolId, data: await google.listFiles(accessToken, input.q || "") };
    }
    if (toolId === "google_sheets" && input.action === "read") {
      return { status: "completed", tool: toolId, data: await google.listSheetValues(accessToken, input.spreadsheetId, input.range) };
    }
    if (toolId === "google_sheets" && input.action === "update") {
      return { status: "completed", tool: toolId, data: await google.updateSheetValues(accessToken, input.spreadsheetId, input.range, input.values) };
    }
    return { status: "failed", tool: toolId, message: "Unsupported Google Workspace action." };
  } catch (error) {
    return { status: "failed", tool: toolId, message: error.message || "Google Workspace request failed." };
  }
}
