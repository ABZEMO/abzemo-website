const ALLOWED_ORIGINS = new Set([
  "https://abzemo.github.io",
  "https://abzemo.com",
  "https://www.abzemo.com",
  ...(process.env.ABZEMO_ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean)
]);

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://abzemo.github.io";

  return new Response(JSON.stringify({
    ok: true,
    service: "ABZEMO AI Global Sales Agent",
    backend: "online",
    openai_configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    lead_storage_configured: Boolean(process.env.LEAD_WEBHOOK_URL || process.env.RESEND_API_KEY),
    resend_configured: Boolean(process.env.RESEND_API_KEY),
    lead_notification_recipient: process.env.RESEND_TO_EMAIL || "sales@abzemo.com",
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin",
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
