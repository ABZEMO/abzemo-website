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
    "You are ZEE, ABZEMO's public website assistant. You are a friendly woman-like assistant persona (use feminine self-reference where the language needs it). You are separate from ABZEMO AI. Never claim to be ABZEMO AI.",
    "Today's date is " + new Date().toISOString().slice(0, 10) + ".",
    "LENGTH RULE (most important): Be brief by default. A greeting gets a short greeting back (for example 'Assalam o alaikum' gets 'Walaikum assalam! Main aap ki kya madad kar sakti hun?'). A simple question gets 1 to 3 sentences that answer exactly what was asked. Give long explanations, step by step guides or full details ONLY when the visitor asks for detail, steps, a guide, or says explain. After a short answer you may offer more detail in one short line.",
    "You are a broad, knowledgeable expert assistant. Answer any reasonable question, do not refuse a topic just because it is not about ABZEMO.",
    "ABOUT ABZEMO (use only this for company facts; never invent clients, prices, partnerships, certifications, addresses or guarantees): ABZEMO is a technology and business solutions company focused on AI, automation, digital transformation, technology, healthcare, education, trade, real estate, logistics, finance and future ventures. ABZEMO AI is its AI branch (AI Automation, AI Agents, Agentic AI, intelligent business solutions). ABZEMO can work on AI Automation, AI Agents, Sales Automation, Business Process Automation, ERP and workflow automation, Intelligent Data Workflows, Digital Transformation, and Technology and Project Solutions. For business enquiries direct visitors to info@abzemo.com and the Contact or Online Message pages. For jobs, direct them to the Careers page.",
    "EXPERTISE: agriculture and animal production (poultry broilers, layers, breeders, hatchery, feed mill and nutrition, biosecurity, vaccination programs, turkeys, pigs, goats, sheep, cattle, dairy, buffalo, fish), veterinary-style education, artificial intelligence (models, agents, RAG, automation, chatbots), software, finance and accounting, business, education, healthcare information, trade, logistics, real estate and general knowledge.",
    "BREED STANDARDS AND LIVE FACTS: Exact performance figures for breeds or strains (Ross, Cobb, Hubbard, Arbor Acres, Indian River, Hy-Line, Lohmann, ISA, Bovans, turkey strains, pig or dairy genetics and so on) and live facts (scores, news, prices, population, current office holders) must come only from search results you were given in this request. If you were not given search results, do not state such figures; say briefly that you cannot verify it right now and name the official source (the breeder's current management guide or performance objectives). Never guess numbers.",
    "ANIMAL HEALTH: Educational information only, not a diagnosis. For sick animals, unusual mortality, suspected notifiable diseases, drug choice, dosing or withdrawal periods, tell the visitor to consult a licensed veterinarian. Do not give definitive prescription doses.",
    "OTHER SENSITIVE AREAS: For medical, legal or financial matters give general information only and suggest a qualified professional for decisions. For religious or textual facts, state only what you are sure of.",
    "AI AGENTS AND AUTOMATION: When a visitor asks for a bot or agent (for example one that manages finance files or works on WhatsApp instructions), explain how it would work step by step only if they ask for detail; otherwise give a short summary. Be honest that ZEE itself cannot access their files or WhatsApp. Softly mention ABZEMO can build such agents (info@abzemo.com).",
    "LANGUAGE AND SCRIPT (strict): Reply in the same language AND the same script as the visitor's last message. If the last message is in Latin letters, reply in Latin letters only: English if they wrote English, Roman Urdu if Roman Urdu, Roman Hindi if Roman Hindi. Never switch to Urdu/Arabic script or Devanagari unless the visitor's last message used that script. Support 50+ languages.",
    "STYLE: Plain text only: no markdown symbols such as asterisks, hashes or backticks. Use numbered steps (1. 2. 3.) only when explaining a process the visitor asked for. Mention ABZEMO only when relevant, at most one soft line."
  ].join("\n");
}

const WEATHER = {
  0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "rime fog",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle", 61: "light rain", 63: "rain", 65: "heavy rain",
  71: "light snow", 73: "snow", 75: "heavy snow", 80: "rain showers", 81: "rain showers", 82: "violent rain showers",
  95: "thunderstorm", 96: "thunderstorm with hail", 99: "thunderstorm with heavy hail"
};

function cityCandidates(text) {
  if (!/weather|mausam|temperature|forecast|موسم|मौसम/i.test(text)) return [];
  const patterns = [
    /(?:in|at|for|of)\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?=\s+(?:today|now|tomorrow|kaisa|kesa|how)\b|[?.!,]|$)/i,
    /([A-Za-z][A-Za-z .'-]{1,40}?)\s+(?:ka|ki|ke|mein|me)\s+(?:aaj\s+|abhi\s+)?(?:ka\s+)?(?:mausam|weather|temperature)/i
  ];
  const stop = new Set(["aj", "aaj", "abhi", "today", "now", "what", "whats", "what's", "is", "the", "weather", "in", "ka", "ki", "ke", "batao", "bataiye", "please", "tell", "me", "about", "maine", "main", "mujhe", "mera", "meri", "ap", "aap", "kya", "kia", "hai", "ye", "yeh", "to", "or", "aur", "barish"]);
  for (const p of patterns) {
    const m = text.match(p);
    if (!m) continue;
    const words = m[1].trim().split(/\s+/).filter(Boolean);
    while (words.length && stop.has(words[0].toLowerCase())) words.shift();
    const out = [];
    for (let i = 0; i < words.length && out.length < 3; i++) out.push(words.slice(i).join(" "));
    if (out.length) return out;
  }
  return [];
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
  const candidates = cityCandidates(lastUserText);
  if (!candidates.length) return "";
  try {
    let place = null;
    for (const city of candidates) {
      const g = await timed("https://geocoding-api.open-meteo.com/v1/search?count=1&name=" + encodeURIComponent(city), {}, 6000);
      if (!g.ok) continue;
      const geo = await g.json();
      if (geo.results && geo.results[0]) { place = geo.results[0]; break; }
    }
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

const SEARCH_RE = /\b(ross|cobb|hubbard|arbor acres|indian river|hy-?line|lohmann|isa brown|bovans|shaver|dekalb|hendrix|nicholas|hybrid turkey|landrace|duroc|yorkshire|holstein|jersey|sahiwal|nili|beetal|boer|performance (?:objectives|standards?)|management guide|breed standards?|fcr|hatchability|egg production|score|match|news|latest|breaking|price|stock price|exchange rate|population|aabadi|prime minister|president|election|ayat|ayah|verses)\b/i;

function needsSearch(text) {
  return SEARCH_RE.test(String(text || ""));
}

function isLatinOnly(text) {
  const letters = String(text || "").match(/\p{L}/gu) || [];
  return letters.length > 0 && letters.every(c => /\p{Script=Latin}/u.test(c));
}

function tidy(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/^\s*[*]\s+/gm, "- ")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/`/g, "")
    .trim();
}

async function viaGroq(key, model, messages) {
  const r = await timed("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 700 })
  }, 25000);
  if (!r.ok) throw new Error("groq " + r.status);
  const data = await r.json();
  const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  return typeof text === "string" ? text.trim() : "";
}

async function viaGemini(key, model, system, messages, useSearch) {
  const contents = messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
  };
  if (useSearch) payload.tools = [{ google_search: {} }];
  const r = await timed("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(payload)
  }, 40000);
  if (!r.ok) throw new Error("gemini " + r.status);
  const data = await r.json();
  const cand = data && data.candidates && data.candidates[0];
  const parts = cand && cand.content && cand.content.parts;
  const text = Array.isArray(parts) ? parts.map(p => p.text || "").join("").trim() : "";
  const chunks = (cand && cand.groundingMetadata && cand.groundingMetadata.groundingChunks) || [];
  const names = [];
  chunks.forEach(c => {
    const t = c && c.web && (c.web.title || "");
    if (t && names.indexOf(t) === -1) names.push(t);
  });
  return { text, sources: names.slice(0, 2) };
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
  const lastText = lastUser ? lastUser.content : "";
  const live = await liveContext(lastText);
  const scriptHint = isLatinOnly(lastText)
    ? "SCRIPT NOTE: the visitor's last message is in Latin letters. Reply in Latin letters only (English or Roman Urdu/Hindi to match them). Do not use Urdu, Arabic or Devanagari script."
    : "";
  const baseSystem = buildSystemPrompt() + (live ? "\n" + live : "") + (scriptHint ? "\n" + scriptHint : "");

  const groqModel = (process.env.ZEE_GROQ_MODEL || process.env.GROQ_MODEL || "openai/gpt-oss-120b").trim();
  const geminiModel = (process.env.GEMINI_MODEL || "gemini-3.5-flash").trim();

  const searchWanted = !live && needsSearch(lastText);

  /* 1. Search path: Gemini with Google Search finds official guides and live facts */
  if (searchWanted && geminiKey) {
    try {
      const searchSystem = baseSystem +
        "\nSEARCH MODE: Use Google Search now. For breed or strain performance questions find the breeder's official performance objectives or management guide, answer only what was asked (for example one day, one value), and mention the edition or year if shown. Keep the reply short.";
      const out = await viaGemini(geminiKey, geminiModel, searchSystem, messages, true);
      let reply = tidy(out.text);
      if (reply) {
        if (out.sources.length) reply += "\nSource: " + out.sources.join(", ");
        return sendJson(res, { reply }, 200, origin);
      }
    } catch (error) {
      console.error("ZEE search failed:", error && error.message);
    }
  }

  /* 2. Normal path: Groq (ZEE key, main key), then Gemini without search */
  const normalSystem = baseSystem + (searchWanted
    ? "\nSEARCH UNAVAILABLE: live search is not available for this request. Do not state breed performance figures or live facts. Say briefly that you cannot verify it right now and name the official source."
    : "");
  const groqMessages = [{ role: "system", content: normalSystem }, ...messages];

  const attempts = [];
  if (zeeKey) attempts.push(() => viaGroq(zeeKey, groqModel, groqMessages));
  if (mainKey && mainKey !== zeeKey) attempts.push(() => viaGroq(mainKey, groqModel, groqMessages));
  if (geminiKey) attempts.push(async () => (await viaGemini(geminiKey, geminiModel, normalSystem, messages, false)).text);

  for (const attempt of attempts) {
    try {
      const reply = tidy(await attempt());
      if (reply) return sendJson(res, { reply }, 200, origin);
    } catch (error) {
      console.error("ZEE provider failed:", error && error.message);
    }
  }

  return sendJson(res, { error: "ZEE Bot could not get an answer right now." }, 502, origin);
}
