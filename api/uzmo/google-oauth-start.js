const crypto = require("crypto");

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const REDIRECT_URI_ENV = "UZMO_GOOGLE_REDIRECT_URI";
const CLIENT_ID_ENV = "UZMO_GOOGLE_CLIENT_ID";
const STATE_SECRET_ENV = "UZMO_OAUTH_STATE_SECRET";

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function signState(payload) {
  const body = base64url(JSON.stringify(payload));
  const secret = process.env[STATE_SECRET_ENV];
  if (!secret) return null;
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + signature;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  const clientId = process.env[CLIENT_ID_ENV];
  const redirectUri = process.env[REDIRECT_URI_ENV];
  const stateSecretConfigured = Boolean(process.env[STATE_SECRET_ENV]);

  if (!clientId || !redirectUri || !stateSecretConfigured) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      ok: false,
      stage: "oauth_configuration",
      error: "google_oauth_runtime_configuration_incomplete",
      message: "Google OAuth runtime configuration is incomplete. No authorization request was created."
    }));
  }

  const state = signState({
    nonce: crypto.randomBytes(24).toString("base64url"),
    issued_at: Date.now()
  });

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/documents.readonly");
  url.searchParams.set("state", state);

  res.statusCode = 200;
  return res.end(JSON.stringify({
    ok: true,
    stage: "oauth_authorization_ready",
    authorization_url: url.toString(),
    message: "Open the authorization URL to obtain a Google authorization code. UZMO does not expose client secrets in this response."
  }));
};
