// UZMO Vercel runtime endpoint
let runtimePromise;

async function getRuntime() {
  if (!runtimePromise) runtimePromise = import("../uzmo/api/runtime.js");
  return runtimePromise;
}

module.exports = async function handler(req, res) {
  try {
    const { handleRuntime } = await getRuntime();
    const body = req.body && typeof req.body === "object"
      ? req.body
      : {};
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
    return res.status(500).json({ error: error?.message || "UZMO runtime failed" });
  }
};
