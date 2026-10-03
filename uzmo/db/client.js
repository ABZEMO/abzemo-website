import { neon } from "@neondatabase/serverless";

export function createDatabase(env = {}) {
  const url = env?.DATABASE_URL || env?.POSTGRES_URL || env?.NEON_DATABASE_URL;
  if (!url) return null;
  return neon(url);
}
