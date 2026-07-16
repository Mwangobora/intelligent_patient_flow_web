"use client";

import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { appointmentsApiService } from "../api/appointments-api.service";
import type {
  AppointmentListParams,
  AppointmentRecord,
  AppointmentSlotRecord,
  AppointmentStatusHistoryRecord,
  AvailableSlotsParams,
  FacilityLookupRecord,
  FacilitySpecialtyLookupRecord,
  PatientLookupRecord,
  PractitionerLookupRecord,
} from "../types/appointment.types";

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

function useAppointmentsQueryBase<TData>(
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

export function useAppointmentsQuery(params: AppointmentListParams, options?: QueryOptions) {
  return useAppointmentsQueryBase<AppointmentRecord[]>(
    [...queryKeys.appointments.lists(), buildScopeKey(params)],
    () => appointmentsApiService.listAppointments(params),
    options,
  );
}

export function useAppointmentDetailQuery(id?: string, options?: QueryOptions) {
  return useAppointmentsQueryBase<AppointmentRecord>(
    id ? queryKeys.appointments.detail(id) : [...queryKeys.appointments.all, "detail", "missing"],
    () => appointmentsApiService.getAppointmentDetail(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useAppointmentStatusHistoryQuery(id?: string, options?: QueryOptions) {
  return useAppointmentsQueryBase<AppointmentStatusHistoryRecord[]>(
    [...queryKeys.appointments.all, "status-history", id ?? "missing"],
    () => appointmentsApiService.getAppointmentStatusHistory(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useAvailableAppointmentSlotsQuery(
  params: AvailableSlotsParams,
  options?: QueryOptions,
) {
  return useAppointmentsQueryBase<AppointmentSlotRecord[]>(
    [...queryKeys.appointments.all, "slots", buildScopeKey(params)],
    () => appointmentsApiService.listAvailableSlots(params),
    options,
  );
}

export function usePatientsLookupQuery(
  params: { organization_id?: string; registered_facility_id?: string; search?: string; is_active?: boolean },
  options?: QueryOptions,
) {
  return useAppointmentsQueryBase<PatientLookupRecord[]>(
    [...queryKeys.patients.lists(), "lookup", buildScopeKey(params)],
    () => appointmentsApiService.listPatients(params as { organization_id: string; registered_facility_id?: string; search?: string; is_active?: boolean }),
    { enabled: Boolean(params.organization_id) && options?.enabled !== false },
  );
}

export function usePatientDetailQuery(id?: string, options?: QueryOptions) {
  return useAppointmentsQueryBase<PatientLookupRecord>(
    id ? queryKeys.patients.detail(id) : [...queryKeys.patients.all, "detail", "missing"],
    () => appointmentsApiService.getPatientDetail(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useAppointmentPatientsSummaryQuery(patientIds: string[]) {
  const uniquePatientIds = Array.from(new Set(patientIds));

  return useQueries({
    queries: uniquePatientIds.map((id) => ({
      queryKey: queryKeys.patients.detail(id),
      queryFn: () => appointmentsApiService.getPatientDetail(id),
      staleTime: 60_000,
    })),
  });
}

export function useFacilitiesLookupQuery(
  params: { organization_id?: string; search?: string; is_active?: boolean },
  options?: QueryOptions,
) {
  return useAppointmentsQueryBase<FacilityLookupRecord[]>(
    [...queryKeys.facilities.lists(), "lookup", buildScopeKey(params)],
    () => appointmentsApiService.listFacilities(params as { organization_id: string; search?: string; is_active?: boolean }),
    { enabled: Boolean(params.organization_id) && options?.enabled !== false },
  );
}

export function useFacilitySpecialtiesQuery(
  params: { facility_id?: string; specialty_id?: string; is_active?: boolean },
  options?: QueryOptions,
) {
  return useAppointmentsQueryBase<FacilitySpecialtyLookupRecord[]>(
    [...queryKeys.facilities.all, "facility-specialties", buildScopeKey(params)],
    () => appointmentsApiService.listFacilitySpecialties(params as { facility_id: string; specialty_id?: string; is_active?: boolean }),
    { enabled: Boolean(params.facility_id) && options?.enabled !== false },
  );
}

export function usePractitionersLookupQuery(
  params: { organization_id?: string; facility_id?: string; search?: string; is_active?: boolean },
  options?: QueryOptions,
) {
  return useAppointmentsQueryBase<PractitionerLookupRecord[]>(
    [...queryKeys.practitioners.lists(), "lookup", buildScopeKey(params)],
    () => appointmentsApiService.listPractitioners(params as { organization_id: string; facility_id?: string; search?: string; is_active?: boolean }),
    { enabled: Boolean(params.organization_id) && options?.enabled !== false },
  );
}
