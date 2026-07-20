"use client";

import { useMemo } from "react";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasAnyPermission, hasPermission } from "@/types/permissions";

export function useQueueWorkspace() {
  const userQuery = useCurrentUserQuery();

  const activeMembership = useMemo(
    () =>
      userQuery.data?.memberships?.find((membership) => membership.is_active) ??
      userQuery.data?.memberships?.[0],
    [userQuery.data?.memberships],
  );

  const hasScope = Boolean(userQuery.data?.has_global_access || activeMembership?.organization || activeMembership?.facility);
  const can = (permission: string) => hasPermission(userQuery.data, permission);

  return {
    ...userQuery,
    activeMembership,
    hasScope,
    canViewQueues: hasAnyPermission(userQuery.data, ["queueing_queue.view", "queueing_entry.view"]),
    canManageQueues: can("queueing_queue.manage"),
    canCreateEntries: can("queueing_entry.create"),
    canCallEntries: can("queueing_entry.call"),
    canSkipEntries: can("queueing_entry.skip"),
    canStartService: can("queueing_entry.start_service"),
    canCompleteService: can("queueing_entry.complete_service"),
    canCancelEntries: can("queueing_entry.cancel"),
    canTransferEntries: can("queueing_entry.transfer"),
    canChangePriority: can("queueing_priority.manage"),
  };
}
