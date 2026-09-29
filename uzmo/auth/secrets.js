export function getSecret(env, name) {
  if (!name) throw new Error("Secret name is required");
  const value = env?.[name];
  if (!value) throw new Error(`Required secret is not configured: ${name}`);
  return value;
}

export function hasSecret(env, name) {
  return Boolean(env?.[name]);
}
