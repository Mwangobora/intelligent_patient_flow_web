import { apiEndpoints } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/api-client";

import type {
  AppointmentCheckinPayload,
  CheckinListParams,
  CheckinRecord,
  CheckinTokenListParams,
  CheckinTokenRecord,
  ConsumeCheckinTokenPayload,
  IssueCheckinTokenPayload,
  IssuedCheckinTokenRecord,
  RevokeCheckinTokenPayload,
  VoidCheckinPayload,
  WalkinCheckinPayload,
} from "../types/checkin.types";

function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

class CheckinsApiService {
  async listCheckins(params: CheckinListParams): Promise<CheckinRecord[]> {
    const response = await apiClient.get<CheckinRecord[]>(`${apiEndpoints.checkins.base}/`, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getCheckinDetail(id: string): Promise<CheckinRecord> {
    const response = await apiClient.get<CheckinRecord>(`${apiEndpoints.checkins.base}/${id}/`);
    return response.data;
  }

  async createAppointmentCheckin(payload: AppointmentCheckinPayload): Promise<CheckinRecord> {
    const response = await apiClient.post<CheckinRecord>(`${apiEndpoints.checkins.base}/appointment/`, payload);
    return response.data;
  }

  async createWalkinCheckin(payload: WalkinCheckinPayload): Promise<CheckinRecord> {
    const response = await apiClient.post<CheckinRecord>(`${apiEndpoints.checkins.base}/walk-in/`, payload);
    return response.data;
  }

  async voidCheckin(id: string, payload: VoidCheckinPayload): Promise<CheckinRecord> {
    const response = await apiClient.post<CheckinRecord>(`${apiEndpoints.checkins.base}/${id}/void/`, payload);
    return response.data;
  }

  async listCheckinTokens(params: CheckinTokenListParams): Promise<CheckinTokenRecord[]> {
    const response = await apiClient.get<CheckinTokenRecord[]>(`${apiEndpoints.checkins.base}/tokens/`, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getCheckinToken(id: string): Promise<CheckinTokenRecord> {
    const response = await apiClient.get<CheckinTokenRecord>(`${apiEndpoints.checkins.base}/tokens/${id}/`);
    return response.data;
  }

  async issueCheckinToken(payload: IssueCheckinTokenPayload): Promise<IssuedCheckinTokenRecord> {
    const response = await apiClient.post<IssuedCheckinTokenRecord>(`${apiEndpoints.checkins.base}/tokens/issue/`, payload);
    return response.data;
  }

  async consumeCheckinToken(payload: ConsumeCheckinTokenPayload): Promise<CheckinRecord> {
    const response = await apiClient.post<CheckinRecord>(`${apiEndpoints.checkins.base}/tokens/consume/`, payload);
    return response.data;
  }

  async revokeCheckinToken(id: string, payload: RevokeCheckinTokenPayload): Promise<CheckinTokenRecord> {
    const response = await apiClient.post<CheckinTokenRecord>(`${apiEndpoints.checkins.base}/tokens/${id}/revoke/`, payload);
    return response.data;
  }
}

export const checkinsApiService = new CheckinsApiService();
