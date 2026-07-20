"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { facilitiesApiService } from "../api/facilities-api.service";
import type { FacilityListParams, FacilityScopedParams, SimpleListParams } from "../types/facility.types";

type QueryOptions = { enabled?: boolean };

function scopeKey(params: Record<string, unknown>) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
}

function useFacilitiesBase<TData>(key: readonly unknown[], queryFn: () => Promise<TData>, options?: QueryOptions) {
  return useQuery<TData, ApiError>({
    queryKey: key,
    queryFn,
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function useOrganizationsQuery(params: SimpleListParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "organizations", scopeKey(params)],
    () => facilitiesApiService.listOrganizations(params),
    options,
  );
}

export function useFacilityTypesQuery(params: SimpleListParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "facility-types", scopeKey(params)],
    () => facilitiesApiService.listFacilityTypes(params),
    options,
  );
}

export function useFacilitiesQuery(params: FacilityListParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "facilities", scopeKey(params)],
    () => facilitiesApiService.listFacilities(params),
    options,
  );
}

export function useFacilityQuery(id?: string, options?: QueryOptions) {
  return useFacilitiesBase(
    id ? queryKeys.facilities.detail(id) : [...queryKeys.facilities.all, "detail", "missing"],
    () => facilitiesApiService.getFacility(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useDepartmentsQuery(params: FacilityScopedParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "departments", scopeKey(params)],
    () => facilitiesApiService.listDepartments(params),
    options,
  );
}

export function useSpecialtiesQuery(params: SimpleListParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "specialties", scopeKey(params)],
    () => facilitiesApiService.listSpecialties(params),
    options,
  );
}

export function useFacilitySpecialtiesQuery(
  params: FacilityScopedParams & { specialty_id?: string } = {},
  options?: QueryOptions,
) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "facility-specialties", scopeKey(params)],
    () => facilitiesApiService.listFacilitySpecialties(params),
    options,
  );
}

export function useServicePointTypesQuery(params: SimpleListParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "service-point-types", scopeKey(params)],
    () => facilitiesApiService.listServicePointTypes(params),
    options,
  );
}

export function useServicePointsQuery(params: FacilityScopedParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "service-points", scopeKey(params)],
    () => facilitiesApiService.listServicePoints(params),
    options,
  );
}

export function useConsultationRoomsQuery(params: FacilityScopedParams = {}, options?: QueryOptions) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "consultation-rooms", scopeKey(params)],
    () => facilitiesApiService.listConsultationRooms(params),
    options,
  );
}

export function useOperatingHoursQuery(
  params: { facility_id?: string; day_of_week?: number; is_active?: boolean } = {},
  options?: QueryOptions,
) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "operating-hours", scopeKey(params)],
    () => facilitiesApiService.listOperatingHours(params),
    options,
  );
}

export function useScheduleExceptionsQuery(
  params: { facility_id?: string; exception_date?: string; is_active?: boolean } = {},
  options?: QueryOptions,
) {
  return useFacilitiesBase(
    [...queryKeys.facilities.lists(), "schedule-exceptions", scopeKey(params)],
    () => facilitiesApiService.listScheduleExceptions(params),
    options,
  );
}
