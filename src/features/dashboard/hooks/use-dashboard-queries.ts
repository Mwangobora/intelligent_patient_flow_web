import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { dashboardApiService } from "../api/dashboard-api.service";
import type {
  AppointmentDashboardSummary,
  CheckinDashboardSummary,
  DashboardOverviewSummary,
  DashboardQueryParams,
  IntelligenceDashboardSummary,
  PractitionerDashboardSummary,
  QueueDashboardSummary,
} from "../types/dashboard.types";

type DashboardQueryOptions = {
  enabled?: boolean;
};

function buildScopeKey(params: DashboardQueryParams) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== "")
        .sort(([left], [right]) => left.localeCompare(right)),
    ),
  );
}

function useDashboardQuery<TData>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: DashboardQueryOptions,
) {
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn,
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
}

export function useDashboardOverviewQuery(
  params: DashboardQueryParams,
  options?: DashboardQueryOptions,
) {
  return useDashboardQuery<DashboardOverviewSummary>(
    queryKeys.dashboard.overview(buildScopeKey(params)),
    () => dashboardApiService.getOverviewSummary(params),
    options,
  );
}

export function useAppointmentDashboardQuery(
  params: DashboardQueryParams,
  options?: DashboardQueryOptions,
) {
  return useDashboardQuery<AppointmentDashboardSummary>(
    queryKeys.dashboard.appointments(buildScopeKey(params)),
    () => dashboardApiService.getAppointmentSummary(params),
    options,
  );
}

export function useQueueDashboardQuery(
  params: DashboardQueryParams,
  options?: DashboardQueryOptions,
) {
  return useDashboardQuery<QueueDashboardSummary>(
    queryKeys.dashboard.queues(buildScopeKey(params)),
    () => dashboardApiService.getQueueSummary(params),
    options,
  );
}

export function useCheckinDashboardQuery(
  params: DashboardQueryParams,
  options?: DashboardQueryOptions,
) {
  return useDashboardQuery<CheckinDashboardSummary>(
    queryKeys.dashboard.checkins(buildScopeKey(params)),
    () => dashboardApiService.getCheckinSummary(params),
    options,
  );
}

export function usePractitionerDashboardQuery(
  params: DashboardQueryParams,
  options?: DashboardQueryOptions,
) {
  return useDashboardQuery<PractitionerDashboardSummary>(
    queryKeys.dashboard.practitioners(buildScopeKey(params)),
    () => dashboardApiService.getPractitionerSummary(params),
    options,
  );
}

export function useIntelligenceDashboardQuery(
  params: DashboardQueryParams,
  options?: DashboardQueryOptions,
) {
  return useDashboardQuery<IntelligenceDashboardSummary>(
    queryKeys.dashboard.intelligence(buildScopeKey(params)),
    () => dashboardApiService.getIntelligenceSummary(params),
    options,
  );
}
