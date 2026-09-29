const permissions = {
  member: ["read", "execute_safe"],
  admin: ["read", "execute_safe", "manage_agents", "manage_integrations", "approve"],
  owner: ["read", "execute_safe", "manage_agents", "manage_integrations", "approve", "manage_users", "manage_security"]
};

export function can(role, permission) {
  return Boolean(permissions[role]?.includes(permission));
}

export function listPermissions(role) {
  return permissions[role] || [];
}
