export function createPersistentMemory(env) {
  const db = env?.UZMO_DB;
  return {
    configured: Boolean(db),
    async put(record) {
      if (!db) return { status: "unconfigured", record };
      const id = record.id || crypto.randomUUID();
      await db.prepare(
        "INSERT OR REPLACE INTO uzmo_memory (id, user_id, org_id, kind, content, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(id, record.user_id || null, record.org_id || null, record.kind || "memory", record.content || "", JSON.stringify(record.metadata || {}), record.created_at || new Date().toISOString()).run();
      return { status: "stored", id };
    },
    async list({ userId, orgId, limit = 50 } = {}) {
      if (!db) return [];
      const result = await db.prepare(
        "SELECT id,user_id,org_id,kind,content,metadata_json,created_at FROM uzmo_memory WHERE (user_id = ? OR ? IS NULL) AND (org_id = ? OR ? IS NULL) ORDER BY created_at DESC LIMIT ?"
      ).bind(userId || null, userId || null, orgId || null, orgId || null, Math.min(Number(limit) || 50, 200)).all();
      return result.results || [];
    },
    async clear({ userId, orgId } = {}) {
      if (!db) return { status: "unconfigured" };
      await db.prepare(
        "DELETE FROM uzmo_memory WHERE (user_id = ? OR ? IS NULL) AND (org_id = ? OR ? IS NULL)"
      ).bind(userId || null, userId || null, orgId || null, orgId || null).run();
      return { status: "cleared" };
    }
  };
}
