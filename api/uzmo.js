// UZMO Vercel runtime endpoint
// Production runtime validation trigger.
let runtimePromise;

async function getRuntime() {
  if (!runtimePromise) runtimePromise = import("../uzmo/api/runtime.js");
  return runtimePromise;
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function readJsonBody(req) {
  // Agar Vercel ne body pehle hi parse kar li ho
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return parseJson(req.body.toString("utf8"));
    if (typeof req.body === "string") return parseJson(req.body);
    if (typeof req.body === "object") return req.body;
  }

  // Warna stream se khud padho
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return parseJson(Buffer.concat(chunks).toString("utf8"));
}

function parseJson(text) {
  const raw = String(text).replace(/^\uFEFF/, "").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw badRequest("Invalid JSON body");
  }
}

async function handler(req, res) {
  try {
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
}

module.exports = handler;

// Vercel ka automatic body parser band rakho (handler ke baad set karna zaroori hai)
module.exports.config = {
  api: { bodyParser: false }
};
