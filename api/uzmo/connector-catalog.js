module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  res.statusCode = 200;
  return res.end(JSON.stringify({
    ok: true,
    platform: "UZMO",
    version: "0.1.0",
    connectors: [
      { id: "google_workspace", name: "Google Workspace", auth: ["oauth2"], capabilities: ["sheets", "docs", "drive"] },
      { id: "sap_erp", name: "SAP / ERP", auth: ["oauth2", "api_key", "certificate"], capabilities: ["api"] },
      { id: "sql_database", name: "SQL Database", auth: ["username_password", "certificate"], capabilities: ["read", "write"] },
      { id: "rest_api", name: "REST API", auth: ["oauth2", "api_key", "basic"], capabilities: ["read", "write"] }
    ]
  }));
};
