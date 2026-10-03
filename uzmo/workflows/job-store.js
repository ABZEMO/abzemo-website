const memory = new Map();

export function createJobStore(env = {}) {
  const db = env?.UZMO_DB;
  return {
    configured: Boolean(db),

    async put(job) {
      if (!db) {
        memory.set(job.id, structuredClone(job));
        return job;
      }
      await db.prepare(
        "INSERT OR REPLACE INTO uzmo_jobs (id, workflow_id, input_json, scheduled_for, status, attempts, result_json, error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        job.id,
        job.workflowId,
        JSON.stringify(job.input || {}),
        job.scheduledFor || null,
        job.status,
        Number(job.attempts || 0),
        job.result === undefined ? null : JSON.stringify(job.result),
        job.error || null,
        job.createdAt,
        job.updatedAt
      ).run();
      return job;
    },

    async get(id) {
      if (!db) return memory.get(id) || null;
      const result = await db.prepare(
        "SELECT id, workflow_id, input_json, scheduled_for, status, attempts, result_json, error, created_at, updated_at FROM uzmo_jobs WHERE id = ?"
      ).bind(id).all();
      const row = result.results?.[0];
      return row ? deserialize(row) : null;
    },

    async list() {
      if (!db) return [...memory.values()];
      const result = await db.prepare(
        "SELECT id, workflow_id, input_json, scheduled_for, status, attempts, result_json, error, created_at, updated_at FROM uzmo_jobs ORDER BY created_at DESC"
      ).all();
      return (result.results || []).map(deserialize);
    },

    async remove(id) {
      if (!db) return memory.delete(id);
      const result = await db.prepare("DELETE FROM uzmo_jobs WHERE id = ?").bind(id).run();
      return Boolean(result.meta?.changes);
    }
  };
}

function deserialize(row) {
  return {
    id: row.id,
    workflowId: row.workflow_id,
    input: parse(row.input_json, {}),
    scheduledFor: row.scheduled_for || null,
    status: row.status,
    attempts: Number(row.attempts || 0),
    ...(row.result_json ? { result: parse(row.result_json, null) } : {}),
    ...(row.error ? { error: row.error } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parse(value, fallback) {
  try { return value == null ? fallback : JSON.parse(value); }
  catch { return fallback; }
}
