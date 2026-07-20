"use client";

import { useMemo } from "react";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasPermission } from "@/types/permissions";

export function useReportingWorkspace() {
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
    canViewReports: can("reporting_report.view"),
    canGenerateReports: can("reporting_report.generate"),
    canDownloadReports: can("reporting_report.download"),
    canCancelReports: can("reporting_report.cancel"),
    canViewAnalytics: can("reporting_analytics.view"),
  };
}
