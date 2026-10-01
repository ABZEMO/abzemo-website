export const INTEGRATION_TYPES = [
  "google_workspace", "microsoft_365", "sap", "salesforce",
  "database", "http_api", "webhook", "mcp", "a2a"
];

export function createIntegration({ id, type, capabilities = [], authorize, execute }) {
  if (!id || !INTEGRATION_TYPES.includes(type)) throw new Error("Invalid UZMO integration type.");
  if (typeof execute !== "function") throw new Error("Integration execute function is required.");
  return { id, type, capabilities, authorize, execute };
}

export function createIntegrationRegistry(integrations = []) {
  const map = new Map(integrations.map(item => [item.id, item]));
  return {
    get: id => map.get(id),
    list: () => [...map.values()]
  };
}
