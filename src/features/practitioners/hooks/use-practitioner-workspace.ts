"use client";

import { useMemo } from "react";

import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

export function usePractitionerWorkspace() {
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
    canViewPractitioners: can(permissionCodes.practitionersPractitionerView),
    canCreatePractitioners: can(permissionCodes.practitionersPractitionerCreate),
    canUpdatePractitioners: can(permissionCodes.practitionersPractitionerUpdate),
    canDeactivatePractitioners: can(permissionCodes.practitionersPractitionerDeactivate),
    canViewTypes: can(permissionCodes.practitionersTypeView),
    canManageTypes: can(permissionCodes.practitionersTypeManage),
    canManageAssignments: can(permissionCodes.practitionersAssignmentManage),
    canManageAvailability: can(permissionCodes.schedulingAvailabilityManage),
    canManageShifts: can(permissionCodes.schedulingShiftManage),
    canManageLeave: can(permissionCodes.schedulingLeaveManage),
    canManageSlots: can(permissionCodes.schedulingSlotManage),
  };
}
