export default async function handler(req, res) {
  const payload = {
    ok: true,
    service: "ABZEMO AI Global Sales Agent",
    backend: "online",
    openai_configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    lead_storage_configured: Boolean(process.env.LEAD_WEBHOOK_URL || process.env.RESEND_API_KEY),
    resend_configured: Boolean(process.env.RESEND_API_KEY),
    lead_notification_recipient: process.env.RESEND_TO_EMAIL || "sales@abzemo.com",
    hubspot_configured: Boolean(process.env.HUBSPOT_ACCESS_TOKEN),
    hubspot_pipeline: process.env.HUBSPOT_PIPELINE || "default",
    hubspot_deal_stage: process.env.HUBSPOT_DEAL_STAGE || "appointmentscheduled",
    timestamp: new Date().toISOString()
  };

  if (res && typeof res.status === "function" && typeof res.json === "function") {
    return res.status(200).json(payload);
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
