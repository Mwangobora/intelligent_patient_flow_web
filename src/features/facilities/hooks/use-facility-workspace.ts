"use client";

import { useMemo } from "react";

import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

export function useFacilityWorkspace() {
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
    canViewFacilities: can(permissionCodes.facilitiesFacilityView),
    canCreateFacilities: can(permissionCodes.facilitiesFacilityCreate),
    canUpdateFacilities: can(permissionCodes.facilitiesFacilityUpdate),
    canDeactivateFacilities: can(permissionCodes.facilitiesFacilityDeactivate),
    canViewOrganizations: can(permissionCodes.facilitiesOrganizationView),
    canCreateOrganizations: can(permissionCodes.facilitiesOrganizationCreate),
    canViewFacilityTypes: can(permissionCodes.facilitiesFacilityTypeView),
    canCreateFacilityTypes: can(permissionCodes.facilitiesFacilityTypeCreate),
    canManageDepartments: can(permissionCodes.facilitiesDepartmentManage),
    canManageSpecialties: can(permissionCodes.facilitiesSpecialtyManage),
    canManageServicePoints: can(permissionCodes.facilitiesServicePointManage),
    canManageRooms: can(permissionCodes.facilitiesRoomManage),
    canManageSchedule: can(permissionCodes.facilitiesScheduleManage),
    canManageSettings: can(permissionCodes.facilitiesSettingsManage),
  };
}
