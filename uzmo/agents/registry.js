const AGENTS = [
  { id: "executive", name: "Executive Agent", capabilities: ["strategy", "briefing", "decision", "reporting"] },
  { id: "project", name: "Project Agent", capabilities: ["project", "tasks", "risks", "dependencies", "delivery"] },
  { id: "research", name: "Research Agent", capabilities: ["research", "sources", "web", "synthesis"] },
  { id: "data", name: "Data Agent", capabilities: ["data", "sheets", "database", "analysis", "calculation"] },
  { id: "document", name: "Document Agent", capabilities: ["document", "report", "pdf", "presentation", "writing"] },
  { id: "email", name: "Email Agent", capabilities: ["email", "mail", "send", "communication"] },
  { id: "calendar", name: "Calendar Agent", capabilities: ["calendar", "meeting", "schedule", "availability"] },
  { id: "finance", name: "Finance Agent", capabilities: ["finance", "invoice", "budget", "payment", "reconciliation", "accounting", "ifrs", "ias", "audit"] },
  { id: "procurement", name: "Procurement Agent", capabilities: ["procurement", "purchase", "vendor", "po", "quotation", "sourcing", "supplier", "compliance"] },
  { id: "compliance", name: "Compliance Agent", capabilities: ["compliance", "regulatory", "policy", "control", "risk", "remediation", "audit"] },
  { id: "hr", name: "HR Agent", capabilities: ["hr", "human resources", "recruitment", "employee", "payroll", "leave", "performance"] },
  { id: "operations", name: "Operations Agent", capabilities: ["operations", "process", "sop", "capacity", "productivity", "service"] },
  { id: "supply_chain", name: "Supply Chain Agent", capabilities: ["supply chain", "logistics", "inventory", "warehouse", "shipment", "forecast"] },
  { id: "legal", name: "Legal & Policy Agent", capabilities: ["legal", "law", "contract", "clause", "regulation", "jurisdiction"] },
  { id: "healthcare", name: "Healthcare Agent", capabilities: ["healthcare", "hospital", "clinical", "patient", "treatment", "medical"] },
  { id: "pharma", name: "Pharmaceutical Agent", capabilities: ["pharma", "pharmaceutical", "medicine", "drug", "regulatory affairs", "pharmacovigilance"] },
  { id: "education", name: "Education Agent", capabilities: ["education", "university", "admission", "scholarship", "course", "academic"] },
  { id: "customs", name: "Customs & Trade Agent", capabilities: ["customs", "hs code", "tariff", "import", "export", "trade"] },
  { id: "quality", name: "Quality Agent", capabilities: ["quality", "qa", "qc", "inspection", "nonconformance", "corrective action"] },
  { id: "risk", name: "Risk Agent", capabilities: ["risk", "risk assessment", "mitigation", "business continuity", "incident"] },
  { id: "content", name: "Content Agent", capabilities: ["content", "copy", "social", "post", "marketing"] },
  { id: "web", name: "Web Agent", capabilities: ["web", "browse", "search", "extract"] },
  { id: "automation", name: "Automation Agent", capabilities: ["automation", "workflow", "trigger", "schedule", "recurring"] }
];

function matchesTerm(text, term) {
  const escaped = term.replace(/[.*+?^$()|[\]\\]/g, "\\function matchesTerm(text, term) {
  const escaped = term.replace(/[.*+?^$()|[\]\\]/g, "\\const KEYWORDS = {");
  return new RegExp("\\b" + escaped + "\\b", "i").test(text);
}");
  return new RegExp("\\b" + escaped + "\\b", "i").test(text);
}

const KEYWORDS = {
  executive: ["executive", "management", "ceo", "decision", "briefing"],
  project: ["project", "task", "milestone", "risk", "dependency"],
  research: ["research", "source", "investigate", "compare", "find"],
  data: ["data", "sheet", "spreadsheet", "database", "analyze", "calculate"],
  document: ["document", "report", "pdf", "presentation", "write"],
  email: ["email", "mail", "send", "inbox"],
  calendar: ["calendar", "meeting", "schedule", "availability"],
  finance: ["finance", "invoice", "budget", "payment", "reconcile", "accounting", "ifrs", "ias", "audit"],
  procurement: ["procurement", "purchase", "vendor", "po", "quotation", "sourcing", "supplier"],
  compliance: ["compliance", "regulatory", "policy", "control", "remediation", "audit"],
  hr: ["hr", "human resources", "recruitment", "employee", "payroll", "leave", "performance"],
  operations: ["operations", "process", "sop", "capacity", "productivity", "service"],
  supply_chain: ["supply chain", "logistics", "inventory", "warehouse", "shipment", "forecast"],
  legal: ["legal", "law", "contract", "clause", "regulation", "jurisdiction"],
  healthcare: ["healthcare", "hospital", "clinical", "patient", "treatment", "medical"],
  pharma: ["pharma", "pharmaceutical", "medicine", "drug", "regulatory affairs", "pharmacovigilance"],
  education: ["education", "university", "admission", "scholarship", "course", "academic"],
  customs: ["customs", "hs code", "tariff", "import", "export", "trade"],
  quality: ["quality", "qa", "qc", "inspection", "nonconformance", "corrective action"],
  risk: ["risk", "risk assessment", "mitigation", "business continuity", "incident"],
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
    score: (KEYWORDS[agent.id] || []).reduce((n, word) => n + (matchesTerm(text, word) ? 1 : 0), 0)
  })).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

  return (ranked.length ? ranked.slice(0, 4) : [{ agent: AGENTS[0], score: 0 }]).map(item => item.agent);
}
