"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { checkinsApiService } from "../api/checkins-api.service";
import type { CheckinListParams, CheckinRecord, CheckinTokenListParams, CheckinTokenRecord } from "../types/checkin.types";

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

function useCheckinQueryBase<TData>(
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

export function useCheckinsQuery(params: CheckinListParams, options?: QueryOptions) {
  return useCheckinQueryBase<CheckinRecord[]>(
    [...queryKeys.checkins.lists(), "records", buildScopeKey(params)],
    () => checkinsApiService.listCheckins(params),
    options,
  );
}

export function useCheckinDetailQuery(id?: string, options?: QueryOptions) {
  return useCheckinQueryBase<CheckinRecord>(
    id ? queryKeys.checkins.detail(id) : [...queryKeys.checkins.all, "detail", "missing"],
    () => checkinsApiService.getCheckinDetail(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function useCheckinTokensQuery(params: CheckinTokenListParams, options?: QueryOptions) {
  return useCheckinQueryBase<CheckinTokenRecord[]>(
    [...queryKeys.checkins.lists(), "tokens", buildScopeKey(params)],
    () => checkinsApiService.listCheckinTokens(params),
    options,
  );
}

export function useCheckinTokenDetailQuery(id?: string, options?: QueryOptions) {
  return useCheckinQueryBase<CheckinTokenRecord>(
    id ? [...queryKeys.checkins.all, "token", id] : [...queryKeys.checkins.all, "token", "missing"],
    () => checkinsApiService.getCheckinToken(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}
