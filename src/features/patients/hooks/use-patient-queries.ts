"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { patientsApiService } from "../api/patients-api.service";
import type {
  PatientAccessGrantListParams,
  PatientAccessGrantRecord,
  PatientAddressListParams,
  PatientAddressRecord,
  PatientIdentifierListParams,
  PatientIdentifierRecord,
  PatientIdentifierTypeListParams,
  PatientIdentifierTypeRecord,
  PatientListParams,
  PatientRecord,
  PatientRelatedPersonListParams,
  PatientRelatedPersonRecord,
  RelatedPersonContactListParams,
  RelatedPersonContactRecord,
  RelationshipTypeListParams,
  RelationshipTypeRecord,
} from "../types/patient.types";

function buildScopeKey(params: Record<string, unknown>) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
}

type QueryOptions = {
  enabled?: boolean;
};

function usePatientQueryBase<TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: QueryOptions,
) {
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn,
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function usePatientsQuery(params: PatientListParams, options?: QueryOptions) {
  return usePatientQueryBase<PatientRecord[]>(
    [...queryKeys.patients.lists(), "records", buildScopeKey(params)],
    () => patientsApiService.listPatients(params),
    options,
  );
}

export function usePatientSearchQuery(
  params: { organization_id?: string; registered_facility_id?: string; search?: string; is_active?: boolean },
  options?: QueryOptions,
) {
  return usePatientQueryBase<PatientRecord[]>(
    [...queryKeys.patients.lists(), "search", buildScopeKey(params)],
    () =>
      patientsApiService.listPatients(
        params as { organization_id: string; registered_facility_id?: string; search?: string; is_active?: boolean },
      ),
    { enabled: Boolean(params.organization_id) && options?.enabled !== false },
  );
}

export function usePatientDetailQuery(id?: string, options?: QueryOptions) {
  return usePatientQueryBase<PatientRecord>(
    id ? queryKeys.patients.detail(id) : [...queryKeys.patients.all, "detail", "missing"],
    () => patientsApiService.getPatientDetail(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function usePatientIdentifierTypesQuery(
  params: PatientIdentifierTypeListParams,
  options?: QueryOptions,
) {
  return usePatientQueryBase<PatientIdentifierTypeRecord[]>(
    [...queryKeys.patients.lists(), "identifier-types", buildScopeKey(params)],
    () => patientsApiService.listPatientIdentifierTypes(params),
    options,
  );
}

export function usePatientIdentifiersQuery(params: PatientIdentifierListParams, options?: QueryOptions) {
  return usePatientQueryBase<PatientIdentifierRecord[]>(
    [...queryKeys.patients.lists(), "identifiers", buildScopeKey(params)],
    () => patientsApiService.listPatientIdentifiers(params),
    options,
  );
}

export function usePatientAddressesQuery(params: PatientAddressListParams, options?: QueryOptions) {
  return usePatientQueryBase<PatientAddressRecord[]>(
    [...queryKeys.patients.lists(), "addresses", buildScopeKey(params)],
    () => patientsApiService.listPatientAddresses(params),
    options,
  );
}

export function useRelationshipTypesQuery(params: RelationshipTypeListParams, options?: QueryOptions) {
  return usePatientQueryBase<RelationshipTypeRecord[]>(
    [...queryKeys.patients.lists(), "relationship-types", buildScopeKey(params)],
    () => patientsApiService.listRelationshipTypes(params),
    options,
  );
}

export function usePatientRelatedPersonsQuery(
  params: PatientRelatedPersonListParams,
  options?: QueryOptions,
) {
  return usePatientQueryBase<PatientRelatedPersonRecord[]>(
    [...queryKeys.patients.lists(), "related-persons", buildScopeKey(params)],
    () => patientsApiService.listPatientRelatedPersons(params),
    options,
  );
}

export function useRelatedPersonContactsQuery(
  params: RelatedPersonContactListParams,
  options?: QueryOptions,
) {
  return usePatientQueryBase<RelatedPersonContactRecord[]>(
    [...queryKeys.patients.lists(), "related-person-contacts", buildScopeKey(params)],
    () => patientsApiService.listRelatedPersonContacts(params),
    options,
  );
}

export function usePatientAccessGrantsQuery(
  params: PatientAccessGrantListParams,
  options?: QueryOptions,
) {
  return usePatientQueryBase<PatientAccessGrantRecord[]>(
    [...queryKeys.patients.lists(), "access-grants", buildScopeKey(params)],
    () => patientsApiService.listPatientAccessGrants(params),
    options,
  );
}
