import { listAgents } from "./registry.js";

export function createDelegationRouter({ runtimeFactory, agentRegistry = listAgents() } = {}) {
  return {
    async delegate({ agentId, goal, context = {}, env = {}, plan }) {
      const agent = agentRegistry.find(item => item.id === agentId);
      if (!agent) throw new Error(`Unknown UZMO agent: ${agentId}`);
      if (!runtimeFactory) throw new Error("A runtime factory is required for delegation.");
      return runtimeFactory({ agent, env }).run({ goal, plan, context, env });
    }
  };
}
