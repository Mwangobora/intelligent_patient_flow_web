"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { queueApiService } from "../api/queue-api.service";
import type {
  CheckinLookupRecord,
  FacilitySpecialtyLookupRecord,
  QueueEntryEventRecord,
  QueueEntryListParams,
  QueueEntryRecord,
  QueueListParams,
  QueueRecord,
  QueueTransferListParams,
  QueueTransferRecord,
  ServicePointLookupRecord,
} from "../types/queue.types";

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

function useQueueQueryBase<TData>(
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

export function useQueuesQuery(params: QueueListParams, options?: QueryOptions) {
  return useQueueQueryBase<QueueRecord[]>(
    [...queryKeys.queueing.lists(), "queues", buildScopeKey(params)],
    () => queueApiService.listQueues(params),
    options,
  );
}

export function useQueueDetailQuery(id?: string, options?: QueryOptions) {
  return useQueueQueryBase<QueueRecord>(
    id ? [...queryKeys.queueing.all, "queue", id] : [...queryKeys.queueing.all, "queue", "missing"],
    () => queueApiService.getQueueDetail(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useQueueEntriesQuery(params: QueueEntryListParams, options?: QueryOptions) {
  return useQueueQueryBase<QueueEntryRecord[]>(
    [...queryKeys.queueing.lists(), "entries", buildScopeKey(params)],
    () => queueApiService.listQueueEntries(params),
    options,
  );
}

export function useQueueEntryDetailQuery(id?: string, options?: QueryOptions) {
  return useQueueQueryBase<QueueEntryRecord>(
    id ? [...queryKeys.queueing.all, "entry", id] : [...queryKeys.queueing.all, "entry", "missing"],
    () => queueApiService.getQueueEntryDetail(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useNextQueueEntryQuery(id?: string, options?: QueryOptions) {
  return useQueueQueryBase<QueueEntryRecord>(
    id ? [...queryKeys.queueing.all, "next-entry", id] : [...queryKeys.queueing.all, "next-entry", "missing"],
    () => queueApiService.getNextQueueEntry(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useQueueEntryEventsQuery(id?: string, options?: QueryOptions) {
  return useQueueQueryBase<QueueEntryEventRecord[]>(
    id ? [...queryKeys.queueing.all, "events", id] : [...queryKeys.queueing.all, "events", "missing"],
    () => queueApiService.getQueueEntryEvents(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useQueueTransfersQuery(params: QueueTransferListParams, options?: QueryOptions) {
  return useQueueQueryBase<QueueTransferRecord[]>(
    [...queryKeys.queueing.lists(), "transfers", buildScopeKey(params)],
    () => queueApiService.listQueueTransfers(params),
    options,
  );
}

export function useServicePointsLookupQuery(
  params: { facility_id?: string; department_id?: string; is_active?: boolean; search?: string },
  options?: QueryOptions,
) {
  return useQueueQueryBase<ServicePointLookupRecord[]>(
    [...queryKeys.facilities.lists(), "service-points", buildScopeKey(params)],
    () => queueApiService.listServicePoints(params),
    { enabled: Boolean(params.facility_id) && options?.enabled !== false },
  );
}

export function useFacilitySpecialtiesLookupQuery(
  params: { facility_id?: string; specialty_id?: string; is_active?: boolean },
  options?: QueryOptions,
) {
  return useQueueQueryBase<FacilitySpecialtyLookupRecord[]>(
    [...queryKeys.facilities.lists(), "facility-specialties", buildScopeKey(params)],
    () => queueApiService.listFacilitySpecialties(params),
    { enabled: Boolean(params.facility_id) && options?.enabled !== false },
  );
}

export function useCheckinsLookupQuery(
  params: {
    facility_id?: string;
    patient_id?: string;
    appointment_id?: string;
    checked_in_from?: string;
    checked_in_to?: string;
    is_voided?: boolean;
  },
  options?: QueryOptions,
) {
  return useQueueQueryBase<CheckinLookupRecord[]>(
    [...queryKeys.checkins.lists(), "lookup", buildScopeKey(params)],
    () => queueApiService.listCheckins(params),
    { enabled: Boolean(params.facility_id) && options?.enabled !== false },
  );
}
