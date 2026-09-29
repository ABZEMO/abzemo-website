const ALLOWED_ORIGINS = new Set([
  "https://abzemo.github.io",
  "https://abzemo.com",
  "https://www.abzemo.com",
  ...(process.env.ABZEMO_ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean)
]);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_MESSAGES = 20;

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

const QUALIFICATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: ["string", "null"] },
    company: { type: ["string", "null"] },
    industry: { type: ["string", "null"] },
    business_need: { type: ["string", "null"] },
    solution_interest: { type: ["string", "null"] },
    timeline: { type: ["string", "null"] },
    budget: { type: ["string", "null"] },
    contact_method: { type: ["string", "null"] },
    contact_value: { type: ["string", "null"] },
    consent_to_contact: { type: ["boolean", "null"] }
  },
  required: QUALIFICATION_FIELDS
};

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    qualification: QUALIFICATION_SCHEMA,
    lead_status: {
      type: "string",
      enum: ["new", "qualifying", "qualified", "hot"]
    },
    handoff_ready: { type: "boolean" }
  },
  required: ["reply", "qualification", "lead_status", "handoff_ready"]
};

function corsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://abzemo.github.io";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
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
    .filter(
      item =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .slice(-MAX_CONVERSATION_MESSAGES)
    .map(item => ({
      role: item.role,
      content: item.content.slice(0, MAX_MESSAGE_LENGTH)
    }));
}

function cleanPreviousQualification(value) {
  if (!value || typeof value !== "object") return {};

  const result = {};

  for (const field of QUALIFICATION_FIELDS) {
    if (!(field in value)) continue;

    if (field === "consent_to_contact") {
      result[field] =
        typeof value[field] === "boolean" ? value[field] : null;
      continue;
    }

    result[field] =
      typeof value[field] === "string"
        ? value[field].slice(0, 500)
        : null;
  }

  return result;
}

function buildInstructions(language, previousQualification) {
  return [
    "You are the ABZEMO AI Global Sales Agent.",
    "Your job is to understand a website visitor's business need, qualify the opportunity, match an appropriate ABZEMO solution, and guide the visitor toward a useful next step.",
    "Use the visitor's language or writing style for the user-facing reply. Roman Urdu and Roman Hindi are valid.",
    "Keep the qualification record in English.",
    "Never invent ABZEMO products, clients, prices, property listings, capabilities, guarantees, certifications, partnerships, or facts.",
    "Ask only the next most useful qualification question. Do not interrogate the visitor with a long form.",
    "Extract qualification values only when the visitor has explicitly provided or clearly stated them.",
    "Preserve previously known qualification values unless the visitor clearly corrects them.",
    "Do not guess a name, company, budget, timeline, contact detail, consent, or any other field.",
    "consent_to_contact must be true only when the visitor explicitly agrees to be contacted. It must be null or false otherwise.",
    "contact_value should contain a contact detail only when the visitor actually supplied it.",
    "Set handoff_ready true only when there is enough business context for a human sales follow-up AND consent_to_contact is true AND a usable contact value exists.",
    "Use lead_status new when there is not enough information yet, qualifying while gathering useful business information, qualified when the opportunity is sufficiently understood, and hot only when qualified plus consented contact information and a clear near-term business opportunity are present.",
    "Never claim that a human has already contacted the visitor. Handoff_ready only means the conversation is ready for handoff.",
    "When enough information is available, briefly summarize the understood need and recommend the relevant ABZEMO solution direction.",
    "Relevant ABZEMO solution categories: " + SOLUTIONS.join(", ") + ".",
    "Qualification fields: " + QUALIFICATION_FIELDS.join(", ") + ".",
    "Detected response language: " + (language || "en") + ".",
    "Previously known qualification: " + JSON.stringify(previousQualification || {})
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

function normalizeQualification(next, previous) {
  const merged = {};
  const old = previous || {};
  const incoming = next || {};

  for (const field of QUALIFICATION_FIELDS) {
    const value = incoming[field];

    if (field === "consent_to_contact") {
      merged[field] =
        typeof value === "boolean"
          ? value
          : typeof old[field] === "boolean"
            ? old[field]
            : null;
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      merged[field] = value.trim().slice(0, 500);
    } else if (typeof old[field] === "string" && old[field].trim()) {
      merged[field] = old[field].trim().slice(0, 500);
    } else {
      merged[field] = null;
    }
  }

  return merged;
}

function hasBusinessContext(q) {
  return Boolean(
    q.company ||
    q.industry ||
    q.business_need ||
    q.solution_interest
  );
}

function hasContact(q) {
  return Boolean(q.contact_method && q.contact_value);
}

function finalizeState(modelState, qualification) {
  const consented = qualification.consent_to_contact === true;
  const ready = hasBusinessContext(qualification) && consented && hasContact(qualification);

  let status = modelState.lead_status || "qualifying";

  if (ready && modelState.lead_status === "hot") {
    status = "hot";
  } else if (ready || modelState.lead_status === "qualified") {
    status = "qualified";
  } else if (!Object.values(qualification).some(Boolean)) {
    status = "new";
  } else {
    status = "qualifying";
  }

  return {
    status,
    qualification,
    handoff_ready: ready
  };
}

async function persistLeadIfConfigured(lead, origin) {
  const webhook = process.env.LEAD_WEBHOOK_URL;

  if (!webhook || !lead.handoff_ready) {
    return { attempted: false, persisted: false };
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET
          ? { "X-ABZEMO-Lead-Secret": process.env.LEAD_WEBHOOK_SECRET }
          : {})
      },
      body: JSON.stringify({
        source: "ABZEMO AI Global Sales Agent",
        session_id: lead.session_id,
        origin,
        qualification: lead.qualification,
        created_at: new Date().toISOString()
      })
    });

    return { attempted: true, persisted: response.ok };
  } catch (error) {
    console.error("Lead persistence error:", error);
    return { attempted: true, persisted: false };
  }
}

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin)
    });
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

  const language =
    typeof body.response_language === "string"
      ? body.response_language.slice(0, 40)
      : "en";

  const previousQualification = cleanPreviousQualification(
    body.lead_state && body.lead_state.qualification
  );

  const input = [
    {
      role: "developer",
      content: buildInstructions(language, previousQualification)
    },
    ...conversation
  ];

  let response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        max_output_tokens: 700,
        text: {
          format: {
            type: "json_schema",
            name: "abzemo_sales_agent_response",
            strict: true,
            schema: RESPONSE_SCHEMA
          }
        }
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
  const raw = extractText(data);

  if (!raw) {
    return json({ error: "AI provider returned no structured output." }, 502, origin);
  }

  let modelResult;

  try {
    modelResult = JSON.parse(raw);
  } catch {
    return json({ error: "AI provider returned invalid structured output." }, 502, origin);
  }

  const qualification = normalizeQualification(
    modelResult.qualification,
    previousQualification
  );

  const leadState = finalizeState(modelResult, qualification);

  const sessionId =
    typeof body.session_id === "string"
      ? body.session_id.slice(0, 120)
      : null;

  const lead = {
    session_id: sessionId,
    handoff_ready: leadState.handoff_ready,
    qualification: leadState.qualification
  };

  const persistence = await persistLeadIfConfigured(lead, origin);

  return json(
    {
      reply: modelResult.reply.trim(),
      lead_status: leadState.status,
      handoff_ready: leadState.handoff_ready,
      lead_state: leadState,
      qualification: leadState.qualification,
      internal_record_language: "en",
      session_id: sessionId,
      lead_persistence: persistence.persisted ? "stored" : "not_configured"
    },
    200,
    origin
  );
}
