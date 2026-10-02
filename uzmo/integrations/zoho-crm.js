const DEFAULT_TIMEOUT_MS = 15000;
const REGION_HOSTS = {
  com: { accounts: "https://accounts.zoho.com", api: "https://www.zohoapis.com" },
  eu: { accounts: "https://accounts.zoho.eu", api: "https://www.zohoapis.eu" },
  in: { accounts: "https://accounts.zoho.in", api: "https://www.zohoapis.in" },
  au: { accounts: "https://accounts.zoho.com.au", api: "https://www.zohoapis.com.au" },
  jp: { accounts: "https://accounts.zoho.jp", api: "https://www.zohoapis.jp" },
  ca: { accounts: "https://accounts.zohocloud.ca", api: "https://www.zohoapis.ca" },
  sa: { accounts: "https://accounts.zoho.sa", api: "https://www.zohoapis.sa" }
};

let accessTokenCache = { token: "", expiresAt: 0 };

function getHosts(region) {
  return REGION_HOSTS[String(region || "com").toLowerCase()] || REGION_HOSTS.com;
}

function requireEnv(env) {
  for (const key of ["UZMO_ZOHO_CLIENT_ID", "UZMO_ZOHO_CLIENT_SECRET", "UZMO_ZOHO_REFRESH_TOKEN"]) {
    if (!env[key]) throw new Error("Zoho CRM configuration is incomplete.");
  }
}

async function getAccessToken(fetchImpl, env) {
  requireEnv(env);
  if (accessTokenCache.token && Date.now() < accessTokenCache.expiresAt - 60000) return accessTokenCache.token;

  const hosts = getHosts(env.UZMO_ZOHO_REGION);
  const params = new URLSearchParams({
    refresh_token: env.UZMO_ZOHO_REFRESH_TOKEN,
    client_id: env.UZMO_ZOHO_CLIENT_ID,
    client_secret: env.UZMO_ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token"
  });
  const response = await fetchImpl(hosts.accounts + "/oauth/v2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    const error = body?.error || body?.error_description || `HTTP ${response.status}`;
    console.error("Zoho CRM OAuth token exchange failed:", error);
    throw new Error(`Zoho CRM authentication failed: ${error}`);
  }
  accessTokenCache = { token: body.access_token, expiresAt: Date.now() + Number(body.expires_in || 3600) * 1000 };
  return accessTokenCache.token;
}

function withTimeout(fetchImpl, timeoutMs) {
  return async (url, options) => {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try { return await fetchImpl(url, { ...options, ...(controller ? { signal: controller.signal } : {}) }); }
    finally { if (timer) clearTimeout(timer); }
  };
}

export function createZohoCrmClient({ env = {}, fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const requestFetch = withTimeout(fetchImpl, timeoutMs);
  const hosts = getHosts(env.UZMO_ZOHO_REGION);

  async function request(path, options = {}) {
    const token = await getAccessToken(requestFetch, env);
    const response = await requestFetch(hosts.api + "/crm/v8" + path, {
      ...options,
      headers: {
        Authorization: "Zoho-oauthtoken " + token,
        Accept: "application/json",
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    let body = {};
    try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
    if (!response.ok) throw new Error(body?.message || body?.code || "Zoho CRM request failed.");
    return body;
  }

  return {
    async health() {
      const result = await request("/users?type=CurrentUser");
      return { status: "connected", user: result?.users?.[0]?.full_name || result?.users?.[0]?.email || "authenticated" };
    },
    async list(module, options = {}) {
      const params = new URLSearchParams();
      if (options.page) params.set("page", String(Math.max(Number(options.page) || 1, 1)));
      if (options.perPage) params.set("per_page", String(Math.min(Math.max(Number(options.perPage) || 200, 1), 200)));
      if (options.fields) params.set("fields", options.fields);
      const query = params.toString();
      return request("/" + encodeURIComponent(module) + (query ? "?" + query : ""));
    },
    async get(module, id) {
      if (!id) throw new Error("Zoho CRM record id is required.");
      return request("/" + encodeURIComponent(module) + "/" + encodeURIComponent(id));
    },
    async create(module, data) {
      if (!data || typeof data !== "object") throw new Error("Zoho CRM record data is required.");
      return request("/" + encodeURIComponent(module), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: [data] })
      });
    },
    async update(module, id, data) {
      if (!id) throw new Error("Zoho CRM record id is required.");
      if (!data || typeof data !== "object") throw new Error("Zoho CRM record data is required.");
      return request("/" + encodeURIComponent(module) + "/" + encodeURIComponent(id), {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: [data] })
      });
    }
  };
}
