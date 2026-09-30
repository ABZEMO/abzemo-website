const crypto = require("crypto");

const VAULT_URL_ENV = "UZMO_TOKEN_STORE_URL";
const VAULT_AUTH_ENV = "UZMO_TOKEN_STORE_AUTH_TOKEN";
const ENCRYPTION_KEY_ENV = "UZMO_TOKEN_ENCRYPTION_KEY";

function encryptSecret(value) {
  const key = Buffer.from(process.env[ENCRYPTION_KEY_ENV], "base64");
  if (key.length !== 32) throw new Error("invalid_encryption_key");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url")
  };
}

async function persistToken(record) {
  const vaultUrl = process.env[VAULT_URL_ENV];
  const vaultAuth = process.env[VAULT_AUTH_ENV];
  const encryptionKey = process.env[ENCRYPTION_KEY_ENV];

  if (!vaultUrl || !vaultAuth || !encryptionKey) {
    throw new Error("token_store_not_configured");
  }

  const encrypted = encryptSecret(JSON.stringify(record));
  const response = await fetch(vaultUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + vaultAuth
    },
    body: JSON.stringify({
      provider: "google_workspace",
      subject: record.subject || null,
      secret: encrypted
    })
  });

  if (!response.ok) throw new Error("token_store_write_failed");
}

module.exports = { encryptSecret, persistToken };
