export default async function handler(req, res) {
  const code = req.query && req.query.code;

  if (!code) {
    return res.status(400).json({ error: "code nahi mila" });
  }

  const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      redirect_uri: process.env.ZOHO_REDIRECT_URI,
      code
    })
  });

  const data = await response.json();
  return res.status(200).json(data);
}
