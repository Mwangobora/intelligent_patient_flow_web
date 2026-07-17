"use client";

import { useMemo } from "react";

import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

export function usePatientWorkspace() {
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
    canViewPatients: can(permissionCodes.patientsPatientView),
    canCreatePatients: can(permissionCodes.patientsPatientCreate),
    canUpdatePatients: can(permissionCodes.patientsPatientUpdate),
    canDeactivatePatients: can(permissionCodes.patientsPatientDeactivate),
    canManageIdentifiers: can(permissionCodes.patientsIdentifierManage),
    canManageIdentifierTypes: can(permissionCodes.patientsIdentifierTypeManage),
    canManageAddresses: can(permissionCodes.patientsAddressManage),
    canManageRelatedPersons: can(permissionCodes.patientsRelatedPersonManage),
    canManageRelatedPersonContacts: can(permissionCodes.patientsRelatedPersonContactManage),
    canManageRelationshipTypes: can(permissionCodes.patientsRelationshipTypeManage),
    canManageAccessGrants: can(permissionCodes.patientsAccessGrantManage),
  };
}
