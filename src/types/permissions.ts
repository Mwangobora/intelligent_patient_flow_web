export type PermissionCode = string;

export type UserPermissionSet = ReadonlySet<PermissionCode>;

type PermissionUser = {
  permissions?: readonly PermissionCode[] | null;
  is_superuser?: boolean | null;
  has_global_access?: boolean | null;
};

type PermissionSource = readonly PermissionCode[] | UserPermissionSet | PermissionUser | null | undefined;

function isPermissionUser(source: PermissionSource): source is PermissionUser {
  return Boolean(source && !(source instanceof Set) && !Array.isArray(source) && "permissions" in source);
}

function toPermissionSet(userPermissions: PermissionSource) {
  if (!userPermissions) return new Set<PermissionCode>();
  if (isPermissionUser(userPermissions)) return new Set(userPermissions.permissions ?? []);
  return userPermissions instanceof Set ? userPermissions : new Set(userPermissions);
}

export function hasPermission(userPermissions: PermissionSource, permission: PermissionCode) {
  if (isPermissionUser(userPermissions) && (userPermissions.is_superuser || userPermissions.has_global_access)) return true;
  return toPermissionSet(userPermissions).has(permission);
}

export function hasAnyPermission(userPermissions: PermissionSource, permissions: readonly PermissionCode[]) {
  if (!permissions.length) return true;
  if (isPermissionUser(userPermissions) && (userPermissions.is_superuser || userPermissions.has_global_access)) return true;
  const permissionSet = toPermissionSet(userPermissions);
  return permissions.some((permission) => permissionSet.has(permission));
}

export function hasAllPermissions(userPermissions: PermissionSource, permissions: readonly PermissionCode[]) {
  if (isPermissionUser(userPermissions) && (userPermissions.is_superuser || userPermissions.has_global_access)) return true;
  const permissionSet = toPermissionSet(userPermissions);
  return permissions.every((permission) => permissionSet.has(permission));
}
