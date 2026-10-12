async function withTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken() {
  const r = await withTimeout("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: (process.env.UZMO_ZOHO_CLIENT_ID || "").trim(),
      client_secret: (process.env.UZMO_ZOHO_CLIENT_SECRET || "").trim(),
      refresh_token: (process.env.UZMO_ZOHO_REFRESH_TOKEN || "").trim()
    })
  });
  const data = await r.json();
  if (!data.access_token) throw new Error("zoho token error");
  return data.access_token;
}

export async function createLeadIfNew({ email, name, method }) {
  try {
    const token = await getAccessToken();
    const headers = { Authorization: "Zoho-oauthtoken " + token };

    const found = await withTimeout(
      "https://www.zohoapis.com/crm/v6/Leads/search?email=" + encodeURIComponent(email),
      { headers }
    );
    if (found.status === 200) {
      const f = await found.json();
      if (f.data && f.data.length) return { existing: true };
    }

    const created = await withTimeout("https://www.zohoapis.com/crm/v6/Leads", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          Last_Name: name || email.split("@")[0],
          Email: email,
          Company: "Not provided",
          Lead_Source: "UZMO",
          Description: "Signed in to UZMO with " + method
        }]
      })
    });
    return { created: created.ok };
  } catch (e) {
    return { error: true };
  }
}

export async function addInterestNote({ email, agentName, question }) {
  try {
    const token = await getAccessToken();
    const headers = { Authorization: "Zoho-oauthtoken " + token };

    const found = await withTimeout(
      "https://www.zohoapis.com/crm/v6/Leads/search?email=" + encodeURIComponent(email),
      { headers }
    );
    if (found.status !== 200) return { skipped: true };
    const f = await found.json();
    const id = f.data && f.data[0] && f.data[0].id;
    if (!id) return { skipped: true };

    const r = await withTimeout("https://www.zohoapis.com/crm/v6/Leads/" + id + "/Notes", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          Note_Title: "UZMO: " + agentName,
          Note_Content: "Agent: " + agentName + "\nFirst question: " + String(question).slice(0, 500)
        }]
      })
    });
    return { added: r.ok };
  } catch (e) {
    return { error: true };
  }
}
