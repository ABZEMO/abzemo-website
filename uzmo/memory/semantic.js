export function createSemanticMemory({ store, embed = async () => [] } = {}) {
  return {
    async index(record) {
      if (!store) throw new Error("A persistent memory store is required.");
      const vector = await embed(record.content || "");
      return store.put({ ...record, metadata: { ...(record.metadata || {}), embedding: vector } });
    },
    async search(query, options = {}) {
      const vector = await embed(query);
      const records = await store.list({ userId: options.userId, orgId: options.orgId, limit: options.limit || 100 });
      return rankBySimilarity(vector, records).slice(0, options.limit || 8);
    }
  };
}

function rankBySimilarity(queryVector, records) {
  if (!Array.isArray(queryVector) || !queryVector.length) return records;
  return records.map(record => {
    let embedding;
    try { embedding = JSON.parse(record.metadata_json || "{}").embedding; } catch { embedding = null; }
    return { ...record, score: cosine(queryVector, embedding) };
  }).sort((a, b) => b.score - a.score);
}

function cosine(a, b) {
  if (!Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i];
  }
  return aa && bb ? dot / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
}
