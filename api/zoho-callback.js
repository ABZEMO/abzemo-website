export default async function handler(req, res) {
  const code = req.query && req.query.code;
  const id = (process.env.UZMO_ZOHO_CLIENT_ID || "").trim();
  const secret = (process.env.UZMO_ZOHO_CLIENT_SECRET || "").trim();
  const redirect = (process.env.UZMO_ZOHO_REDIRECT_URI || "").trim();

  if (!code) {
    return res.status(400).json({ error: "code nahi mila" });
  }

  const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: id,
      client_secret: secret,
      redirect_uri: redirect,
      code
    })
  });

  const data = await response.json();

  if (data.refresh_token) {
    console.log("ZOHO_REFRESH_TOKEN=" + data.refresh_token);
    return res.status(200).send(
      "Done. Refresh token mil gaya. Vercel Logs mein dekho aur UZMO_ZOHO_REFRESH_TOKEN mein save karo."
    );
  }

  return res.status(400).json({ zoho_error: data.error || "unknown" });
}
