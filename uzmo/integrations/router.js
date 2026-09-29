import { createIntegrationRegistry } from "./contract.js";

export function createIntegrationRouter(integrations = []) {
  const registry = createIntegrationRegistry(integrations);
  return {
    list() { return registry.list().map(({ id, type, capabilities }) => ({ id, type, capabilities })); },
    async execute(integrationId, operation, input = {}, context = {}) {
      const integration = registry.get(integrationId);
      if (!integration) return { status: "unconfigured", integration: integrationId };
      if (typeof integration.authorize === "function") await integration.authorize(context);
      return integration.execute({ operation, input, context });
    }
  };
}
