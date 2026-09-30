const { persistToken } = require("./token-vault");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  // Internal-only adapter contract. Do not expose this endpoint publicly.
  // The caller must provide an already-issued Google token record; this endpoint
  // never accepts authorization codes or client secrets.
  if (req.headers["x-uzmo-internal"] !== process.env.UZMO_INTERNAL_SERVICE_TOKEN) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ ok: false, error: "forbidden" }));
  }

  const record = req.body || {};
  if (!record.access_token) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: "access_token_missing" }));
  }

  try {
    await persistToken(record);
    res.statusCode = 200;
    return res.end(JSON.stringify({
      ok: true,
      stage: "token_persisted",
      message: "Google token record persisted through the configured encrypted token store."
    }));
  } catch (error) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      ok: false,
      stage: "token_persistence",
      error: error.message === "token_store_not_configured"
        ? "token_store_not_configured"
        : "token_store_write_failed"
    }));
  }
};
