import { createHash } from "node:crypto";

export function stableHash(value) {
  const input = typeof value === "string" ? value : JSON.stringify(value);
  return createHash("sha256").update(input ?? "").digest("hex");
}
