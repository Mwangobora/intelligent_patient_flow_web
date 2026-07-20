"use client";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasPermission } from "@/types/permissions";

export function useAuditWorkspace() {
  const userQuery = useCurrentUserQuery();
  const can = (permission: string) => hasPermission(userQuery.data, permission);

  return {
    ...userQuery,
    canViewAuditLogs: can("audit_log.view"),
    canCreateAuditLogs: can("audit_log.create"),
    canExportAuditLogs: can("audit_log.export"),
    canViewAuditSummary: can("audit_log.summary"),
  };
}
