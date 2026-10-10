async function getAccessToken() {
  const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: (process.env.UZMO_ZOHO_CLIENT_ID || "").trim(),
      client_secret: (process.env.UZMO_ZOHO_CLIENT_SECRET || "").trim(),
      refresh_token: (process.env.UZMO_ZOHO_REFRESH_TOKEN || "").trim()
    })
  });
  const data = await response.json();
  if (!data.access_token) {
    throw new Error("token_error: " + (data.error || "unknown"));
  }
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST use karo" });
  }

  const secret = (process.env.UZMO_APPROVAL_SECRET || "").trim();
  if (!secret || req.headers["x-uzmo-key"] !== secret) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const body = req.body || {};
  const lastName = body.name || body.last_name;
  if (!lastName) {
    return res.status(400).json({ error: "name zaroori hai" });
  }

  try {
    const accessToken = await getAccessToken();
    const response = await fetch("https://www.zohoapis.com/crm/v6/Leads", {
      method: "POST",
      headers: {
        Authorization: "Zoho-oauthtoken " + accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: [{
          Last_Name: lastName,
          Email: body.email || undefined,
          Phone: body.phone || undefined,
          Company: body.company || "Not provided",
          Description: body.message || undefined,
          Lead_Source: body.source || "UZMO"
        }]
      })
    });
    const result = await response.json();
    return res.status(response.ok ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
}
