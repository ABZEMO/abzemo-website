const REQUIRED_ENV = {
  google_workspace: ["UZMO_GOOGLE_CLIENT_ID", "UZMO_GOOGLE_CLIENT_SECRET"],
  sap_erp: ["UZMO_SAP_BASE_URL"],
  sql_database: ["UZMO_SQL_HOST", "UZMO_SQL_DATABASE", "UZMO_SQL_USERNAME", "UZMO_SQL_PASSWORD"],
  rest_api: ["UZMO_REST_BASE_URL"]
};

function readiness(connector) {
  const keys = REQUIRED_ENV[connector];
  if (!keys) return { ok: false, error: "unsupported_connector" };
  const configured = keys.filter(key => typeof process.env[key] === "string" && process.env[key].trim());
  return {
    ok: configured.length === keys.length,
    connector,
    stage: "runtime_secret_readiness",
    required: keys.length,
    configured: configured.length,
    missing: keys.filter(key => !configured.includes(key)),
    message: configured.length === keys.length
      ? "Runtime secret configuration is present. Live connector authentication is still required."
      : "Runtime secret configuration is incomplete. No external system was contacted."
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  const connector = typeof req.query?.connector === "string" ? req.query.connector : "";
  const result = readiness(connector);
  res.statusCode = result.error ? 400 : 200;
  return res.end(JSON.stringify(result));
};
