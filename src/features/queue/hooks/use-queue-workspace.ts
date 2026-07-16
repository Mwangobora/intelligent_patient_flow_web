"use client";

import { useMemo } from "react";

import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

export function useQueueWorkspace() {
  const userQuery = useCurrentUserQuery();

  const activeMembership = useMemo(
    () =>
      userQuery.data?.memberships?.find((membership) => membership.is_active) ??
      userQuery.data?.memberships?.[0],
    [userQuery.data?.memberships],
  );

  const permissions = new Set(userQuery.data?.permissions ?? []);
  const isStaff = Boolean(userQuery.data?.is_staff);
  const hasScope = Boolean(activeMembership?.organization || activeMembership?.facility);

  const can = (permission: string) =>
    isStaff || userQuery.data?.permissions === undefined || permissions.has(permission);

  return {
    ...userQuery,
    activeMembership,
    hasScope,
    canViewQueues: can(permissionCodes.queueingQueueView) || can(permissionCodes.queueingEntryView),
    canManageQueues: can(permissionCodes.queueingQueueManage),
    canCreateEntries: can(permissionCodes.queueingEntryCreate),
    canCallEntries: can(permissionCodes.queueingEntryCall),
    canSkipEntries: can(permissionCodes.queueingEntrySkip),
    canStartService: can(permissionCodes.queueingEntryStartService),
    canCompleteService: can(permissionCodes.queueingEntryCompleteService),
    canCancelEntries: can(permissionCodes.queueingEntryCancel),
    canTransferEntries: can(permissionCodes.queueingEntryTransfer),
    canChangePriority: can(permissionCodes.queueingPriorityManage),
  };
}
