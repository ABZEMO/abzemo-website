const TIMEOUT_MS = 30000;

export function createEmbeddingGateway(env, fetchImpl = fetch) {
  const providers = [openAI(env, fetchImpl), gemini(env, fetchImpl)];
  return {
    configured: providers.some(p => p.configured),
    providers: providers.map(({ id, model, configured }) => ({ id, model, configured })),
    async embed(input) {
      const texts = Array.isArray(input) ? input.map(String) : [String(input ?? "")];
      if (!texts.length || texts.every(t => !t.trim())) return [];
      for (const provider of providers) {
        if (!provider.configured) continue;
        try { return await provider.embed(texts); } catch {}
      }
      return [];
    }
  };
}
function openAI(env, fetchImpl) {
  const key = env.UZMO_OPENAI_API_KEY;
  const model = env.UZMO_OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  const endpoint = env.UZMO_OPENAI_EMBEDDING_ENDPOINT || "https://api.openai.com/v1/embeddings";
  return { id: "openai", model, configured: Boolean(key), embed: async texts => {
    const data = await request(fetchImpl, endpoint, key, { model, input: texts });
    const rows = (data?.data || []).sort((a,b) => a.index-b.index);
    return rows.length === 1 ? (rows[0]?.embedding || []) : rows.map(x => x.embedding || []);
  }};
}
function gemini(env, fetchImpl) {
  const key = env.UZMO_GEMINI_API_KEY;
  const model = env.UZMO_GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
  const endpoint = env.UZMO_GEMINI_EMBEDDING_ENDPOINT || `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`;
  return { id: "gemini", model, configured: Boolean(key), embed: async texts => {
    const values = [];
    for (const text of texts) {
      const data = await request(fetchImpl, `${endpoint}?key=${encodeURIComponent(key)}`, null, { content: { parts: [{ text }] } });
      values.push(data?.embedding?.values || []);
    }
    return values.length === 1 ? values[0] : values;
  }};
}
async function request(fetchImpl, endpoint, key, body) {
  const headers = { "content-type": "application/json" };
  if (key) headers.authorization = `Bearer ${key}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(endpoint, { method: "POST", headers, body: JSON.stringify(body), signal: controller.signal });
    if (!response.ok) throw new Error(`Embedding provider returned HTTP ${response.status}`);
    return response.json();
  } finally { clearTimeout(timer); }
}
