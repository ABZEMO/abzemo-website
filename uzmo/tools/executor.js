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
    body
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
\nfunction assertPlainObject(value, label) {\n  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(label + " must be an object.");\n}\n\nfunction validateExternalUrl(value, label) {\n  if (typeof value !== "string" || !value.trim()) throw new Error("A valid " + label + " URL is required.");\n  const raw = value.trim();\n  if (raw.length > MAX_URL_LENGTH) throw new Error(label + " URL is too long.");\n  let url;\n  try { url = new URL(raw); } catch { throw new Error("A valid " + label + " URL is required."); }\n  if (!["http:", "https:"].includes(url.protocol)) throw new Error(label + " URL must use HTTP or HTTPS.");\n  const host = url.hostname.toLowerCase();\n  if (host === "localhost" || host.endsWith(".localhost") || host === "metadata.google.internal" || host === "metadata.google") throw new Error(label + " URL targets a blocked host.");\n  if (isPrivateIp(host)) throw new Error(label + " URL targets a blocked private or loopback address.");\n  return url.toString();\n}\n\nfunction isPrivateIp(host) {\n  const v4 = host.match(/^(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)$/);\n  if (v4) {\n    const octets = v4.slice(1).map(Number);\n    if (octets.some(n => n > 255)) return true;\n    const [a,b] = octets;\n    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);\n  }\n  return host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");\n}\n\nfunction validateHeaders(value) {\n  assertPlainObject(value, "HTTP headers");\n  const entries = Object.entries(value);\n  if (entries.length > MAX_HEADER_COUNT) throw new Error("Too many HTTP headers.");\n  const headers = {};\n  for (const [name, rawValue] of entries) {\n    if (!/^[!#$%&+.^_|~0-9A-Za-z-]+$/.test(name)) throw new Error("Invalid HTTP header name.");\n    const stringValue = String(rawValue);\n    if (stringValue.length > MAX_HEADER_VALUE_LENGTH || /[\\r\\n]/.test(stringValue)) throw new Error("Invalid HTTP header value.");\n    headers[name] = stringValue;\n  }\n  return headers;\n}\n\nfunction serializeJsonBody(value, label) {\n  let serialized;\n  try { serialized = JSON.stringify(value); } catch { throw new Error(label + " must be JSON-serializable."); }\n  if (serialized === undefined) throw new Error(label + " must be JSON-serializable.");\n  if (new TextEncoder().encode(serialized).byteLength > MAX_BODY_BYTES) throw new Error(label + " exceeds the maximum allowed size.");\n  return serialized;\n}\n