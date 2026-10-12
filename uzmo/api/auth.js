import crypto from "node:crypto";
import { createLeadIfNew } from "./zoho.js";
const COOKIE = "uzmo_session";
const MAX_AGE = 7 * 24 * 3600;
const CODE_TTL = 10 * 60;

function secretKey() { return (process.env.UZMO_SESSION_SECRET || "").trim(); }
function clientId() { return (process.env.UZMO_GOOGLE_CLIENT_ID || "").trim(); }

function makeSig(body) {
  return crypto.createHmac("sha256", secretKey()).update(body).digest("base64url");
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + makeSig(body);
}

function parseToken(token) {
  if (!secretKey() || !token) return null;
  const [body, sig] = String(token).split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(makeSig(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!p.exp || p.exp < Date.now() / 1000) return null;
    return p;
  } catch (e) {
    return null;
  }
}

export function readSession(req) {
  const part = String(req.headers.cookie || "").split(";").map(s => s.trim()).find(s => s.startsWith(COOKIE + "="));
  if (!part) return null;
  const p = parseToken(part.slice(COOKIE.length + 1));
  return p && p.email ? p : null;
}

function cookieHeader(value, maxAge) {
  return COOKIE + "=" + value + "; Path=/; Max-Age=" + maxAge + "; HttpOnly; Secure; SameSite=Lax";
}

function startSession(res, email, name) {
  const session = {
    email,
    name: name || email.split("@")[0],
    exp: Math.floor(Date.now() / 1000) + MAX_AGE
  };
  res.setHeader("Set-Cookie", cookieHeader(signToken(session), MAX_AGE));
  return { loggedIn: true, name: session.name, email: session.email };
}

const hits = new Map();
function tooMany(key, max) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter(t => now - t < 600000);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

function codeHash(email, code, exp) {
  return crypto.createHmac("sha256", secretKey()).update("otp:" + email + ":" + code + ":" + exp).digest("hex");
}

export async function handleAuth(req, res) {
  if (!secretKey()) return res.status(503).json({ error: "Login is not configured" });

  const action = (req.query && req.query.action) || "";
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

  if (req.method === "GET" && action === "config") {
    return res.status(200).json({ clientId: clientId(), email: Boolean((process.env.RESEND_API_KEY || "").trim()) });
  }

  if (req.method === "GET" && action === "me") {
    const s = readSession(req);
    return res.status(200).json(s ? { loggedIn: true, name: s.name, email: s.email } : { loggedIn: false });
  }

  if (req.method === "POST" && action === "logout") {
    res.setHeader("Set-Cookie", cookieHeader("", 0));
    return res.status(200).json({ loggedIn: false });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  if (req.method === "POST" && action === "login") {
    if (!clientId()) return res.status(503).json({ error: "Google login is not configured" });
    const credential = typeof body.credential === "string" ? body.credential : "";
    if (!credential) return res.status(400).json({ error: "credential is required" });
    try {
      const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential));
      if (!r.ok) return res.status(401).json({ error: "Invalid Google login" });
      const info = await r.json();
      const issuerOk = info.iss === "accounts.google.com" || info.iss === "https://accounts.google.com";
      if (info.aud !== clientId() || !issuerOk || String(info.email_verified) !== "true" || !info.email) {
        return res.status(401).json({ error: "Invalid Google login" });
      }
      const gEmail = String(info.email).toLowerCase();
      const gName = String(info.name || "");
      await createLeadIfNew({ email: gEmail, name: gName, method: "Google" });
      return res.status(200).json(startSession(res, gEmail, gName));
    } catch (e) {
      return res.status(500).json({ error: "Login failed" });
    }
  }

  if (req.method === "POST" && action === "email-send") {
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (tooMany("send-ip:" + ip, 5) || tooMany("send-mail:" + email, 3)) {
      return res.status(429).json({ error: "Too many attempts. Please try again in a few minutes." });
    }
    const resendKey = (process.env.RESEND_API_KEY || "").trim();
    if (!resendKey) return res.status(503).json({ error: "Email login is not configured" });

    const code = String(crypto.randomInt(100000, 1000000));
    const exp = Math.floor(Date.now() / 1000) + CODE_TTL;
    const ticket = signToken({ e: email, h: codeHash(email, code, exp), exp });

    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + resendKey },
        body: JSON.stringify({
          from: (process.env.UZMO_MAIL_FROM || "UZMO by ABZEMO <noreply@abzemo.com>").trim(),
          to: [email],
          subject: "Your UZMO sign-in code: " + code,
          html: "<div style=\"font-family:Arial,sans-serif;max-width:480px\"><h2 style=\"color:#071a35\">Sign in to UZMO</h2>" +
            "<p>Your sign-in code is:</p><p style=\"font-size:32px;font-weight:700;letter-spacing:6px;color:#1264d8\">" + code + "</p>" +
            "<p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>"
        })
      });
      if (!r.ok) return res.status(502).json({ error: "Could not send the email. Please try again." });
      return res.status(200).json({ sent: true, ticket });
    } catch (e) {
      return res.status(500).json({ error: "Could not send the email. Please try again." });
    }
  }

  if (req.method === "POST" && action === "email-verify") {
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    if (tooMany("verify-ip:" + ip, 10)) {
      return res.status(429).json({ error: "Too many attempts. Please try again in a few minutes." });
    }
    const t = parseToken(body.ticket);
    if (!t || t.e !== email || !/^\d{6}$/.test(code)) {
      return res.status(401).json({ error: "Invalid or expired code" });
    }
    const expected = Buffer.from(t.h);
    const actual = Buffer.from(codeHash(email, code, t.exp));
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
      return res.status(401).json({ error: "Invalid or expired code" });
    }
    await createLeadIfNew({ email, name: "", method: "email code" });
    return res.status(200).json(startSession(res, email, ""));
  }

  return res.status(405).json({ error: "Not allowed" });
}
