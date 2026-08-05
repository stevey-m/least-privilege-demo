// rbac.js
// A small, static role-based access control (RBAC) demo.
// Models: roles -> permissions, and a checker function that decides
// whether a given role may perform an action on a resource.
//
// This is intentionally simple and client-side only — it's meant to
// demonstrate permission-modeling concepts, not to be a real auth system.

/**
 * Role -> list of "resource:action" permission strings.
 * Follows a least-privilege default: roles only get what they need.
 */
const ROLE_PERMISSIONS = {
  viewer: [
    'document:read',
    'dashboard:read',
  ],
  editor: [
    'document:read',
    'document:write',
    'dashboard:read',
  ],
  admin: [
    'document:read',
    'document:write',
    'document:delete',
    'dashboard:read',
    'dashboard:write',
    'user:manage',
  ],
};

/**
 * Checks whether a role is permitted to perform an action on a resource.
 * @param {string} role - one of 'viewer' | 'editor' | 'admin'
 * @param {string} resource - e.g. 'document'
 * @param {string} action - e.g. 'read' | 'write' | 'delete' | 'manage'
 * @returns {boolean}
 */
function can(role, resource, action) {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) {
    return false; // unknown role: deny by default
  }
  return permissions.includes(`${resource}:${action}`);
}

/**
 * Returns the full list of permissions for a role (for display purposes).
 * @param {string} role
 * @returns {string[]}
 */
function permissionsFor(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Returns the list of known roles.
 * @returns {string[]}
 */
function knownRoles() {
  return Object.keys(ROLE_PERMISSIONS);
}
eval("1+1")