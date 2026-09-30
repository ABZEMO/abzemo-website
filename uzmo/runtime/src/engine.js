import { selectAgents } from "./agent-registry.js";
import { webResearch } from "./web-research.js";

function textFromPayload(payload) {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  return JSON.stringify(payload);
}

function needsWebResearch(text, event) {
  if (/\b(web|internet|research|latest|regulation|market|law|compliance|tariff|competitor)\b/i.test(text)) return true;
  return Boolean(event && /\b(regulatory|compliance|external|market|law)\b/i.test(text));
}

async function modelPlan({ config, goal, agents, web }) {
  const endpoint = config.model?.endpoint;
  if (!endpoint) return null;
  const headers = { "content-type": "application/json", accept: "application/json" };
  if (config.model.apiKeyEnv && process.env[config.model.apiKeyEnv]) headers.authorization = "Bearer " + process.env[config.model.apiKeyEnv];
  const prompt = [
    "You are the UZMO planning layer.",
    "Return JSON only with keys: summary, proposedActions (array), needsApproval (boolean).",
    "Do not invent completed actions. Only propose actions that the runtime can later validate.",
    "Goal:", goal,
    "Selected agents:", agents.map(a => a.name).join(", "),
    "Web research:", JSON.stringify(web || {})
  ].join("\n");
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model.model || undefined,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) throw new Error("Model planning HTTP " + response.status);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || data?.content || data;
  if (typeof content === "object") return content;
  try { return JSON.parse(content); } catch { return { summary: String(content), proposedActions: [], needsApproval: true }; }
}

export class AgentEngine {
  constructor({ crm, config = {} }) {
    this.crm = crm;
    this.config = config;
  }

  async execute({ goal, event = null, requestedAgent = null }) {
    const text = goal || textFromPayload(event?.payload);
    const agents = requestedAgent
      ? selectAgents({ domain: requestedAgent, text })
      : selectAgents({ domain: event?.domain, text });

    const webRequested = this.config.webResearch?.enabled !== false && needsWebResearch(text, event);
    let web = { enabled: false, results: [] };
    if (webRequested) {
      try {
        web = await webResearch({
          endpoint: this.config.webResearch?.endpoint,
          apiKeyEnv: this.config.webResearch?.apiKeyEnv,
          query: text
        });
      } catch (error) {
        web = { enabled: true, results: [], error: error.message };
      }
    }

    let plan = null;
    try {
      plan = await modelPlan({ config: this.config, goal: text, agents, web });
    } catch (error) {
      plan = { summary: "Model planning unavailable", proposedActions: [], needsApproval: true, error: error.message };
    }

    const approvalRequired = this.config.agents?.approvalRequiredByDefault !== false || plan?.needsApproval === true;
    const result = {
      id: crypto.randomUUID(),
      goal: text,
      agents: agents.map(agent => agent.name),
      webResearch: web,
      modelPlan: plan,
      steps: [
        { name: "Understand", status: "complete" },
        { name: "Select specialist agents", status: "complete", agents: agents.map(agent => agent.name) },
        { name: "Observe source", status: event ? "complete" : "not-applicable" },
        { name: "Web research", status: webRequested ? (web.results?.length ? "complete" : "attempted") : "not-requested" },
        { name: "Execute permitted actions", status: "pending" },
        { name: "Verify and report", status: "pending" }
      ],
      approvalRequired,
      eventId: event?.id || null,
      createdAt: new Date().toISOString()
    };

    const record = {
      id: result.id,
      externalKey: event ? event.sourceId + ":" + event.target + ":" + event.observedAt : result.id,
      type: "agent-run",
      status: approvalRequired && event ? "awaiting-approval" : "completed",
      goal: text,
      agents: result.agents,
      sourceId: event?.sourceId || null,
      target: event?.target || null,
      webResearchRequested: webRequested,
      result
    };

    await this.crm.upsert(record);
    await this.crm.logActivity({ type: "agent-run", runId: result.id, status: record.status, agents: result.agents });
    result.steps[4].status = record.status === "completed" ? "complete" : "awaiting-approval";
    result.steps[5].status = record.status === "completed" ? "complete" : "waiting";
    return { ...result, status: record.status };
  }
}
