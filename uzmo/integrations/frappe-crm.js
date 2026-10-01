const DEFAULT_TIMEOUT_MS = 15000;

function normalizeBaseUrl(baseUrl) {
  const value = String(baseUrl || "").trim().replace(/\/+$/, "");
  if (!/^https:\/\//i.test(value)) throw new Error("Frappe CRM base URL must use HTTPS.");
  return value;
}
function createHeaders(apiKey, apiSecret) {
  if (!apiKey || !apiSecret) throw new Error("Frappe CRM API credentials are required.");
  return { Accept: "application/json", "Content-Type": "application/json", Authorization: "token " + apiKey + ":" + apiSecret };
}
function withTimeout(fetchImpl, timeoutMs) {
  return async (url, options) => {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try { return await fetchImpl(url, { ...options, ...(controller ? { signal: controller.signal } : {}) }); }
    finally { if (timer) clearTimeout(timer); }
  };
}
async function request(fetchImpl, baseUrl, headers, path, options = {}) {
  const response = await fetchImpl(baseUrl + path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!response.ok) throw new Error(body?.exception || body?.message || body?.exc || ("Frappe CRM request failed (" + response.status + ")."));
  return body;
}
export function createFrappeCrmClient({ baseUrl, apiKey, apiSecret, fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const root = normalizeBaseUrl(baseUrl);
  const fetchWithTimeout = withTimeout(fetchImpl, timeoutMs);
  const headers = createHeaders(apiKey, apiSecret);
  return {
    async health() {
      const result = await request(fetchWithTimeout, root, headers, "/api/method/frappe.auth.get_logged_user");
      return { status: "connected", user: result.message };
    },
    async list(doctype, { filters, fields, limit = 20, offset = 0 } = {}) {
      const params = new URLSearchParams();
      params.set("limit_page_length", String(Math.min(Math.max(Number(limit) || 20, 1), 100)));
      params.set("limit_start", String(Math.max(Number(offset) || 0, 0)));
      if (fields) params.set("fields", JSON.stringify(fields));
      if (filters) params.set("filters", JSON.stringify(filters));
      return request(fetchWithTimeout, root, headers, "/api/resource/" + encodeURIComponent(doctype) + "?" + params);
    },
    async get(doctype, name) {
      if (!name) throw new Error("A Frappe document name is required.");
      return request(fetchWithTimeout, root, headers, "/api/resource/" + encodeURIComponent(doctype) + "/" + encodeURIComponent(name));
    },
    async create(doctype, data, { approved = false } = {}) {
      if (!approved) return { status: "approval_required", action: "create", doctype };
      if (!data || typeof data !== "object") throw new Error("Document data is required.");
      return request(fetchWithTimeout, root, headers, "/api/resource/" + encodeURIComponent(doctype), { method: "POST", body: JSON.stringify(data) });
    },
    async update(doctype, name, data, { approved = false } = {}) {
      if (!approved) return { status: "approval_required", action: "update", doctype, name };
      if (!name) throw new Error("A Frappe document name is required.");
      if (!data || typeof data !== "object") throw new Error("Update data is required.");
      return request(fetchWithTimeout, root, headers, "/api/resource/" + encodeURIComponent(doctype) + "/" + encodeURIComponent(name), { method: "PUT", body: JSON.stringify(data) });
    },
    async createLead(data, options) { return this.create("CRM Lead", data, options); },
    async createDeal(data, options) { return this.create("CRM Deal", data, options); },
    async listLeads(options) { return this.list("CRM Lead", options); },
    async listDeals(options) { return this.list("CRM Deal", options); }
  };
}
