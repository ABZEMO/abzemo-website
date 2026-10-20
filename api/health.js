export default async function handler(req, res) {
  const payload = {
    ok: true,
    service: "ABZEMO AI Global Sales Agent",
    backend: "online",
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
