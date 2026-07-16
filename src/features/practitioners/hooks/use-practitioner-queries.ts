"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { practitionersApiService } from "../api/practitioners-api.service";
import type {
  AssignmentListParams,
  AvailabilityListParams,
  LeaveListParams,
  PractitionerListParams,
  ShiftListParams,
} from "../types/practitioner.types";

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
  refetchInterval?: number | false;
};

function usePractitionerQueryBase<TData>(queryKey: readonly unknown[], queryFn: () => Promise<TData>, options?: QueryOptions) {
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn,
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
    placeholderData: keepPreviousData,
  });
}

export const usePractitionersQuery = (params: PractitionerListParams, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "practitioners", buildScopeKey(params)], () => practitionersApiService.listPractitioners(params), options);

export const usePractitionerDetailQuery = (id?: string, options?: QueryOptions) =>
  usePractitionerQueryBase(id ? [...queryKeys.practitioners.all, "practitioner", id] : [...queryKeys.practitioners.all, "practitioner", "missing"], () => practitionersApiService.getPractitionerDetail(id!), { enabled: Boolean(id) && options?.enabled !== false });

export const usePractitionerTypesQuery = (params: { is_active?: boolean; search?: string }, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "types", buildScopeKey(params)], () => practitionersApiService.listPractitionerTypes(params), options);

export const usePractitionerFacilityAssignmentsQuery = (params: AssignmentListParams, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "facility-assignments", buildScopeKey(params)], () => practitionersApiService.listFacilityAssignments(params), options);

export const usePractitionerDepartmentAssignmentsQuery = (params: AssignmentListParams, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "department-assignments", buildScopeKey(params)], () => practitionersApiService.listDepartmentAssignments(params), options);

export const usePractitionerSpecialtyAssignmentsQuery = (params: AssignmentListParams, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "specialty-assignments", buildScopeKey(params)], () => practitionersApiService.listSpecialtyAssignments(params), options);

export const usePractitionerAvailabilityQuery = (params: AvailabilityListParams, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "availability", buildScopeKey(params)], () => practitionersApiService.listAvailability(params), options);

export const usePractitionerShiftsQuery = (params: ShiftListParams, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "shifts", buildScopeKey(params)], () => practitionersApiService.listShifts(params), options);

export const usePractitionerLeaveRequestsQuery = (params: LeaveListParams, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.practitioners.lists(), "leave", buildScopeKey(params)], () => practitionersApiService.listLeaveRequests(params), options);

export const useFacilitiesLookupQuery = (params: { organization_id?: string; search?: string; is_active?: boolean }, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.facilities.lists(), "facilities", buildScopeKey(params)], () => practitionersApiService.listFacilities(params), { enabled: Boolean(params.organization_id) && options?.enabled !== false });

export const useDepartmentsLookupQuery = (params: { facility_id?: string; is_active?: boolean; search?: string }, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.facilities.lists(), "departments", buildScopeKey(params)], () => practitionersApiService.listDepartments(params), { enabled: Boolean(params.facility_id) && options?.enabled !== false });

export const useFacilitySpecialtiesLookupQuery = (params: { facility_id?: string; specialty_id?: string; department_id?: string; is_active?: boolean }, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.facilities.lists(), "facility-specialties", buildScopeKey(params)], () => practitionersApiService.listFacilitySpecialties(params), { enabled: Boolean(params.facility_id) && options?.enabled !== false });

export const useServicePointsLookupQuery = (params: { facility_id?: string; department_id?: string; is_active?: boolean; search?: string }, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.facilities.lists(), "service-points", buildScopeKey(params)], () => practitionersApiService.listServicePoints(params), { enabled: Boolean(params.facility_id) && options?.enabled !== false });

export const useConsultationRoomsLookupQuery = (params: { facility_id?: string; department_id?: string; is_active?: boolean; search?: string }, options?: QueryOptions) =>
  usePractitionerQueryBase([...queryKeys.facilities.lists(), "consultation-rooms", buildScopeKey(params)], () => practitionersApiService.listConsultationRooms(params), { enabled: Boolean(params.facility_id) && options?.enabled !== false });
