import { apiClient } from "@/lib/api/api-client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  AppointmentDashboardSummary,
  DashboardOverviewSummary,
  IntelligenceDashboardSummary,
} from "@/features/dashboard/types/dashboard.types";

import type {
  AnalyticsResponse,
  AppointmentUtilizationRow,
  CreateReportExportPayload,
  DailyAttendanceRow,
  DoctorWorkloadRow,
  PatientWaitingTimeRow,
  PredictionAccuracyRow,
  ReportDownloadResult,
  ReportExportListParams,
  ReportExportRecord,
  ReportingQueryParams,
} from "../types/reporting.types";

function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function buildDownloadFilename(
  contentDisposition: string | undefined,
  fallback: string,
) {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? fallback;
}

class ReportingApiService {
  async listReportExports(params: ReportExportListParams): Promise<ReportExportRecord[]> {
    const response = await apiClient.get<ReportExportRecord[]>(apiEndpoints.reporting.exports, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getReportExportDetail(id: string): Promise<ReportExportRecord> {
    const response = await apiClient.get<ReportExportRecord>(`${apiEndpoints.reporting.exports}${id}/`);
    return response.data;
  }

  async createReportExport(payload: CreateReportExportPayload): Promise<ReportExportRecord> {
    const response = await apiClient.post<ReportExportRecord>(apiEndpoints.reporting.exports, payload);
    return response.data;
  }

  async generateReportExport(id: string): Promise<ReportExportRecord> {
    const response = await apiClient.post<ReportExportRecord>(`${apiEndpoints.reporting.exports}${id}/generate/`, {});
    return response.data;
  }

  async cancelReportExport(id: string): Promise<ReportExportRecord> {
    const response = await apiClient.post<ReportExportRecord>(`${apiEndpoints.reporting.exports}${id}/cancel/`, {});
    return response.data;
  }

  async downloadReportExport(id: string): Promise<ReportDownloadResult> {
    const response = await apiClient.get<Blob>(`${apiEndpoints.reporting.exports}${id}/download/`, {
      responseType: "blob",
    });
    const contentDispositionHeader = response.headers["content-disposition"];
    const contentTypeHeader = response.headers["content-type"];
    return {
      blob: response.data,
      filename: buildDownloadFilename(
        typeof contentDispositionHeader === "string" ? contentDispositionHeader : undefined,
        `report-${id}`,
      ),
      contentType: typeof contentTypeHeader === "string" ? contentTypeHeader : "application/octet-stream",
    };
  }

  async getPatientWaitingTimeAnalytics(params: ReportingQueryParams): Promise<AnalyticsResponse<PatientWaitingTimeRow>> {
    const response = await apiClient.get<AnalyticsResponse<PatientWaitingTimeRow>>(
      apiEndpoints.reporting.analytics.patientWaitingTime,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async getAppointmentUtilizationAnalytics(params: ReportingQueryParams): Promise<AnalyticsResponse<AppointmentUtilizationRow>> {
    const response = await apiClient.get<AnalyticsResponse<AppointmentUtilizationRow>>(
      apiEndpoints.reporting.analytics.appointmentUtilization,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async getDoctorWorkloadAnalytics(params: ReportingQueryParams): Promise<AnalyticsResponse<DoctorWorkloadRow>> {
    const response = await apiClient.get<AnalyticsResponse<DoctorWorkloadRow>>(
      apiEndpoints.reporting.analytics.doctorWorkload,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async getDailyAttendanceAnalytics(params: ReportingQueryParams): Promise<AnalyticsResponse<DailyAttendanceRow>> {
    const response = await apiClient.get<AnalyticsResponse<DailyAttendanceRow>>(
      apiEndpoints.reporting.analytics.dailyAttendance,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async getPredictionAccuracyAnalytics(params: ReportingQueryParams): Promise<AnalyticsResponse<PredictionAccuracyRow>> {
    const response = await apiClient.get<AnalyticsResponse<PredictionAccuracyRow>>(
      apiEndpoints.reporting.analytics.predictionAccuracy,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async getReportingOverviewSummary(params: ReportingQueryParams): Promise<DashboardOverviewSummary> {
    const response = await apiClient.get<DashboardOverviewSummary>(
      apiEndpoints.reporting.dashboard.overview,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async getReportingAppointmentSummary(params: ReportingQueryParams): Promise<AppointmentDashboardSummary> {
    const response = await apiClient.get<AppointmentDashboardSummary>(
      apiEndpoints.reporting.dashboard.appointments,
      { params: compactParams(params) },
    );
    return response.data;
  }

  async getReportingIntelligenceSummary(params: ReportingQueryParams): Promise<IntelligenceDashboardSummary> {
    const response = await apiClient.get<IntelligenceDashboardSummary>(
      apiEndpoints.reporting.dashboard.intelligence,
      { params: compactParams(params) },
    );
    return response.data;
  }
}

export const reportingApiService = new ReportingApiService();
