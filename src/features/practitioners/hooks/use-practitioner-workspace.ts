"use client";

import { useMemo } from "react";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasPermission } from "@/types/permissions";

export function usePractitionerWorkspace() {
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
    canViewPractitioners: can("practitioners_practitioner.view"),
    canCreatePractitioners: can("practitioners_practitioner.create"),
    canUpdatePractitioners: can("practitioners_practitioner.update"),
    canDeactivatePractitioners: can("practitioners_practitioner.deactivate"),
    canViewTypes: can("practitioners_type.view"),
    canManageTypes: can("practitioners_type.manage"),
    canManageAssignments: can("practitioners_assignment.manage"),
    canManageAvailability: can("scheduling_availability.manage"),
    canManageShifts: can("scheduling_shift.manage"),
    canManageLeave: can("scheduling_leave.manage"),
    canManageSlots: can("scheduling_slot.manage"),
  };
}
