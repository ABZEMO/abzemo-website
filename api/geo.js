export default function handler(req, res) {
  const code = (req.headers["x-vercel-ip-country"] || "").toString().toUpperCase();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ country: code || "Global", countryCode: code || null });
}
