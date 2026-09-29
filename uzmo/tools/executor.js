import { getTool } from "./registry.js";
import { createGoogleWorkspace } from "../integrations/google-workspace.js";
import { createGoogleConnectionStore } from "../integrations/google-connections.js";
import { executeInstagram, executeLinkedIn, executeYouTube } from "../integrations/social.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const SOCIAL_SIDE_EFFECTS = new Set(["youtube:upload", "instagram:publish", "linkedin:publish"]);
const GOOGLE_SIDE_EFFECTS = new Set([
  "gmail:send",
  "google_calendar:create",
  "google_sheets:update"
]);
const MAX_URL_LENGTH = 2048;
const MAX_HEADER_COUNT = 50;
const MAX_HEADER_VALUE_LENGTH = 4096;
const MAX_BODY_BYTES = 256 * 1024;

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

      const socialAction = toolId + ":" + String(input.action || "");
      if (SOCIAL_SIDE_EFFECTS.has(socialAction) && !context.approved) {
        return { status: "approval_required", tool: toolId, message: "Human approval is required before publishing social content." };
      }
      if (toolId === "youtube" && input.action === "upload") return executeYouTube(input, context, fetchImpl);
      if (toolId === "instagram" && input.action === "publish") return executeInstagram(input, context, fetchImpl);
      if (toolId === "linkedin" && input.action === "publish") return executeLinkedIn(input, context, fetchImpl);
      if (toolId === "webhook") return executeWebhook(fetchImpl, input, context);
      if (["gmail", "google_calendar", "google_drive", "google_sheets"].includes(toolId)) {
        return executeGoogle(toolId, input, context);
      }
      if (toolId === "http" || toolId === "http_api") {
        return executeHttpApi(fetchImpl, input, context);
      }

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

  const url = validateExternalUrl(input.url, "webhook");
  const body = serializeJsonBody(input.body ?? {}, "Webhook body");
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body
  });
  return {
    status: response.ok ? "completed" : "failed",
    tool: "webhook",
    http_status: response.status
  };
}

async function executeHttpApi(fetchImpl, input, context) {
  const url = validateExternalUrl(input.url, "HTTP API");
  const method = String(input.method || "GET").toUpperCase();

  if (!SAFE_METHODS.has(method) && !context.approved) {
    return {
      status: "approval_required",
      tool: "http_api",
      message: "Approval required for a state-changing HTTP request."
    };
  }

  const headers = validateHeaders(input.headers || {});
  const body = SAFE_METHODS.has(method)
    ? undefined
    : serializeJsonBody(input.body ?? {}, "HTTP request body");

  const response = await fetchImpl(url, {
    method,
    headers,
    body
  });

  return {
    status: response.ok ? "completed" : "failed",
    tool: "http_api",
    http_status: response.status
  };
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
      return {
        status: "completed",
        tool: toolId,
        data: await google.listMessages(
          accessToken,
          input.query || "",
          Math.min(Number(input.maxResults || 20), 100)
        )
      };
    }
    if (toolId === "gmail" && input.action === "send") {
      return { status: "completed", tool: toolId, data: await google.sendMessage(accessToken, input) };
    }
    if (toolId === "google_calendar" && input.action === "list") {
      return {
        status: "completed",
        tool: toolId,
        data: await google.listEvents(accessToken, input.timeMin, input.timeMax)
      };
    }
    if (toolId === "google_calendar" && input.action === "create") {
      return {
        status: "completed",
        tool: toolId,
        data: await google.createEvent(accessToken, input.event || {})
      };
    }
    if (toolId === "google_drive" && input.action === "list") {
      return {
        status: "completed",
        tool: toolId,
        data: await google.listFiles(accessToken, input.q || "")
      };
    }
    if (toolId === "google_sheets" && input.action === "read") {
      return {
        status: "completed",
        tool: toolId,
        data: await google.listSheetValues(accessToken, input.spreadsheetId, input.range)
      };
    }
    if (toolId === "google_sheets" && input.action === "update") {
      return {
        status: "completed",
        tool: toolId,
        data: await google.updateSheetValues(
          accessToken,
          input.spreadsheetId,
          input.range,
          input.values
        )
      };
    }

    return {
      status: "failed",
      tool: toolId,
      message: "Unsupported Google Workspace action."
    };
  } catch (error) {
    return {
      status: "failed",
      tool: toolId,
      message: error.message || "Google Workspace request failed."
    };
  }
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(label + " must be an object.");
  }
}

function validateExternalUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("A valid " + label + " URL is required.");
  }

  const raw = value.trim();
  if (raw.length > MAX_URL_LENGTH) throw new Error(label + " URL is too long.");

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("A valid " + label + " URL is required.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(label + " URL must use HTTP or HTTPS.");
  }

  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "metadata.google.internal" ||
    host === "metadata.google"
  ) {
    throw new Error(label + " URL targets a blocked host.");
  }

  if (isPrivateIp(host)) {
    throw new Error(label + " URL targets a blocked private or loopback address.");
  }

  return url.toString();
}

function isPrivateIp(host) {
  const v4 = host.match(/^(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)$/);
  if (v4) {
    const octets = v4.slice(1).map(Number);
    if (octets.some(n => n > 255)) return true;
    const [a, b] = octets;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }

  return (
    host === "::1" ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80:")
  );
}

function validateHeaders(value) {
  assertPlainObject(value, "HTTP headers");
  const entries = Object.entries(value);
  if (entries.length > MAX_HEADER_COUNT) throw new Error("Too many HTTP headers.");

  const headers = {};
  for (const [name, rawValue] of entries) {
    if (!/^[!#$%&+.^_|~0-9A-Za-z-]+$/.test(name)) {
      throw new Error("Invalid HTTP header name.");
    }

    const stringValue = String(rawValue);
    if (stringValue.length > MAX_HEADER_VALUE_LENGTH || /[\\r\\n]/.test(stringValue)) {
      throw new Error("Invalid HTTP header value.");
    }

    headers[name] = stringValue;
  }

  return headers;
}

function serializeJsonBody(value, label) {
  let serialized;
  try {
    serialized = JSON.stringify(value);
  } catch {
    throw new Error(label + " must be JSON-serializable.");
  }

  if (serialized === undefined) throw new Error(label + " must be JSON-serializable.");

  if (new TextEncoder().encode(serialized).byteLength > MAX_BODY_BYTES) {
    throw new Error(label + " exceeds the maximum allowed size.");
  }

  return serialized;
}
