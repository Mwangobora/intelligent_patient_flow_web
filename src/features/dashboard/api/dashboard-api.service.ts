import { apiClient } from "@/lib/api/api-client";
import { apiEndpoints } from "@/lib/api/endpoints";

import type {
  AppointmentDashboardSummary,
  CheckinDashboardSummary,
  DashboardOverviewSummary,
  DashboardQueryParams,
  IntelligenceDashboardSummary,
  PractitionerDashboardSummary,
  QueueDashboardSummary,
} from "../types/dashboard.types";

function buildDashboardParams(params: DashboardQueryParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
}

class DashboardApiService {
  async getOverviewSummary(params: DashboardQueryParams): Promise<DashboardOverviewSummary> {
    const response = await apiClient.get<DashboardOverviewSummary>(
      apiEndpoints.reporting.dashboard.overview,
      { params: buildDashboardParams(params) },
    );
    return response.data;
  }

  async getAppointmentSummary(
    params: DashboardQueryParams,
  ): Promise<AppointmentDashboardSummary> {
    const response = await apiClient.get<AppointmentDashboardSummary>(
      apiEndpoints.reporting.dashboard.appointments,
      { params: buildDashboardParams(params) },
    );
    return response.data;
  }

  async getQueueSummary(params: DashboardQueryParams): Promise<QueueDashboardSummary> {
    const response = await apiClient.get<QueueDashboardSummary>(
      apiEndpoints.reporting.dashboard.queues,
      { params: buildDashboardParams(params) },
    );
    return response.data;
  }

  async getCheckinSummary(params: DashboardQueryParams): Promise<CheckinDashboardSummary> {
    const response = await apiClient.get<CheckinDashboardSummary>(
      apiEndpoints.reporting.dashboard.checkins,
      { params: buildDashboardParams(params) },
    );
    return response.data;
  }

  async getPractitionerSummary(
    params: DashboardQueryParams,
  ): Promise<PractitionerDashboardSummary> {
    const response = await apiClient.get<PractitionerDashboardSummary>(
      apiEndpoints.reporting.dashboard.practitioners,
      { params: buildDashboardParams(params) },
    );
    return response.data;
  }

  async getIntelligenceSummary(
    params: DashboardQueryParams,
  ): Promise<IntelligenceDashboardSummary> {
    const response = await apiClient.get<IntelligenceDashboardSummary>(
      apiEndpoints.reporting.dashboard.intelligence,
      { params: buildDashboardParams(params) },
    );
    return response.data;
  }
}

export const dashboardApiService = new DashboardApiService();
