const ALLOWED_ORIGIN = process.env.ABZEMO_ALLOWED_ORIGIN || "https://abzemo.github.io";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const SOLUTIONS = [
  "AI Automation",
  "AI Agents",
  "Sales Automation",
  "Business Process Automation",
  "ERP / Business Workflow Automation",
  "Intelligent Data Workflows",
  "Digital Transformation",
  "Technology & Project Solutions"
];

const QUALIFICATION_FIELDS = [
  "name",
  "company",
  "industry",
  "business_need",
  "solution_interest",
  "timeline",
  "budget",
  "contact_method",
  "contact_value",
  "consent_to_contact"
];

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin)
  });
}

function cleanConversation(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .slice(-20)
    .map(item => ({ role: item.role, content: item.content.slice(0, 4000) }));
}

function buildInstructions(language) {
  return [
    "You are the ABZEMO AI Global Sales Agent.",
    "Your job is to understand a website visitor's business need, qualify the opportunity, match an appropriate ABZEMO solution, and guide the visitor toward a useful next step.",
    "Do not invent ABZEMO products, clients, prices, property listings, capabilities, guarantees, certifications, partnerships, or facts.",
    "Use the visitor's language or writing style for the user-facing response. Roman Urdu and Roman Hindi are valid user-facing modes.",
    "Keep internal qualification fields in English.",
    "Ask only the next most useful qualification question; do not interrogate the visitor with a long form.",
    "When enough information is available, summarize the understood need and recommend a relevant ABZEMO direction.",
    "Never claim a lead has been contacted or handed to a human unless the system explicitly confirms that action.",
    "Respect privacy. Ask for contact details only when useful and request consent before treating them as a sales lead.",
    "Relevant ABZEMO solution categories are: " + SOLUTIONS.join(", ") + ".",
    "Qualification fields are: " + QUALIFICATION_FIELDS.join(", ") + ".",
    "Detected response language: " + (language || "en") + "."
  ].join("\n");
}

function extractText(data) {
  if (typeof data.output_text === "string") return data.output_text.trim();

  const output = Array.isArray(data.output) ? data.output : [];
  const parts = [];

  for (const item of output) {
    if (!item || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (part && typeof part.text === "string") parts.push(part.text);
    }
  }

  return parts.join("\n").trim();
}

function inferQualification(conversation, previous) {
  const state = previous && typeof previous === "object" ? previous : {};
  const text = conversation.map(x => x.content).join(" ").toLowerCase();

  const next = { ...state };
  if (!next.status) next.status = "qualifying";

  if (/(^|\s)(yes|yeah|yep|sure|haan|han|جی|جی ہاں)(\s|$)/i.test(text) && next.qualification) {
    next.qualification = { ...next.qualification };
  }

  if (Object.keys(next.qualification || {}).length >= 3) {
    next.status = "qualified";
  }

  return next;
}

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, origin);
  }

  if (!OPENAI_API_KEY) {
    return json({ error: "AI backend is not configured." }, 500, origin);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON request." }, 400, origin);
  }

  const conversation = cleanConversation(body.conversation);
  if (!conversation.length) {
    return json({ error: "Conversation is empty." }, 400, origin);
  }

  const language = typeof body.response_language === "string" ? body.response_language : "en";
  const previousLeadState = body.lead_state && typeof body.lead_state === "object" ? body.lead_state : {};

  const input = [
    {
      role: "developer",
      content: buildInstructions(language)
    },
    ...conversation
  ];

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        max_output_tokens: 500
      })
    });
  } catch {
    return json({ error: "AI provider connection failed." }, 502, origin);
  }

  if (!response.ok) {
    const detail = await response.text();
    console.error("OpenAI error:", detail);
    return json({ error: "AI provider request failed." }, 502, origin);
  }

  const data = await response.json();
  const reply = extractText(data);

  if (!reply) {
    return json({ error: "AI provider returned no text." }, 502, origin);
  }

  const leadState = inferQualification(conversation, previousLeadState);

  return json({
    reply,
    lead_status: leadState.status,
    handoff_ready: leadState.handoff_ready === true,
    lead_state: leadState,
    qualification: leadState.qualification || {},
    internal_record_language: "en",
    session_id: typeof body.session_id === "string" ? body.session_id.slice(0, 120) : null
  }, 200, origin);
}
