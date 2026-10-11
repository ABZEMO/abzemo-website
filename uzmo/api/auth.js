import crypto from "node:crypto";

const COOKIE = "uzmo_session";
const MAX_AGE = 7 * 24 * 3600;

function secretKey() { return (process.env.UZMO_SESSION_SECRET || "").trim(); }
function clientId() { return (process.env.UZMO_GOOGLE_CLIENT_ID || "").trim(); }

function makeSig(body) {
  return crypto.createHmac("sha256", secretKey()).update(body).digest("base64url");
}

function makeToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + makeSig(body);
}

export function readSession(req) {
  if (!secretKey()) return null;
  const part = String(req.headers.cookie || "").split(";").map(s => s.trim()).find(s => s.startsWith(COOKIE + "="));
  if (!part) return null;
  const token = part.slice(COOKIE.length + 1);
  const [body, sig] = token.split(".");
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

function cookieHeader(value, maxAge) {
  return COOKIE + "=" + value + "; Path=/; Max-Age=" + maxAge + "; HttpOnly; Secure; SameSite=Lax";
}

export async function handleAuth(req, res) {
  if (!secretKey() || !clientId()) return res.status(503).json({ error: "Login is not configured" });

  const action = (req.query && req.query.action) || "";

  if (req.method === "GET" && action === "config") {
    return res.status(200).json({ clientId: clientId() });
  }

  if (req.method === "GET" && action === "me") {
    const s = readSession(req);
    return res.status(200).json(s ? { loggedIn: true, name: s.name, email: s.email } : { loggedIn: false });
  }

  if (req.method === "POST" && action === "logout") {
    res.setHeader("Set-Cookie", cookieHeader("", 0));
    return res.status(200).json({ loggedIn: false });
  }

  if (req.method === "POST" && action === "login") {
    const body = req.body && typeof req.body === "object" ? req.body : {};
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
      const session = {
        email: String(info.email).toLowerCase(),
        name: String(info.name || info.email),
        exp: Math.floor(Date.now() / 1000) + MAX_AGE
      };
      res.setHeader("Set-Cookie", cookieHeader(makeToken(session), MAX_AGE));
      return res.status(200).json({ loggedIn: true, name: session.name, email: session.email });
    } catch (e) {
      return res.status(500).json({ error: "Login failed" });
    }
  }

  return res.status(405).json({ error: "Not allowed" });
}
