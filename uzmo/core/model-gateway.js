const TIMEOUT_MS = 45000;
const RETRIES = 2;

export function createModelGateway(env, fetchImpl = fetch) {
  const providers = [openAI(env, fetchImpl), anthropic(env, fetchImpl), gemini(env, fetchImpl)];
  return {
    configured: providers.some(p => p.configured),
    providers: providers.map(({ id, model, configured }) => ({ id, model, configured })),
    async complete(messages, options = {}) {
      if (!Array.isArray(messages) || !messages.length) throw new Error("messages is required");
      const preferred = options.provider || env.UZMO_MODEL_PROVIDER;
      const ordered = preferred ? [...providers.filter(p => p.id === preferred), ...providers.filter(p => p.id !== preferred)] : providers;
      let lastError;
      for (const p of ordered) {
        if (!p.configured) continue;
        try { return await withRetries(() => p.complete(messages, options)); } catch (error) { lastError = error; }
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
    const data = await request(fetchImpl, endpoint, key, { model, messages: toOpenAIMessages(messages), temperature: options.temperature ?? 0.2, ...(options.tools ? { tools: options.tools, tool_choice: options.tool_choice || "auto" } : {}) });
    const message = data?.choices?.[0]?.message || {};
    return normalize("openai", model, message.content || "", message.tool_calls || [], data?.usage);
  });
}
function anthropic(env, fetchImpl) {
  const key = env.UZMO_ANTHROPIC_API_KEY;
  const model = env.UZMO_ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const endpoint = env.UZMO_ANTHROPIC_ENDPOINT || "https://api.anthropic.com/v1/messages";
  return provider("anthropic", key, model, async (messages, options) => {
    const system = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const input = toAnthropicMessages(messages);
    const data = await request(fetchImpl, endpoint, key, { model, max_tokens: options.max_tokens || 4096, system, messages: input, ...(options.tools ? { tools: options.tools } : {}) }, { "anthropic-version": "2023-06-01" });
    const blocks = data?.content || [];
    return normalize("anthropic", model, blocks.filter(x => x.type === "text").map(x => x.text).join(""), blocks.filter(x => x.type === "tool_use"), data?.usage);
  });
}
function gemini(env, fetchImpl) {
  const key = env.UZMO_GEMINI_API_KEY;
  const model = env.UZMO_GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = env.UZMO_GEMINI_ENDPOINT || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return provider("gemini", key, model, async (messages, options = {}) => {
    const contents = toGeminiMessages(messages);
    const system = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const tools = options.tools?.length ? [{ functionDeclarations: options.tools.map(tool => ({ name: tool.function?.name || tool.name, description: tool.function?.description || "", parameters: tool.function?.parameters || tool.input_schema || { type: "object", properties: {} } })) }] : undefined;
    const data = await request(fetchImpl, `${endpoint}?key=${encodeURIComponent(key)}`, null, { ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}), contents, ...(tools ? { tools } : {}) });
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const calls = parts.filter(x => x.functionCall).map((x, i) => ({ id: `gemini-${Date.now()}-${i}`, name: x.functionCall.name, input: x.functionCall.args || {} }));
    return normalize("gemini", model, parts.filter(x => x.text).map(x => x.text).join(""), calls, data?.usageMetadata);
  });
}
function provider(id, key, model, complete) { return { id, model, configured: Boolean(key), complete }; }
function normalize(providerName, model, text, toolCalls = [], usage = null) {
  return { provider: providerName, model, text: String(text || ""), tool_calls: normalizeToolCalls(providerName, toolCalls), usage: usage || null };
}
function normalizeToolCalls(providerName, calls) {
  return (calls || []).map(call => providerName === "openai" ? { id: call.id, name: call.function?.name, arguments: parseJson(call.function?.arguments) } : { id: call.id, name: call.name, arguments: call.input || {} });
}
function parseJson(value) { try { return typeof value === "string" ? JSON.parse(value) : (value || {}); } catch { return {}; } }
async function withRetries(fn) {
  let lastError;
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try { return await fn(); } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === RETRIES) throw error;
      await new Promise(resolve => setTimeout(resolve, 250 * (2 ** attempt)));
    }
  }
  throw lastError;
}
function isRetryable(error) { return /HTTP (429|500|502|503|504)|timed out|aborted|network/i.test(String(error?.message || "")); }
async function request(fetchImpl, endpoint, key, body, extraHeaders = {}) {
  const headers = { "content-type": "application/json", ...extraHeaders };
  if (key) headers.authorization = `Bearer ${key}`;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const response = await fetchImpl(endpoint, { method: "POST", headers, body: JSON.stringify(body), signal: controller?.signal });
    if (!response.ok) throw new Error(`Model provider returned HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Model provider request timed out");
    throw error;
  } finally { if (timer) clearTimeout(timer); }
}
