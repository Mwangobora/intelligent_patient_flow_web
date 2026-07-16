import { apiEndpoints } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/api-client";

import type {
  CheckinLookupRecord,
  FacilitySpecialtyLookupRecord,
  QueueCreatePayload,
  QueueEntryActionPayload,
  QueueEntryCancelPayload,
  QueueEntryCreatePayload,
  QueueEntryEventRecord,
  QueueEntryListParams,
  QueueEntryPriorityPayload,
  QueueEntryRecord,
  QueueListParams,
  QueueRecord,
  QueueStatusActionPayload,
  QueueTransferListParams,
  QueueTransferPayload,
  QueueTransferRecord,
  ServicePointLookupRecord,
} from "../types/queue.types";

function compactParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

class QueueApiService {
  async listQueues(params: QueueListParams): Promise<QueueRecord[]> {
    const response = await apiClient.get<QueueRecord[]>(`${apiEndpoints.queueing.base}/queues/`, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getQueueDetail(id: string): Promise<QueueRecord> {
    const response = await apiClient.get<QueueRecord>(`${apiEndpoints.queueing.base}/queues/${id}/`);
    return response.data;
  }

  async createQueue(payload: QueueCreatePayload): Promise<QueueRecord> {
    const response = await apiClient.post<QueueRecord>(`${apiEndpoints.queueing.base}/queues/`, payload);
    return response.data;
  }

  async openQueue(id: string, payload?: QueueStatusActionPayload): Promise<QueueRecord> {
    const response = await apiClient.post<QueueRecord>(`${apiEndpoints.queueing.base}/queues/${id}/open/`, payload ?? {});
    return response.data;
  }

  async pauseQueue(id: string, payload?: QueueStatusActionPayload): Promise<QueueRecord> {
    const response = await apiClient.post<QueueRecord>(`${apiEndpoints.queueing.base}/queues/${id}/pause/`, payload ?? {});
    return response.data;
  }

  async resumeQueue(id: string): Promise<QueueRecord> {
    const response = await apiClient.post<QueueRecord>(`${apiEndpoints.queueing.base}/queues/${id}/resume/`, {});
    return response.data;
  }

  async closeQueue(id: string, payload?: QueueStatusActionPayload): Promise<QueueRecord> {
    const response = await apiClient.post<QueueRecord>(`${apiEndpoints.queueing.base}/queues/${id}/close/`, payload ?? {});
    return response.data;
  }

  async cancelQueue(id: string): Promise<QueueRecord> {
    const response = await apiClient.post<QueueRecord>(`${apiEndpoints.queueing.base}/queues/${id}/cancel/`, {});
    return response.data;
  }

  async getNextQueueEntry(id: string): Promise<QueueEntryRecord> {
    const response = await apiClient.get<QueueEntryRecord>(`${apiEndpoints.queueing.base}/queues/${id}/next-entry/`);
    return response.data;
  }

  async listQueueEntries(params: QueueEntryListParams): Promise<QueueEntryRecord[]> {
    const response = await apiClient.get<QueueEntryRecord[]>(`${apiEndpoints.queueing.base}/entries/`, {
      params: compactParams(params),
    });
    return response.data;
  }

  async getQueueEntryDetail(id: string): Promise<QueueEntryRecord> {
    const response = await apiClient.get<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/`);
    return response.data;
  }

  async createQueueEntry(payload: QueueEntryCreatePayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/`, payload);
    return response.data;
  }

  async callQueueEntry(id: string, payload?: QueueEntryActionPayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/call/`, payload ?? {});
    return response.data;
  }

  async recallQueueEntry(id: string, payload?: QueueEntryActionPayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/recall/`, payload ?? {});
    return response.data;
  }

  async skipQueueEntry(id: string, payload?: QueueEntryActionPayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/skip/`, payload ?? {});
    return response.data;
  }

  async startService(id: string, payload?: QueueEntryActionPayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/start-service/`, payload ?? {});
    return response.data;
  }

  async completeService(id: string, payload?: QueueEntryActionPayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/complete-service/`, payload ?? {});
    return response.data;
  }

  async cancelQueueEntry(id: string, payload: QueueEntryCancelPayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/cancel/`, payload);
    return response.data;
  }

  async changePriority(id: string, payload: QueueEntryPriorityPayload): Promise<QueueEntryRecord> {
    const response = await apiClient.post<QueueEntryRecord>(`${apiEndpoints.queueing.base}/entries/${id}/change-priority/`, payload);
    return response.data;
  }

  async transferQueueEntry(id: string, payload: QueueTransferPayload): Promise<QueueTransferRecord> {
    const response = await apiClient.post<QueueTransferRecord>(`${apiEndpoints.queueing.base}/entries/${id}/transfer/`, payload);
    return response.data;
  }

  async getQueueEntryEvents(id: string): Promise<QueueEntryEventRecord[]> {
    const response = await apiClient.get<QueueEntryEventRecord[]>(`${apiEndpoints.queueing.base}/entries/${id}/events/`);
    return response.data;
  }

  async listQueueTransfers(params: QueueTransferListParams): Promise<QueueTransferRecord[]> {
    const response = await apiClient.get<QueueTransferRecord[]>(`${apiEndpoints.queueing.base}/transfers/`, {
      params: compactParams(params),
    });
    return response.data;
  }

  async listServicePoints(params: {
    facility_id?: string;
    department_id?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<ServicePointLookupRecord[]> {
    const response = await apiClient.get<ServicePointLookupRecord[]>("/facilities/service-points/", {
      params: compactParams(params),
    });
    return response.data;
  }

  async listFacilitySpecialties(params: {
    facility_id?: string;
    specialty_id?: string;
    is_active?: boolean;
  }): Promise<FacilitySpecialtyLookupRecord[]> {
    const response = await apiClient.get<FacilitySpecialtyLookupRecord[]>("/facilities/facility-specialties/", {
      params: compactParams(params),
    });
    return response.data;
  }

  async listCheckins(params: {
    facility_id?: string;
    patient_id?: string;
    appointment_id?: string;
    checked_in_from?: string;
    checked_in_to?: string;
    is_voided?: boolean;
  }): Promise<CheckinLookupRecord[]> {
    const response = await apiClient.get<CheckinLookupRecord[]>(`${apiEndpoints.checkins.base}/`, {
      params: compactParams(params),
    });
    return response.data;
  }
}

export const queueApiService = new QueueApiService();
