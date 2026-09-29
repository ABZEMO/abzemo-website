import { listTools } from "./registry.js";

export function toolSchemas(tools = listTools()) {
  return tools.map(tool => ({
    type: "function",
    function: {
      name: tool.id,
      description: tool.description || `UZMO ${tool.name} integration`,
      parameters: tool.inputSchema || { type: "object", additionalProperties: true }
    }
  }));
}
