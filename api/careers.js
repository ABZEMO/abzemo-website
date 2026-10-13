const crypto = require("crypto");

const GOOGLE_ID = "1090075689427-clt36ud514s9oi06i18t8is6mrcse0be.apps.googleusercontent.com";
const ROLES = ["Business Development", "AI & Automation", "Project Management", "Internship", "General Application"];

function secret() { return (process.env.UZMO_SESSION_SECRET || "").trim(); }

function sig(body) {
  return crypto.createHmac("sha256", secret()).update(body).digest("base64url");
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + sig(body);
}

function parse(token) {
  if (!secret() || !token) return null;
  const parts = String(token).split(".");
  if (parts.length !== 2) return null;
  const a = Buffer.from(parts[1]);
  const b = Buffer.from(sig(parts[0]));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (!p.exp || p.exp < Date.now() / 1000) return null;
    return p;
  } catch (e) {
    return null;
  }
}

function codeHash(email, code, exp) {
  return crypto.createHmac("sha256", secret()).update("careers-otp:" + email + ":" + code + ":" + exp).digest("hex");
}

const hits = new Map();
function tooMany(key, max) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter(function (t) { return now - t < 600000; });
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}

function esc(v) {
  return String(v).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
  });
}

async function sendMail(payload) {
  const key = (process.env.RESEND_API_KEY || "").trim();
  if (!key) throw new Error("not configured");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + key },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("mail failed");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
  if (!secret()) return res.status(503).json({ error: "Applications are not configured" });

  const action = (req.query && req.query.action) || "";
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const exp30 = function () { return Math.floor(Date.now() / 1000) + 1800; };

  try {
    if (action === "google") {
      if (tooMany("g:" + ip, 20)) return res.status(429).json({ error: "Too many attempts. Try again later." });
      const credential = typeof body.credential === "string" ? body.credential : "";
      if (!credential) return res.status(400).json({ error: "Missing credential" });
      const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential));
      if (!r.ok) return res.status(401).json({ error: "Invalid Google sign-in" });
      const info = await r.json();
      const issuerOk = info.iss === "accounts.google.com" || info.iss === "https://accounts.google.com";
      if (info.aud !== GOOGLE_ID || !issuerOk || String(info.email_verified) !== "true" || !info.email) {
        return res.status(401).json({ error: "Invalid Google sign-in" });
      }
      const email = String(info.email).toLowerCase();
      const name = String(info.name || "");
      return res.status(200).json({ token: sign({ e: email, exp: exp30() }), email: email, name: name });
    }

    if (action === "email-send") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      if (tooMany("s-ip:" + ip, 5) || tooMany("s-mail:" + email, 3)) {
        return res.status(429).json({ error: "Too many attempts. Please try again in a few minutes." });
      }
      const code = String(crypto.randomInt(100000, 1000000));
      const exp = Math.floor(Date.now() / 1000) + 600;
      const ticket = sign({ e: email, h: codeHash(email, code, exp), exp: exp });
      await sendMail({
        from: "ABZEMO Careers <noreply@abzemo.com>",
        to: [email],
        subject: "Your ABZEMO careers sign-in code: " + code,
        html: "<div style=\"font-family:Arial,sans-serif;max-width:480px\"><h2 style=\"color:#071a35\">ABZEMO Careers</h2><p>Your sign-in code is:</p><p style=\"font-size:32px;font-weight:700;letter-spacing:6px;color:#1264d8\">" + code + "</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>"
      });
      return res.status(200).json({ sent: true, ticket: ticket });
    }

    if (action === "email-verify") {
      const email = String(body.email || "").trim().toLowerCase();
      const code = String(body.code || "").trim();
      if (tooMany("v-ip:" + ip, 10)) return res.status(429).json({ error: "Too many attempts. Please try again in a few minutes." });
      const t = parse(body.ticket);
      if (!t || t.e !== email || !/^\d{6}$/.test(code)) return res.status(401).json({ error: "Invalid or expired code" });
      const expected = Buffer.from(t.h);
      const actual = Buffer.from(codeHash(email, code, t.exp));
      if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
        return res.status(401).json({ error: "Invalid or expired code" });
      }
      return res.status(200).json({ token: sign({ e: email, exp: exp30() }), email: email, name: "" });
    }

    if (action === "submit") {
      const t = parse(body.token);
      if (!t || !t.e) return res.status(401).json({ error: "Please sign in again" });
      if (tooMany("sub:" + t.e, 3)) return res.status(429).json({ error: "Too many submissions. Please try again later." });

      const fullName = String(body.fullName || "").trim().slice(0, 120);
      const phone = String(body.phone || "").trim().slice(0, 40);
      const role = String(body.role || "");
      const linkedin = String(body.linkedin || "").trim().slice(0, 200);
      const message = String(body.message || "").trim().slice(0, 2000);
      const cvName = String(body.cvName || "").replace(/[^\w.\- ]/g, "_").slice(0, 120);
      const cvData = typeof body.cvData === "string" ? body.cvData : "";

      if (!fullName) return res.status(400).json({ error: "Full name is required" });
      if (ROLES.indexOf(role) === -1) return res.status(400).json({ error: "Please choose a role" });
      if (linkedin && !/^https?:\/\//i.test(linkedin)) return res.status(400).json({ error: "LinkedIn link must start with http" });
      if (!/\.(pdf|doc|docx)$/i.test(cvName)) return res.status(400).json({ error: "CV must be PDF, DOC or DOCX" });
      if (!cvData || cvData.length > 4200000 || !/^[A-Za-z0-9+/=]+$/.test(cvData)) {
        return res.status(400).json({ error: "CV file is missing or too large" });
      }

      await sendMail({
        from: "ABZEMO Careers <noreply@abzemo.com>",
        to: [(process.env.CAREERS_TO_EMAIL || "info@abzemo.com").trim()],
        reply_to: t.e,
        subject: "Career Application - " + role + " - " + fullName,
        html: "<div style=\"font-family:Arial,sans-serif\"><h2>New career application</h2>" +
          "<p><b>Name:</b> " + esc(fullName) + "<br><b>Email (verified):</b> " + esc(t.e) +
          "<br><b>Phone:</b> " + esc(phone || "-") + "<br><b>Role:</b> " + esc(role) +
          "<br><b>LinkedIn:</b> " + esc(linkedin || "-") + "</p>" +
          "<p><b>Introduction:</b><br>" + esc(message || "-").replace(/\n/g, "<br>") + "</p></div>",
        attachments: [{ filename: cvName, content: cvData }]
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong. Please try again or email info@abzemo.com." });
  }
};
