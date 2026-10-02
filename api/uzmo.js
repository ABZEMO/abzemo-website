// UZMO Vercel runtime endpoint
let runtimePromise;

async function getRuntime() {
  if (!runtimePromise) runtimePromise = import("../uzmo/api/runtime.js");
  return runtimePromise;
}

async function checkFrappeHealth() {
  const { createFrappeCrmClient } = await import("../uzmo/integrations/frappe-crm.js");
  const client = createFrappeCrmClient({
    baseUrl: process.env.UZMO_FRAPPE_CRM_URL,
    apiKey: process.env.UZMO_FRAPPE_CRM_API_KEY,
    apiSecret: process.env.UZMO_FRAPPE_CRM_API_SECRET
  });
  await client.health();
  return { status: "connected" };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const health = await checkFrappeHealth();
      return res.status(200).json({ status: "ok", frappe: health.status });
    }

    const { handleRuntime } = await getRuntime();
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const request = new Request("https://www.abzemo.com/api/uzmo", {
      method: req.method || "POST",
      headers: { "content-type": "application/json" },
      body: req.method === "POST" ? JSON.stringify(body) : undefined
    });
    const response = await handleRuntime(request, process.env);
    const responseText = await response.text();
    res.status(response.status);
    for (const [key, value] of response.headers.entries()) res.setHeader(key, value);
    return res.send(responseText);
  } catch (error) {
    console.error("UZMO runtime error", error, {
      frappeUrlConfigured: Boolean(process.env.UZMO_FRAPPE_CRM_URL),
      frappeApiKeyConfigured: Boolean(process.env.UZMO_FRAPPE_CRM_API_KEY),
      frappeApiSecretConfigured: Boolean(process.env.UZMO_FRAPPE_CRM_API_SECRET)
    });
    return res.status(500).json({ error: error?.message || "UZMO runtime failed" });
  }
};
