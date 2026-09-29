const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function createSession({ userId, orgId, role = "member" }) {
  if (!userId) throw new Error("userId is required");
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    org_id: orgId || null,
    role,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString()
  };
}

export function isSessionValid(session) {
  return Boolean(session?.user_id && new Date(session.expires_at).getTime() > Date.now());
}

export function authorize(session, requiredRole = "member") {
  if (!isSessionValid(session)) return false;
  const rank = { member: 1, admin: 2, owner: 3 };
  return (rank[session.role] || 0) >= (rank[requiredRole] || 1);
}
