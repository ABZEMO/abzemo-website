const TOOLS = [
  { id: "google_sheets", name: "Google Sheets", description: "Read and update spreadsheet data through an authorized Google Workspace connection.", capabilities: ["sheet", "spreadsheet", "data"], integration: "google_workspace" },
  { id: "google_drive", name: "Google Drive", description: "Read and manage files through an authorized Google Workspace connection.", capabilities: ["document", "file", "drive"], integration: "google_workspace" },
  { id: "gmail", name: "Gmail", description: "Read and send email through an authorized Google Workspace connection.", capabilities: ["email", "mail"], integration: "google_workspace", requiresApproval: true },
  { id: "google_calendar", name: "Google Calendar", description: "Read and manage calendar events through an authorized Google Workspace connection.", capabilities: ["calendar", "meeting", "schedule"], integration: "google_workspace", requiresApproval: true },
  { id: "youtube", name: "YouTube", description: "Upload videos to an authorized YouTube channel.", capabilities: ["youtube", "video", "upload"], requiresApproval: true },
  { id: "instagram", name: "Instagram", description: "Publish image posts to an authorized Instagram Business or Creator account.", capabilities: ["instagram", "social", "post", "publish"], requiresApproval: true },
  { id: "flickr", name: "Flickr", description: "Upload photos to an authorized Flickr account.", capabilities: ["flickr", "photo", "image", "upload", "social"], requiresApproval: true },
  { id: "microsoft_365", name: "Microsoft 365", description: "Work with Outlook, Excel, OneDrive and Teams through an authorized connection.", capabilities: ["office", "excel", "word", "outlook", "teams"], integration: "microsoft_365" },
  { id: "webhook", name: "Webhook", description: "Call an HTTP webhook.", capabilities: ["webhook", "trigger", "api"], requiresApproval: true },
  { id: "http", name: "HTTP API", description: "Call an external HTTP API.", capabilities: ["api", "rest", "http"] },
  { id: "database", name: "Database", description: "Query an authorized database connection.", capabilities: ["database", "sql", "data"], integration: "database" },
  { id: "mcp", name: "MCP Tool", description: "Invoke an authorized Model Context Protocol tool.", capabilities: ["mcp", "tool"], integration: "mcp" },
  { id: "a2a", name: "Agent-to-Agent", description: "Delegate work to another authorized agent.", capabilities: ["agent", "a2a"], integration: "a2a" }
];
export function listTools() { return TOOLS; }
export function getTool(id) { return TOOLS.find(tool => tool.id === id); }
export function selectTools(goal, agents) {
  const text = goal.toLowerCase(), agentIds = new Set(agents.map(agent => agent.id));
  const selected = TOOLS.filter(tool => tool.capabilities.some(cap => text.includes(cap)) ||
    (tool.id === "google_sheets" && agentIds.has("data")) ||
    (tool.id === "gmail" && agentIds.has("email")) ||
    (tool.id === "google_calendar" && agentIds.has("calendar")));
  return selected.length ? selected : [getTool("http")];
}
