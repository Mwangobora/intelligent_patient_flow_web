"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/api-error";
import { queryKeys } from "@/lib/query/query-keys";

import { reportingApiService } from "../api/reporting-api.service";
import type {
  AnalyticsResponse,
  AppointmentUtilizationRow,
  DailyAttendanceRow,
  DoctorWorkloadRow,
  PatientWaitingTimeRow,
  PredictionAccuracyRow,
  ReportExportListParams,
  ReportExportRecord,
  ReportingQueryParams,
} from "../types/reporting.types";
import type {
  AppointmentDashboardSummary,
  DashboardOverviewSummary,
  IntelligenceDashboardSummary,
} from "@/features/dashboard/types/dashboard.types";

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

function useReportingQueryBase<TData>(
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

export function useReportExportsQuery(params: ReportExportListParams, options?: QueryOptions) {
  return useReportingQueryBase<ReportExportRecord[]>(
    [...queryKeys.reporting.lists(), "exports", buildScopeKey(params)],
    () => reportingApiService.listReportExports(params),
    options,
  );
}

export function useReportExportDetailQuery(id?: string, options?: QueryOptions) {
  return useReportingQueryBase<ReportExportRecord>(
    id ? queryKeys.reporting.detail(id) : [...queryKeys.reporting.all, "detail", "missing"],
    () => reportingApiService.getReportExportDetail(id!),
    { enabled: Boolean(id) && options?.enabled !== false },
  );
}

export function usePatientWaitingTimeAnalyticsQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<AnalyticsResponse<PatientWaitingTimeRow>>(
    [...queryKeys.reporting.all, "analytics", "patient-waiting-time", buildScopeKey(params)],
    () => reportingApiService.getPatientWaitingTimeAnalytics(params),
    options,
  );
}

export function useAppointmentUtilizationAnalyticsQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<AnalyticsResponse<AppointmentUtilizationRow>>(
    [...queryKeys.reporting.all, "analytics", "appointment-utilization", buildScopeKey(params)],
    () => reportingApiService.getAppointmentUtilizationAnalytics(params),
    options,
  );
}

export function useDoctorWorkloadAnalyticsQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<AnalyticsResponse<DoctorWorkloadRow>>(
    [...queryKeys.reporting.all, "analytics", "doctor-workload", buildScopeKey(params)],
    () => reportingApiService.getDoctorWorkloadAnalytics(params),
    options,
  );
}

export function useDailyAttendanceAnalyticsQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<AnalyticsResponse<DailyAttendanceRow>>(
    [...queryKeys.reporting.all, "analytics", "daily-attendance", buildScopeKey(params)],
    () => reportingApiService.getDailyAttendanceAnalytics(params),
    options,
  );
}

export function usePredictionAccuracyAnalyticsQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<AnalyticsResponse<PredictionAccuracyRow>>(
    [...queryKeys.reporting.all, "analytics", "prediction-accuracy", buildScopeKey(params)],
    () => reportingApiService.getPredictionAccuracyAnalytics(params),
    options,
  );
}

export function useReportingOverviewSummaryQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<DashboardOverviewSummary>(
    [...queryKeys.reporting.all, "dashboard", "overview", buildScopeKey(params)],
    () => reportingApiService.getReportingOverviewSummary(params),
    options,
  );
}

export function useReportingAppointmentSummaryQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<AppointmentDashboardSummary>(
    [...queryKeys.reporting.all, "dashboard", "appointments", buildScopeKey(params)],
    () => reportingApiService.getReportingAppointmentSummary(params),
    options,
  );
}

export function useReportingIntelligenceSummaryQuery(params: ReportingQueryParams, options?: QueryOptions) {
  return useReportingQueryBase<IntelligenceDashboardSummary>(
    [...queryKeys.reporting.all, "dashboard", "intelligence", buildScopeKey(params)],
    () => reportingApiService.getReportingIntelligenceSummary(params),
    options,
  );
}
