module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "GET required" });
  try {
    const { handleRuntime } = await import("../uzmo/api/runtime.js");
    const request = new Request("https://www.abzemo.com/api/uzmo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "execute",
        goal: "check Zoho CRM health",
        approved: true,
        userId: "production-diagnostic"
      })
    });
    const response = await handleRuntime(request, process.env);
    const body = await response.text();
    res.status(response.status);
    return res.send(body);
  } catch (error) {
    return res.status(500).json({ error: error?.message || "diagnostic failed" });
  }
};
