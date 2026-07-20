"use client";

import { useMemo } from "react";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasPermission } from "@/types/permissions";

export function useCheckinWorkspace() {
  const userQuery = useCurrentUserQuery();

  const activeMembership = useMemo(
    () =>
      userQuery.data?.memberships?.find((membership) => membership.is_active) ??
      userQuery.data?.memberships?.[0],
    [userQuery.data?.memberships],
  );

  const can = (permission: string) => hasPermission(userQuery.data, permission);

  return {
    ...userQuery,
    activeMembership,
    canViewCheckins: can("checkins_checkin.view"),
    canCreateCheckins: can("checkins_checkin.create"),
    canVoidCheckins: can("checkins_checkin.void"),
    canIssueTokens: can("checkins_token.create"),
    canConsumeTokens: can("checkins_token.consume"),
    canRevokeTokens: can("checkins_token.revoke"),
  };
}
