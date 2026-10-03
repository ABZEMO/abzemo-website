const TIMEOUT_MS = 45000;

export function createModelGateway(env, fetchImpl = fetch) {
  const providers = [
    openAI(env, fetchImpl),
    anthropic(env, fetchImpl),
    gemini(env, fetchImpl)
  ];

  return {
    configured: providers.some(provider => provider.configured),
    providers: providers.map(({ id, model, configured }) => ({ id, model, configured })),
    async complete(messages, options = {}) {
      if (!Array.isArray(messages) || messages.length === 0) throw new Error("messages is required");
      const preferred = options.provider || env.UZMO_MODEL_PROVIDER;
      const ordered = preferred
        ? [...providers.filter(p => p.id === preferred), ...providers.filter(p => p.id !== preferred)]
        : providers;
      let lastError;
      for (const provider of ordered) {
        if (!provider.configured) continue;
        try { return await provider.complete(messages, options); }
        catch (error) { lastError = error; }
      }
      if (lastError) throw lastError;
      return { configured: false, message: "No UZMO model provider is configured." };
    }
  };
}

function openAI(env, fetchImpl) {
  const key = env.UZMO_OPENAI_API_KEY || (env.UZMO_MODEL_PROVIDER === "openai" ? env.UZMO_MODEL_API_KEY : null);
  const model = env.UZMO_OPENAI_MODEL || env.UZMO_MODEL_NAME || "gpt-4o-mini";
  const endpoint = env.UZMO_OPENAI_ENDPOINT || "https://api.openai.com/v1/chat/completions";
  return provider("openai", key, model, async (messages, options) => {
    const data = await request(fetchImpl, endpoint, key, {
      model, messages, temperature: options.temperature ?? 0.2
    });
    return { provider: "openai", model, text: data?.choices?.[0]?.message?.content || "", tool_calls: data?.choices?.[0]?.message?.tool_calls || [] };
  });
}

function anthropic(env, fetchImpl) {
  const key = env.UZMO_ANTHROPIC_API_KEY;
  const model = env.UZMO_ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const endpoint = env.UZMO_ANTHROPIC_ENDPOINT || "https://api.anthropic.com/v1/messages";
  return provider("anthropic", key, model, async (messages, options) => {
    const system = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const input = messages.filter(m => m.role !== "system");
    const data = await request(fetchImpl, endpoint, key, {
      model, max_tokens: options.max_tokens || 4096, system, messages: input
    }, { "anthropic-version": "2023-06-01" });
    return { provider: "anthropic", model, text: (data?.content || []).filter(x => x.type === "text").map(x => x.text).join(""), tool_calls: (data?.content || []).filter(x => x.type === "tool_use") };
  });
}

function gemini(env, fetchImpl) {
  const key = env.UZMO_GEMINI_API_KEY;
  const model = env.UZMO_GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = env.UZMO_GEMINI_ENDPOINT || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return provider("gemini", key, model, async (messages) => {
    const contents = messages.filter(m => m.role !== "system").map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content ?? "") }]
    }));
    const system = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const data = await request(fetchImpl, `${endpoint}?key=${encodeURIComponent(key)}`, null, {
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents
    });
    return { provider: "gemini", model, text: (data?.candidates?.[0]?.content?.parts || []).filter(x => x.text).map(x => x.text).join(""), tool_calls: [] };
  });
}

function provider(id, key, model, complete) {
  return { id, model, configured: Boolean(key), complete };
}

async function request(fetchImpl, endpoint, key, body, extraHeaders = {}) {
  const headers = { "content-type": "application/json", ...extraHeaders };
  if (key) headers.authorization = `Bearer ${key}`;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST", headers, body: JSON.stringify(body), signal: controller?.signal
    });
    if (!response.ok) throw new Error(`Model provider returned HTTP ${response.status}`);
    return response.json();
  } finally {
    if (timer) clearTimeout(timer);
  }
}
