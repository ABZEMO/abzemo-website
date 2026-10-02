// UZMO Vercel runtime endpoint
// Production runtime validation trigger.
let runtimePromise;

async function getRuntime() {
  if (!runtimePromise) runtimePromise = import("../uzmo/api/runtime.js");
  return runtimePromise;
}

module.exports.config = {
  api: { bodyParser: false }
};

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8").replace(/^\\uFEFF/, "").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET" && req.query?.diagnostic === "zoho") {
      const { createZohoCrmClient } = await import("../uzmo/integrations/zoho-crm.js");
      const client = createZohoCrmClient({ env: process.env });
      try {
        const result = await client.health();
        return res.status(200).json({ status: "connected", result });
      } catch (error) {
        console.error("UZMO Zoho diagnostic", error);
        return res.status(502).json({
          status: "failed",
          error: error?.message || "Zoho diagnostic failed"
        });
      }
    }

    const { handleRuntime } = await getRuntime();
    const body = req.method === "POST" ? await readJsonBody(req) : {};
    const request = new Request("https://www.abzemo.com/api/uzmo", {
      method: req.method || "POST",
      headers: { "content-type": "application/json" },
      body: req.method === "POST" ? JSON.stringify(body) : undefined
    });
    const response = await handleRuntime(request, process.env);
    const text = await response.text();
    res.status(response.status);
    for (const [key, value] of response.headers.entries()) res.setHeader(key, value);
    return res.send(text);
  } catch (error) {
    console.error("UZMO runtime error", error);
    return res.status(error?.statusCode === 400 ? 400 : 500).json({
      error: error?.message || "UZMO runtime failed"
    });
  }
};
