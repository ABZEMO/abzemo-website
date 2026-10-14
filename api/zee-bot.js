const ALLOWED_ORIGINS = new Set([
  "https://abzemo.com",
  "https://www.abzemo.com",
  "https://abzemo.github.io",
  ...(process.env.ABZEMO_ALLOWED_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean)
]);

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 12;

function isAllowedOrigin(origin) {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" &&
      /^abzemo-website-[a-z0-9-]+-aasopsglobal-3790\.vercel\.app$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin : "https://abzemo.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function sendJson(res, body, status, origin) {
  const headers = corsHeaders(origin);
  if (res && typeof res.status === "function" && typeof res.json === "function") {
    res.status(status);
    Object.keys(headers).forEach(k => res.setHeader(k, headers[k]));
    return res.json(body);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function parseRequestBody(req) {
  if (req && req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8"));
    if (typeof req.body === "object") return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function cleanMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, MAX_MESSAGE_LENGTH) }))
    .filter(m => m.content);
}

function buildSystemPrompt() {
  return [
    "You are ZEE, ABZEMO's public website assistant. You are separate from ABZEMO AI. Never claim to be ABZEMO AI.",
    "Today's date is " + new Date().toISOString().slice(0, 10) + ".",
    "You are a broad, knowledgeable expert assistant. Answer any reasonable question fully, then add value. Do not refuse a topic just because it is not about ABZEMO.",
    "ABOUT ABZEMO (use only this for company facts; never invent clients, prices, partnerships, certifications, addresses or guarantees): ABZEMO is a technology and business solutions company focused on AI, automation, digital transformation, technology, healthcare, education, trade, real estate, logistics, finance and future ventures. ABZEMO AI is its AI branch (AI Automation, AI Agents, Agentic AI, intelligent business solutions). ABZEMO can work on AI Automation, AI Agents, Sales Automation, Business Process Automation, ERP and workflow automation, Intelligent Data Workflows, Digital Transformation, and Technology and Project Solutions. For business enquiries direct visitors to info@abzemo.com and the Contact or Online Message pages. For jobs, direct them to the Careers page.",
    "EXPERTISE: You can help with agriculture and animal production in depth: poultry (broilers, layers, breeders, hatchery operations, feed mill and nutrition, biosecurity, vaccination programs, house management, FCR, mortality, uniformity), turkeys, pigs, goats, sheep, cattle, dairy, buffalo, fish and aquaculture, feed formulation basics, farm economics, and veterinary-style education. You can also help with artificial intelligence (how models, agents, RAG, automation and chatbots work, and how to build them), software, finance and accounting, business, education, healthcare information, trade, logistics, real estate and general knowledge.",
    "ACCURACY RULES: Never invent numbers. For breed or genetics performance standards (for example Ross, Cobb, Hy-Line, Lohmann, Hubbard, turkey strains, pig genetics, dairy breeds), explain the principles and give typical ranges only when you are confident, label them approximate, say that exact targets depend on the strain, sex, edition of the breeder's management guide and local conditions, and tell the visitor to check the breeder's current official guide. Never fabricate exact tables or figures.",
    "ANIMAL HEALTH: Give educational information, not a diagnosis. For sick animals, unusual mortality, suspected notifiable diseases, drug choice, dosing or withdrawal periods, tell the visitor to consult a licensed veterinarian. Do not give definitive prescription doses.",
    "OTHER SENSITIVE AREAS: For medical, legal or financial matters give general information only and suggest a qualified professional for decisions. For religious or textual facts, state only what you are sure of and mention the counting method when numbers differ.",
    "LIVE DATA: You have no live internet. Use real-time facts only when they appear in a LIVE DATA section below. For live scores, news, prices or anything time-sensitive that is not provided, say plainly that you cannot verify it live and suggest an official source. Do not guess.",
    "AI AGENTS AND AUTOMATION: When a visitor asks for a bot or agent (for example one that manages finance files or works on WhatsApp instructions), explain step by step how it would work: goal, data sources and permissions, tools or integrations (WhatsApp Business API, Google Drive, Excel or ERP, approval steps), security, testing, rollout. Be honest that ZEE itself cannot access their files or WhatsApp. Then, softly, say ABZEMO can build such agents and invite them to contact info@abzemo.com.",
    "STYLE: Reply in the same language and script the visitor uses. If they write Roman Urdu reply in Roman Urdu; Urdu script in Urdu script; Arabic in Arabic; do not switch scripts. Support 50+ languages. Write plain text only: no markdown symbols such as asterisks, hashes or backticks. Use short paragraphs and simple numbered steps (1. 2. 3.) when explaining a process. Be clear and practical, and keep answers as short as the question allows while being complete. For pure knowledge questions answer first; mention ABZEMO only when relevant, with at most one soft line. Ask one useful follow-up question when it helps."
  ].join("\n");
}

const WEATHER = {
  0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "rime fog",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle", 61: "light rain", 63: "rain", 65: "heavy rain",
  71: "light snow", 73: "snow", 75: "heavy snow", 80: "rain showers", 81: "rain showers", 82: "violent rain showers",
  95: "thunderstorm", 96: "thunderstorm with hail", 99: "thunderstorm with heavy hail"
};

function weatherCity(text) {
  if (!/weather|mausam|temperature|forecast|موسم|मौसम/i.test(text)) return "";
  const patterns = [
    /(?:in|at|for|of)\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?=\s+(?:today|now|tomorrow|kaisa|kesa|how)\b|[?.!,]|$)/i,
    /([A-Za-z][A-Za-z .'-]{1,40}?)\s+(?:ka|ki|ke|mein|me)\s+(?:aaj\s+|abhi\s+)?(?:ka\s+)?(?:mausam|weather|temperature)/i
  ];
  const stop = new Set(["aj", "aaj", "abhi", "today", "now", "what", "whats", "what's", "is", "the", "weather", "in", "ka", "ki", "ke", "batao", "bataiye", "please", "tell", "me", "about"]);
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const words = m[1].trim().split(/\s+/).filter(Boolean);
      while (words.length && stop.has(words[0].toLowerCase())) words.shift();
      const city = words.join(" ").trim();
      if (city) return city;
    }
  }
  return "";
}

async function timed(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms || 20000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function liveContext(lastUserText) {
  const city = weatherCity(lastUserText);
  if (!city) return "";
  try {
    const g = await timed("https://geocoding-api.open-meteo.com/v1/search?count=1&name=" + encodeURIComponent(city), {}, 6000);
    if (!g.ok) return "";
    const geo = await g.json();
    const place = geo.results && geo.results[0];
    if (!place) return "";
    const w = await timed("https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude + "&longitude=" + place.longitude +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto", {}, 6000);
    if (!w.ok) return "";
    const data = await w.json();
    const c = data.current;
    if (!c) return "";
    return "LIVE DATA (Open-Meteo, current weather): " + place.name + (place.country ? ", " + place.country : "") +
      ": " + c.temperature_2m + " C, humidity " + c.relative_humidity_2m + "%, wind " + c.wind_speed_10m +
      " km/h, " + (WEATHER[c.weather_code] || "conditions unavailable") + ".";
  } catch {
    return "";
  }
}

async function viaGroq(key, model, messages) {
  const r = await timed("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 1500 })
  }, 25000);
  if (!r.ok) throw new Error("groq " + r.status);
  const data = await r.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return typeof text === "string" ? text.trim() : "";
}

async function viaGemini(key, model, system, messages) {
  const contents = messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const r = await timed("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
    })
  }, 25000);
  if (!r.ok) throw new Error("gemini " + r.status);
  const data = await r.json();
  const parts = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
  return Array.isArray(parts) ? parts.map(p => p.text || "").join("").trim() : "";
}

export default async function handler(req, res) {
  const origin = (req.headers && (req.headers.origin || (typeof req.headers.get === "function" ? req.headers.get("origin") : ""))) || "";

  if (req.method === "OPTIONS") return sendJson(res, null, 204, origin);
  if (req.method !== "POST") return sendJson(res, { error: "Method not allowed." }, 405, origin);

  const zeeKey = (process.env.ZEE_GROQ_API_KEY || "").trim();
  const mainKey = (process.env.GROQ_API_KEY || "").trim();
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!zeeKey && !mainKey && !geminiKey) {
    return sendJson(res, { error: "ZEE Bot AI backend is not configured." }, 500, origin);
  }

  let body;
  try {
    body = await parseRequestBody(req);
  } catch {
    return sendJson(res, { error: "Invalid JSON request." }, 400, origin);
  }

  const messages = cleanMessages(body.messages);
  if (!messages.length) return sendJson(res, { error: "Message is empty." }, 400, origin);

  const lastUser = [...messages].reverse().find(m => m.role === "user");
  const live = await liveContext(lastUser ? lastUser.content : "");
  const system = buildSystemPrompt() + (live ? "\n" + live : "");

  const groqModel = (process.env.ZEE_GROQ_MODEL || process.env.GROQ_MODEL || "openai/gpt-oss-120b").trim();
  const geminiModel = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
  const groqMessages = [{ role: "system", content: system }, ...messages];

  const attempts = [];
  if (zeeKey) attempts.push(() => viaGroq(zeeKey, groqModel, groqMessages));
  if (mainKey && mainKey !== zeeKey) attempts.push(() => viaGroq(mainKey, groqModel, groqMessages));
  if (geminiKey) attempts.push(() => viaGemini(geminiKey, geminiModel, system, messages));

  for (const attempt of attempts) {
    try {
      const reply = await attempt();
      if (reply) return sendJson(res, { reply }, 200, origin);
    } catch (error) {
      console.error("ZEE provider failed:", error && error.message);
    }
  }

  return sendJson(res, { error: "ZEE Bot could not get an answer right now." }, 502, origin);
}
