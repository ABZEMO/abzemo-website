export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("code missing");
  }

  try {
    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: (process.env.UZMO_ZOHO_CLIENT_ID || "").trim(),
        client_secret: (process.env.UZMO_ZOHO_CLIENT_SECRET || "").trim(),
        redirect_uri: "https://abzemo.com/zoho/callback",
        code: code
      })
    });
    const data = await response.json();
    if (!data.refresh_token) {
      return res.status(400).send("token_error: " + (data.error || "unknown"));
    }
    return res
      .status(200)
      .send("UZMO_ZOHO_REFRESH_TOKEN = " + data.refresh_token);
  } catch (err) {
    return res.status(500).send(String(err.message || err));
  }
}
