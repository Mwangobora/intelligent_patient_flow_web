import { apiClient } from "@/lib/api/api-client";
import { apiEndpoints } from "@/lib/api/endpoints";

import type {
  CreateNotificationPayload,
  NotificationFactoryPayload,
  NotificationListParams,
  PatientNotificationRecord,
  PushDeviceListParams,
  PushDeviceRecord,
  RegisterPushDevicePayload,
} from "../types/notification.types";

function compactParams<T extends Record<string, unknown>>(params?: T) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

const notificationsBase = `${apiEndpoints.notifications.base}/`;
const pushDevicesBase = `${apiEndpoints.notifications.base}/push-devices/`;
const detail = (base: string, id: string, action?: string) => `${base}${id}/${action ? `${action}/` : ""}`;

class NotificationsApiService {
  async listNotifications(params: NotificationListParams = {}) {
    const response = await apiClient.get<PatientNotificationRecord[]>(notificationsBase, { params: compactParams(params) });
    return response.data;
  }

  async getNotification(id: string) {
    const response = await apiClient.get<PatientNotificationRecord>(detail(notificationsBase, id));
    return response.data;
  }

  async createNotification(payload: CreateNotificationPayload) {
    const response = await apiClient.post<PatientNotificationRecord>(notificationsBase, payload);
    return response.data;
  }

  async cancelNotification(id: string, reason?: string) {
    const response = await apiClient.post<PatientNotificationRecord>(detail(notificationsBase, id, "cancel"), { reason });
    return response.data;
  }

  async sendNotification(id: string) {
    const response = await apiClient.post<PatientNotificationRecord>(detail(notificationsBase, id, "send"), {});
    return response.data;
  }

  async markNotificationRead(id: string, read_at?: string | null) {
    const response = await apiClient.post<PatientNotificationRecord>(detail(notificationsBase, id, "mark-read"), { read_at });
    return response.data;
  }

  async createAppointmentConfirmation(payload: NotificationFactoryPayload) {
    return this.createFactoryNotification("appointment-confirmation", payload);
  }

  async createAppointmentReminder(payload: NotificationFactoryPayload) {
    return this.createFactoryNotification("appointment-reminder", payload);
  }

  async createAppointmentRescheduled(payload: NotificationFactoryPayload) {
    return this.createFactoryNotification("appointment-rescheduled", payload);
  }

  async createAppointmentCancelled(payload: NotificationFactoryPayload) {
    return this.createFactoryNotification("appointment-cancelled", payload);
  }

  async createQueueJoined(payload: NotificationFactoryPayload) {
    return this.createFactoryNotification("queue-joined", payload);
  }

  async createQueueUpdated(payload: NotificationFactoryPayload) {
    return this.createFactoryNotification("queue-updated", payload);
  }

  async createQueueCalled(payload: NotificationFactoryPayload) {
    return this.createFactoryNotification("queue-called", payload);
  }

  private async createFactoryNotification(factoryPath: string, payload: NotificationFactoryPayload) {
    const response = await apiClient.post<PatientNotificationRecord>(`${apiEndpoints.notifications.base}/${factoryPath}/`, payload);
    return response.data;
  }

  async listPushDevices(params: PushDeviceListParams = {}) {
    const response = await apiClient.get<PushDeviceRecord[]>(pushDevicesBase, { params: compactParams(params) });
    return response.data;
  }

  async registerPushDevice(payload: RegisterPushDevicePayload) {
    const response = await apiClient.post<PushDeviceRecord>(pushDevicesBase, payload);
    return response.data;
  }

  async updatePushDeviceLastSeen(id: string) {
    const response = await apiClient.post<PushDeviceRecord>(detail(pushDevicesBase, id, "last-seen"), {});
    return response.data;
  }

  async revokePushDevice(id: string) {
    const response = await apiClient.post<PushDeviceRecord>(detail(pushDevicesBase, id, "revoke"), {});
    return response.data;
  }

  async deactivatePushDevice(id: string) {
    const response = await apiClient.post<PushDeviceRecord>(detail(pushDevicesBase, id, "deactivate"), {});
    return response.data;
  }
}

export const notificationsApiService = new NotificationsApiService();
