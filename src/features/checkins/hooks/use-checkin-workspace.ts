"use client";

import { useMemo } from "react";

import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

export function useCheckinWorkspace() {
  const userQuery = useCurrentUserQuery();

  const activeMembership = useMemo(
    () =>
      userQuery.data?.memberships?.find((membership) => membership.is_active) ??
      userQuery.data?.memberships?.[0],
    [userQuery.data?.memberships],
  );

  const permissions = new Set(userQuery.data?.permissions ?? []);
  const isStaff = Boolean(userQuery.data?.is_staff);
  const can = (permission: string) => isStaff || userQuery.data?.permissions === undefined || permissions.has(permission);

  return {
    ...userQuery,
    activeMembership,
    canViewCheckins: can(permissionCodes.checkinsCheckinView),
    canCreateCheckins: can(permissionCodes.checkinsCheckinCreate),
    canVoidCheckins: can(permissionCodes.checkinsCheckinVoid),
    canIssueTokens: can(permissionCodes.checkinsTokenCreate),
    canConsumeTokens: can(permissionCodes.checkinsTokenConsume),
    canRevokeTokens: can(permissionCodes.checkinsTokenRevoke),
  };
}
