import { createDatabase } from "../db/client.js";

const memory = new Map();

export function createJobStore(env = {}) {
  const sql = createDatabase(env);
  return {
    configured: Boolean(sql),

    async put(job) {
      if (!sql) {
        memory.set(job.id, structuredClone(job));
        return job;
      }
      await sql`
        INSERT INTO uzmo_jobs
          (id, workflow_id, input_json, scheduled_for, status, attempts, result_json, error, created_at, updated_at)
        VALUES
          (${job.id}, ${job.workflowId}, ${JSON.stringify(job.input || {})}, ${job.scheduledFor || null},
           ${job.status}, ${Number(job.attempts || 0)},
           ${job.result === undefined ? null : JSON.stringify(job.result)},
           ${job.error || null}, ${job.createdAt}, ${job.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          workflow_id = EXCLUDED.workflow_id,
          input_json = EXCLUDED.input_json,
          scheduled_for = EXCLUDED.scheduled_for,
          status = EXCLUDED.status,
          attempts = EXCLUDED.attempts,
          result_json = EXCLUDED.result_json,
          error = EXCLUDED.error,
          updated_at = EXCLUDED.updated_at
      `;
      return job;
    },

    async get(id) {
      if (!sql) return memory.get(id) || null;
      const result = await sql`
        SELECT id, workflow_id, input_json, scheduled_for, status, attempts, result_json, error, created_at, updated_at
        FROM uzmo_jobs WHERE id = ${id} LIMIT 1
      `;
      return result[0] ? deserialize(result[0]) : null;
    },

    async list() {
      if (!sql) return [...memory.values()];
      const result = await sql`
        SELECT id, workflow_id, input_json, scheduled_for, status, attempts, result_json, error, created_at, updated_at
        FROM uzmo_jobs ORDER BY created_at DESC
      `;
      return result.map(deserialize);
    },

    async remove(id) {
      if (!sql) return memory.delete(id);
      const result = await sql`DELETE FROM uzmo_jobs WHERE id = ${id}`;
      return result.length > 0;
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
  try { return value == null ? fallback : typeof value === "string" ? JSON.parse(value) : value; }
  catch { return fallback; }
}
