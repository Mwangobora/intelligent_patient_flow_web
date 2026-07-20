"use client";

import { useMemo } from "react";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasPermission } from "@/types/permissions";

export function useFacilityWorkspace() {
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
    canViewFacilities: can("facilities_facility.view"),
    canCreateFacilities: can("facilities_facility.create"),
    canUpdateFacilities: can("facilities_facility.update"),
    canDeactivateFacilities: can("facilities_facility.deactivate"),
    canViewOrganizations: can("facilities_organization.view"),
    canCreateOrganizations: can("facilities_organization.create"),
    canViewFacilityTypes: can("facilities_facility_type.view"),
    canCreateFacilityTypes: can("facilities_facility_type.create"),
    canManageDepartments: can("facilities_department.manage"),
    canManageSpecialties: can("facilities_specialty.manage"),
    canManageServicePoints: can("facilities_service_point.manage"),
    canManageRooms: can("facilities_room.manage"),
    canManageSchedule: can("facilities_schedule.manage"),
    canManageSettings: can("facilities_settings.manage"),
  };
}
