const crypto = require("crypto");

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CLIENT_ID_ENV = "UZMO_GOOGLE_CLIENT_ID";
const CLIENT_SECRET_ENV = "UZMO_GOOGLE_CLIENT_SECRET";
const REDIRECT_URI_ENV = "UZMO_GOOGLE_REDIRECT_URI";
const STATE_SECRET_ENV = "UZMO_OAUTH_STATE_SECRET";

function verifyState(state) {
  if (typeof state !== "string") return false;
  const parts = state.split(".");
  if (parts.length !== 2) return false;
  const [body, signature] = parts;
  const secret = process.env[STATE_SECRET_ENV];
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return Number.isFinite(payload.issued_at) &&
      Date.now() - payload.issued_at >= 0 &&
      Date.now() - payload.issued_at <= 10 * 60 * 1000;
  } catch (_) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  const { code, state, error } = req.query || {};
  if (error) {
    res.statusCode = 400;
    return res.end(JSON.stringify({
      ok: false,
      stage: "oauth_callback",
      error: "google_authorization_denied"
    }));
  }

  if (!verifyState(state)) {
    res.statusCode = 400;
    return res.end(JSON.stringify({
      ok: false,
      stage: "oauth_callback",
      error: "invalid_or_expired_state"
    }));
  }

  if (typeof code !== "string" || !code) {
    res.statusCode = 400;
    return res.end(JSON.stringify({
      ok: false,
      stage: "oauth_callback",
      error: "authorization_code_missing"
    }));
  }

  const clientId = process.env[CLIENT_ID_ENV];
  const clientSecret = process.env[CLIENT_SECRET_ENV];
  const redirectUri = process.env[REDIRECT_URI_ENV];

  if (!clientId || !clientSecret || !redirectUri) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      ok: false,
      stage: "oauth_token_exchange",
      error: "google_oauth_runtime_configuration_incomplete"
    }));
  }

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    if (!response.ok) {
      res.statusCode = 502;
      return res.end(JSON.stringify({
        ok: false,
        stage: "oauth_token_exchange",
        error: "google_token_exchange_failed"
      }));
    }

    const token = await response.json();
    if (!token.access_token) {
      res.statusCode = 502;
      return res.end(JSON.stringify({
        ok: false,
        stage: "oauth_token_exchange",
        error: "google_access_token_missing"
      }));
    }

    // Tokens must be persisted only by a dedicated encrypted server-side secret/token store.
    // This stateless function intentionally does not return or persist access/refresh tokens.
    res.statusCode = 200;
    return res.end(JSON.stringify({
      ok: true,
      stage: "oauth_authorized",
      token_type: token.token_type || "Bearer",
      scope: token.scope || null,
      expires_in: token.expires_in || null,
      refresh_token_received: Boolean(token.refresh_token),
      message: "Google authorization succeeded. Token persistence is intentionally blocked until a secure server-side token store is configured."
    }));
  } catch (_) {
    res.statusCode = 502;
    return res.end(JSON.stringify({
      ok: false,
      stage: "oauth_token_exchange",
      error: "google_token_exchange_unreachable"
    }));
  }
};
