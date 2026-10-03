export const CONNECTOR_MANIFEST = {
  google_workspace: { name: "Google Workspace", auth: "oauth2", capabilities: ["gmail", "calendar", "drive", "sheets"], scopes: ["gmail", "calendar", "drive", "spreadsheets"] },
  microsoft_365: { name: "Microsoft 365", auth: "oauth2", capabilities: ["outlook", "calendar", "onedrive", "excel", "teams"], scopes: ["mail", "calendars", "files", "sites"] },
  zoho_crm: { name: "Zoho CRM", auth: "oauth2_refresh_token", capabilities: ["crm", "leads", "contacts", "accounts", "deals"], env: ["UZMO_ZOHO_CLIENT_ID", "UZMO_ZOHO_CLIENT_SECRET", "UZMO_ZOHO_REFRESH_TOKEN"] },
  sap: { name: "SAP", auth: "oauth2_or_service", capabilities: ["erp", "finance", "procurement", "inventory"] },
  salesforce: { name: "Salesforce", auth: "oauth2", capabilities: ["crm", "leads", "accounts", "opportunities"] },
  database: { name: "Database", auth: "secret", capabilities: ["sql", "query", "reporting"] },
  http_api: { name: "HTTP API", auth: "api_key_or_oauth", capabilities: ["rest", "graphql", "http"] },
  webhook: { name: "Webhook", auth: "secret", capabilities: ["trigger", "event"] },
  mcp: { name: "MCP", auth: "delegated", capabilities: ["tools", "resources", "prompts"] },
  a2a: { name: "Agent-to-Agent", auth: "delegated", capabilities: ["delegate", "discover", "message"] }
};
export function getConnectorManifest(type) { return CONNECTOR_MANIFEST[type] || null; }
export function listConnectorManifests() { return Object.entries(CONNECTOR_MANIFEST).map(([id, value]) => ({ id, ...value })); }
