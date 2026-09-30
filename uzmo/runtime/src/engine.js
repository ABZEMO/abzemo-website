import { selectAgents } from "./agent-registry.js";

function textFromPayload(payload) {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  return JSON.stringify(payload);
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

    const webRequested = /\b(web|internet|research|latest|regulation|market)\b/i.test(text);
    const approvalRequired = this.config.agents?.approvalRequiredByDefault !== false;

    const result = {
      id: crypto.randomUUID(),
      goal: text,
      agents: agents.map(agent => agent.name),
      steps: [
        { name: "Understand", status: "complete" },
        { name: "Select specialist agents", status: "complete", agents: agents.map(agent => agent.name) },
        { name: "Observe source", status: event ? "complete" : "not-applicable" },
        { name: "Web research", status: webRequested ? "requested" : "not-requested" },
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
