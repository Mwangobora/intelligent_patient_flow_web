import type { ISODateTime, UUID } from "@/types/common";

export type NotificationStatus = "pending" | "processing" | "sent" | "delivered" | "failed" | "cancelled";
export type NotificationChannel = "sms" | "email" | "push" | "in_app";
export type NotificationType =
  | "appointment_confirmation"
  | "appointment_reminder"
  | "appointment_rescheduled"
  | "appointment_cancelled"
  | "queue_joined"
  | "queue_updated"
  | "queue_called"
  | "general";

export type PatientNotificationRecord = {
  id: UUID;
  patient: UUID;
  patient_number: string;
  appointment: UUID | null;
  queue_entry: UUID | null;
  notification_type: NotificationType;
  channel: NotificationChannel;
  recipient_user: UUID | null;
  scheduled_for: ISODateTime;
  status: NotificationStatus;
  attempt_count: number;
  last_attempt_at: ISODateTime | null;
  sent_at: ISODateTime | null;
  delivered_at: ISODateTime | null;
  read_at: ISODateTime | null;
  failed_at: ISODateTime | null;
  failure_reason: string | null;
  provider_message_id: string | null;
  idempotency_key: string | null;
  created_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PushDeviceRecord = {
  id: UUID;
  user: UUID;
  platform: "android" | "ios" | "web";
  device_name: string | null;
  app_version: string | null;
  last_seen_at: ISODateTime | null;
  is_active: boolean;
  revoked_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type NotificationListParams = {
  patient_id?: UUID;
  appointment_id?: UUID;
  queue_entry_id?: UUID;
  status?: NotificationStatus | "";
  channel?: NotificationChannel | "";
  notification_type?: NotificationType | "";
  scheduled_pending?: boolean;
};

export type PushDeviceListParams = {
  user_id?: UUID;
  is_active?: boolean;
  revoked?: boolean;
};

export type CreateNotificationPayload = {
  patient_id: UUID;
  appointment_id?: UUID | null;
  queue_entry_id?: UUID | null;
  notification_type: NotificationType;
  channel: NotificationChannel;
  recipient_user_id?: UUID | null;
  destination?: string | null;
  subject?: string | null;
  body: string;
  scheduled_for?: ISODateTime | null;
  idempotency_key?: string | null;
};

export type NotificationFactoryPayload = {
  appointment_id?: UUID;
  queue_entry_id?: UUID;
  channel?: NotificationChannel;
  scheduled_for?: ISODateTime | null;
  idempotency_key?: string | null;
};

export type RegisterPushDevicePayload = {
  user_id: UUID;
  platform: PushDeviceRecord["platform"];
  raw_token: string;
  device_name?: string | null;
  app_version?: string | null;
};
