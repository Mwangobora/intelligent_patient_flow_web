import { apiClient } from "@/lib/api/api-client";
import { apiEndpoints } from "@/lib/api/endpoints";

import type { AuditLogCreatePayload, AuditLogListParams, AuditLogRecord, AuditSummary } from "../types/audit.types";

function compactParams<T extends Record<string, unknown>>(params?: T) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

class AuditApiService {
  async listAuditLogs(params: AuditLogListParams = {}) {
    const response = await apiClient.get<AuditLogRecord[]>(apiEndpoints.audit.logs, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getAuditLog(id: string) {
    const response = await apiClient.get<AuditLogRecord>(`${apiEndpoints.audit.logs}${id}/`);
    return response.data;
  }

  async createAuditLog(payload: AuditLogCreatePayload) {
    const response = await apiClient.post<AuditLogRecord>(apiEndpoints.audit.logs, payload);
    return response.data;
  }

  async getAuditSummary(params: AuditLogListParams = {}) {
    const response = await apiClient.get<AuditSummary>(apiEndpoints.audit.summary, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listResourceAuditLogs(resourceType: string, resourceId: string) {
    const response = await apiClient.get<AuditLogRecord[]>(
      `${apiEndpoints.audit.resources}${encodeURIComponent(resourceType)}/${resourceId}/`,
    );
    return response.data;
  }

  async listActorAuditLogs(userId: string) {
    const response = await apiClient.get<AuditLogRecord[]>(`${apiEndpoints.audit.actors}${userId}/`);
    return response.data;
  }
}

export const auditApiService = new AuditApiService();
