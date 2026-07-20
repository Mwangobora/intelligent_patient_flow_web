"use client";

import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

export function useAuditWorkspace() {
  const userQuery = useCurrentUserQuery();
  const permissions = new Set(userQuery.data?.permissions ?? []);
  const isStaff = Boolean(userQuery.data?.is_staff);
  const can = (permission: string) =>
    isStaff || userQuery.data?.permissions === undefined || permissions.has(permission);

  return {
    ...userQuery,
    canViewAuditLogs: can(permissionCodes.auditLogView),
    canCreateAuditLogs: can(permissionCodes.auditLogCreate),
    canExportAuditLogs: can(permissionCodes.auditLogExport),
    canViewAuditSummary: can(permissionCodes.auditLogSummary),
  };
}
