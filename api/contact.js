const esc = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST use karo" });
  }

  const b = req.body || {};
  const name = String(b.name || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().slice(0, 160);
  const phone = String(b.phone || "").trim().slice(0, 60);
  const type = String(b.type || "").trim().slice(0, 120);
  const message = String(b.message || "").trim().slice(0, 4000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return res.status(400).json({ error: "name, email aur message zaroori hain" });
  }

  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    return res.status(500).json({ error: "mail not configured" });
  }

  const from = (process.env.RESEND_FROM_EMAIL || "ABZEMO Website <onboarding@resend.dev>").trim();
  const to = (process.env.CONTACT_TO_EMAIL || "info@abzemo.com").trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: email,
        subject: "New website enquiry from " + name,
        html:
          "<p><b>Name:</b> " + esc(name) +
          "</p><p><b>Email:</b> " + esc(email) +
          "</p><p><b>Phone:</b> " + esc(phone) +
          "</p><p><b>Type:</b> " + esc(type) +
          "</p><p><b>Message:</b><br>" + esc(message).replace(/\n/g, "<br>") + "</p>"
      })
    });
    if (!response.ok) {
      return res.status(502).json({ error: "send failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "server error" });
  }
}
