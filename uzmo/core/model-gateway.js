export function createModelGateway(env) {
  const endpoint = env.UZMO_MODEL_ENDPOINT;
  const apiKey = env.UZMO_MODEL_API_KEY;
  const model = env.UZMO_MODEL_NAME || "default";

  return {
    configured: Boolean(endpoint && apiKey),
    async complete(messages, options = {}) {
      if (!endpoint || !apiKey) {
        return {
          configured: false,
          model,
          message: "No UZMO model provider is configured. The orchestration contract can still be tested without a provider."
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Model provider returned HTTP ${response.status}`);
      }

      return await response.json();
    }
  };
}
