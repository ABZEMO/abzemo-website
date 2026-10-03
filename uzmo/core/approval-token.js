const APPROVAL_TTL_MS = 10 * 60 * 1000;

function bytes(value) {
  return new TextEncoder().encode(value);
}

function base64UrlFromBytes(value) {
  let binary = "";
  const bytesValue = new Uint8Array(value);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytesValue.length; index += chunkSize) {
    binary += String.fromCharCode(...bytesValue.subarray(index, index + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlEncode(value) {
  return base64UrlFromBytes(bytes(value));
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const output = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) output[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(output);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", bytes(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64UrlFromBytes(await crypto.subtle.sign("HMAC", key, bytes(value)));
}

export async function createApprovalToken({ id, userId, orgId, plan }, secret) {
  if (!secret) throw new Error("UZMO approval secret is not configured.");
  const record = { id, userId, orgId, plan, expiresAt: Date.now() + APPROVAL_TTL_MS };
  const payload = base64UrlEncode(JSON.stringify(record));
  return { token: payload + "." + await sign(payload, secret), expiresAt: record.expiresAt };
}

export async function verifyApprovalToken(token, secret, userId, orgId, plan) {
  if (!secret || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature || signature !== await sign(payload, secret)) return null;
  try {
    const record = JSON.parse(base64UrlDecode(payload));
    if (record.expiresAt <= Date.now() || record.userId !== userId || record.orgId !== orgId) return null;
    return JSON.stringify(record.plan) === JSON.stringify(plan) ? record : null;
  } catch {
    return null;
  }
}
