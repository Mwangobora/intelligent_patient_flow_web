"use client";

import { useMemo } from "react";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";
import { hasPermission } from "@/types/permissions";

export function usePatientWorkspace() {
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
    canViewPatients: can("patients_patient.view"),
    canCreatePatients: can("patients_patient.create"),
    canUpdatePatients: can("patients_patient.update"),
    canDeactivatePatients: can("patients_patient.deactivate"),
    canManageIdentifiers: can("patients_identifier.manage"),
    canManageIdentifierTypes: can("patients_identifier_type.manage"),
    canManageAddresses: can("patients_address.manage"),
    canManageRelatedPersons: can("patients_related_person.manage"),
    canManageRelatedPersonContacts: can("patients_related_person_contact.manage"),
    canManageRelationshipTypes: can("patients_relationship_type.manage"),
    canManageAccessGrants: can("patients_access_grant.manage"),
  };
}
