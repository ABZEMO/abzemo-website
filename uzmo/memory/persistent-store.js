export function createPersistentMemory(env) {
  const db = env?.UZMO_DB;
  return {
    configured: Boolean(db),

    async put(record) {
      if (!db) return { status: "unconfigured", record };
      if (!record.org_id) return { status: "rejected", reason: "org_id is required" };

      const id = record.id || crypto.randomUUID();
      await db.prepare(
        "INSERT OR REPLACE INTO uzmo_memory (id, user_id, org_id, kind, content, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        id,
        record.user_id || null,
        record.org_id,
        record.kind || "memory",
        record.content || "",
        JSON.stringify(record.metadata || {}),
        record.created_at || new Date().toISOString()
      ).run();

      return { status: "stored", id };
    },

    async list({ userId, orgId, limit = 50 } = {}) {
      if (!db || !orgId) return [];
      const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
      const result = await db.prepare(
        "SELECT id,user_id,org_id,kind,content,metadata_json,created_at FROM uzmo_memory WHERE org_id = ? AND (user_id = ? OR ? IS NULL) ORDER BY created_at DESC LIMIT ?"
      ).bind(orgId, userId || null, userId || null, safeLimit).all();
      return result.results || [];
    },

    async clear({ userId, orgId } = {}) {
      if (!orgId) return { status: "rejected", reason: "orgId is required" };
      if (!db) return { status: "unconfigured" };

      await db.prepare(
        "DELETE FROM uzmo_memory WHERE org_id = ? AND (user_id = ? OR ? IS NULL)"
      ).bind(orgId, userId || null, userId || null).run();

      return { status: "cleared" };
    }
  };
}
