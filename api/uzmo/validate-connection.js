const CONNECTOR_RULES = {
  google_workspace: {
    required: ["client_id", "redirect_uri"],
    urls: ["redirect_uri"],
    auth: ["OAuth2"]
  },
  sap_erp: {
    required: ["base_url"],
    urls: ["base_url"],
    auth: ["OAuth2", "API key", "Certificate"]
  },
  sql_database: {
    required: ["host", "database", "username"],
    urls: [],
    auth: ["Username / password", "Certificate"]
  },
  rest_api: {
    required: ["base_url"],
    urls: ["base_url"],
    auth: ["OAuth2", "API key", "Basic authentication"]
  }
};

const PERMISSIONS = ["read", "write", "execute"];

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch (_) {
    return false;
  }
}

function validateConfig(type, config, authMethod, permission) {
  const rules = CONNECTOR_RULES[type];
  if (!rules) return { ok: false, errors: ["unsupported_connector"] };

  const errors = [];
  for (const key of rules.required) {
    if (typeof config[key] !== "string" || config[key].trim() === "") {
      errors.push("missing_" + key);
    }
  }
  for (const key of rules.urls) {
    if (typeof config[key] === "string" && config[key].trim() && !isUrl(config[key])) {
      errors.push("invalid_" + key);
    }
  }
  if (!rules.auth.includes(authMethod)) errors.push("invalid_auth_method");
  if (!PERMISSIONS.includes(permission)) errors.push("invalid_permission");

  return { ok: errors.length === 0, errors };
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const type = typeof body.type === "string" ? body.type : "";
  const authMethod = typeof body.auth_method === "string" ? body.auth_method : "";
  const permission = typeof body.permission === "string" ? body.permission : "read";
  const config = body.config && typeof body.config === "object" ? body.config : {};
  const validation = validateConfig(type, config, authMethod, permission);

  res.statusCode = validation.ok ? 200 : 400;
  return res.end(JSON.stringify({
    ok: validation.ok,
    connector: type || null,
    stage: "configuration_validation",
    errors: validation.errors,
    message: validation.ok
      ? "Configuration structure is valid. No external system was contacted."
      : "Configuration needs correction before a live connector test can run."
  }));
};
