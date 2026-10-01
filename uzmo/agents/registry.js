const AGENTS = [
  { id: "executive", name: "Executive Agent", capabilities: ["strategy", "briefing", "decision", "reporting"] },
  { id: "project", name: "Project Agent", capabilities: ["project", "tasks", "risks", "dependencies", "delivery"] },
  { id: "research", name: "Research Agent", capabilities: ["research", "sources", "web", "synthesis"] },
  { id: "data", name: "Data Agent", capabilities: ["data", "sheets", "database", "analysis", "calculation"] },
  { id: "document", name: "Document Agent", capabilities: ["document", "report", "pdf", "presentation", "writing"] },
  { id: "email", name: "Email Agent", capabilities: ["email", "mail", "send", "communication"] },
  { id: "calendar", name: "Calendar Agent", capabilities: ["calendar", "meeting", "schedule", "availability"] },
  { id: "finance", name: "Finance Agent", capabilities: ["finance", "invoice", "budget", "payment", "reconciliation"] },
  { id: "procurement", name: "Procurement Agent", capabilities: ["procurement", "purchase", "vendor", "po", "quotation"] },
  { id: "content", name: "Content Agent", capabilities: ["content", "copy", "social", "post", "marketing"] },
  { id: "web", name: "Web Agent", capabilities: ["web", "browse", "search", "extract"] },
  { id: "automation", name: "Automation Agent", capabilities: ["automation", "workflow", "trigger", "schedule", "recurring"] }
];

const KEYWORDS = {
  executive: ["executive", "management", "ceo", "decision", "briefing"],
  project: ["project", "task", "milestone", "risk", "dependency"],
  research: ["research", "source", "investigate", "compare", "find"],
  data: ["data", "sheet", "spreadsheet", "database", "analyze", "calculate"],
  document: ["document", "report", "pdf", "presentation", "write"],
  email: ["email", "mail", "send", "inbox"],
  calendar: ["calendar", "meeting", "schedule", "availability"],
  finance: ["finance", "invoice", "budget", "payment", "reconcile"],
  procurement: ["procurement", "purchase", "vendor", "po", "quotation"],
  content: ["content", "social", "instagram", "linkedin", "post", "caption"],
  web: ["web", "browse", "search", "website"],
  automation: ["automate", "automation", "workflow", "recurring", "every day", "every week", "schedule"]
};

export function listAgents() {
  return AGENTS;
}

export function selectAgents(goal) {
  const text = goal.toLowerCase();
  const ranked = AGENTS.map(agent => ({
    agent,
    score: (KEYWORDS[agent.id] || []).reduce((n, word) => n + (text.includes(word) ? 1 : 0), 0)
  })).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

  return (ranked.length ? ranked.slice(0, 4) : [{ agent: AGENTS[0], score: 0 }]).map(item => item.agent);
}
