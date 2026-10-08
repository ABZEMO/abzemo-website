const ALLOWED_ORIGINS = new Set([
  "https://abzemo.com",
  "https://www.abzemo.com",
  "https://abzemo.github.io",
  ...(process.env.ABZEMO_ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
]);

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 12;

function corsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://abzemo.com";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function sendJson(res, body, status, origin) {
  const headers = corsHeaders(origin);

  if (res && typeof res.status === "function" && typeof res.json === "function") {
    return res
      .status(status)
      .setHeader("Content-Type", headers["Content-Type"])
      .setHeader("Access-Control-Allow-Origin", headers["Access-Control-Allow-Origin"])
      .setHeader("Access-Control-Allow-Methods", headers["Access-Control-Allow-Methods"])
      .setHeader("Access-Control-Allow-Headers", headers["Access-Control-Allow-Headers"])
      .setHeader("Vary", headers.Vary)
      .json(body);
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
    .filter(
      message =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    )
    .slice(-MAX_MESSAGES)
    .map(message => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH)
    }))
    .filter(message => message.content);
}

function buildSystemPrompt() {
  return [
    "You are ZEE, ABZEMO's public website assistant.",
    "You are separate from ABZEMO AI. You are an approachable, concise website assistant for visitors.",
    "Explain ABZEMO accurately using only the company information provided below. Never invent clients, prices, products, partnerships, certifications, guarantees, addresses, or capabilities.",
    "ABZEMO is a technology and business solutions company focused on AI, automation, digital transformation, technology, healthcare, education, trade, real estate, logistics, finance and future ventures.",
    "ABZEMO AI is ABZEMO's AI-focused branch covering AI Automations, AI Agents, Agentic AI work and intelligent business solutions.",
    "ABZEMO can work across AI Automation, AI Agents, Sales Automation, Business Process Automation, ERP and workflow automation, Intelligent Data Workflows, Digital Transformation, and Technology & Project Solutions.",
    "Industries include education, healthcare, pharma, real estate, logistics, manufacturing, finance, retail, mobility, energy, government and other business environments.",
    "For contact or general business enquiries, direct visitors to info@abzemo.com and the Contact or Online Message pages on the website.",
    "Use the visitor's language and writing style where practical, including English, Urdu, Roman Urdu, Arabic and other languages you can support.",
    "Keep replies concise and useful. If you do not know something from the supplied company information, say so and direct the visitor to Contact rather than guessing.",
    "Do not claim to be ABZEMO AI. You are ZEE Bot."
  ].join("\n");
}

export default async function handler(req, res) {
  const origin =
    (req.headers &&
      (req.headers.origin ||
        (typeof req.headers.get === "function" ? req.headers.get("origin") : ""))) ||
    "";

  if (req.method === "OPTIONS") {
    return sendJson(res, null, 204, origin);
  }

  if (req.method !== "POST") {
    return sendJson(res, { error: "Method not allowed." }, 405, origin);
  }

  if (!GROQ_API_KEY) {
    return sendJson(res, { error: "ZEE Bot AI backend is not configured." }, 500, origin);
  }

  let body;

  try {
    body = await parseRequestBody(req);
  } catch {
    return sendJson(res, { error: "Invalid JSON request." }, 400, origin);
  }

  const messages = cleanMessages(body.messages);

  if (!messages.length) {
    return sendJson(res, { error: "Message is empty." }, 400, origin);
  }

  const groqMessages = [
    { role: "system", content: buildSystemPrompt() },
    ...messages
  ];

  let response;

  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: groqMessages,
        temperature: 0.3,
        max_tokens: 500
      })
    });
  } catch (error) {
    console.error("Groq connection error:", error);
    return sendJson(res, { error: "ZEE Bot could not connect to its AI service." }, 502, origin);
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("Groq API error:", detail);
    return sendJson(res, { error: "ZEE Bot AI service returned an error." }, 502, origin);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    return sendJson(res, { error: "ZEE Bot received an invalid AI response." }, 502, origin);
  }

  const reply =
    data &&
    Array.isArray(data.choices) &&
    data.choices[0] &&
    data.choices[0].message &&
    typeof data.choices[0].message.content === "string"
      ? data.choices[0].message.content.trim()
      : "";

  if (!reply) {
    return sendJson(res, { error: "ZEE Bot received no answer." }, 502, origin);
  }

  return sendJson(res, { reply }, 200, origin);
}
