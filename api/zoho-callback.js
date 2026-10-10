export default async function handler(req, res) {
  const code = req.query && req.query.code;
  const id = (process.env.UZMO_ZOHO_CLIENT_ID || "").trim();
  const secret = (process.env.UZMO_ZOHO_CLIENT_SECRET || "").trim();
  const redirect = (process.env.UZMO_ZOHO_REDIRECT_URI || "").trim();

  const debug = {
    client_id_set: Boolean(id),
    client_id_length: id.length,
    client_secret_set: Boolean(secret),
    client_secret_length: secret.length,
    redirect_uri: redirect
  };

  if (!code) {
    return res.status(400).json({ error: "code nahi mila", debug });
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
  const hasToken = Boolean(data.refresh_token);
  return res.status(200).json({
    debug,
    zoho_error: data.error || null,
    got_refresh_token: hasToken,
    data: hasToken ? data : undefined
  });
}
