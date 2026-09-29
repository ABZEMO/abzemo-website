const TOOLS = [
  { id: "google_sheets", name: "Google Sheets", capabilities: ["sheet", "spreadsheet", "data"] },
  { id: "google_drive", name: "Google Drive", capabilities: ["document", "file", "drive"] },
  { id: "gmail", name: "Gmail", capabilities: ["email", "mail"] },
  { id: "google_calendar", name: "Google Calendar", capabilities: ["calendar", "meeting", "schedule"] },
  { id: "microsoft_365", name: "Microsoft 365", capabilities: ["office", "excel", "word", "outlook", "teams"] },
  { id: "webhook", name: "Webhook", capabilities: ["webhook", "trigger", "api"] },
  { id: "http", name: "HTTP API", capabilities: ["api", "rest", "http"] },
  { id: "database", name: "Database", capabilities: ["database", "sql", "data"] },
  { id: "mcp", name: "MCP Tool", capabilities: ["mcp", "tool"] },
  { id: "a2a", name: "Agent-to-Agent", capabilities: ["agent", "a2a"] }
];

export function listTools() { return TOOLS; }

export function selectTools(goal, agents) {
  const text = goal.toLowerCase();
  const agentIds = new Set(agents.map(agent => agent.id));
  const selected = TOOLS.filter(tool =>
    tool.capabilities.some(cap => text.includes(cap)) ||
    (tool.id === "google_sheets" && agentIds.has("data")) ||
    (tool.id === "gmail" && agentIds.has("email")) ||
    (tool.id === "google_calendar" && agentIds.has("calendar"))
  );
  return selected.length ? selected : [{ id: "http", name: "HTTP API", capabilities: ["api"] }];
}
