import type { ISODateTime, UUID } from "@/types/common";

export type QueueStatus = "draft" | "open" | "paused" | "closed" | "cancelled";
export type QueueEntryStatus =
  | "waiting"
  | "called"
  | "in_service"
  | "completed"
  | "skipped"
  | "cancelled"
  | "transferred";
export type QueuePriorityLevel = 0 | 1 | 2 | 3;
export type QueueEventType =
  | "joined"
  | "called"
  | "recalled"
  | "skipped"
  | "service_started"
  | "service_completed"
  | "cancelled"
  | "transferred"
  | "priority_changed";

export type QueueRecord = {
  id: UUID;
  service_point: UUID;
  service_point_name: string;
  service_point_code: string;
  facility: UUID;
  facility_name: string;
  facility_specialty: UUID | null;
  specialty_name: string | null;
  queue_date: string;
  next_sequence_number: number;
  status: QueueStatus;
  opened_at: ISODateTime | null;
  opened_by: UUID | null;
  paused_at: ISODateTime | null;
  closed_at: ISODateTime | null;
  closed_by: UUID | null;
  created_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type QueueEntryRecord = {
  id: UUID;
  queue: UUID;
  queue_status: QueueStatus;
  service_point_code: string;
  service_point_name: string;
  facility: UUID;
  patient_checkin: UUID;
  patient_number: string;
  patient_name: string;
  appointment: UUID | null;
  practitioner_shift: UUID | null;
  sequence_number: number;
  display_queue_number: string;
  queue_position: number | null;
  priority_level: QueuePriorityLevel;
  priority_reason: string | null;
  status: QueueEntryStatus;
  joined_at: ISODateTime;
  called_at: ISODateTime | null;
  service_started_at: ISODateTime | null;
  service_completed_at: ISODateTime | null;
  cancelled_at: ISODateTime | null;
  cancelled_by: UUID | null;
  cancellation_reason: string | null;
  created_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type QueueTransferRecord = {
  id: UUID;
  source_queue_entry: UUID;
  source_queue: UUID;
  source_sequence_number: number;
  destination_queue_entry: UUID;
  destination_queue: UUID;
  destination_sequence_number: number;
  transferred_by: UUID | null;
  transfer_reason: string;
  transferred_at: ISODateTime;
  created_at: ISODateTime;
};

export type QueueEntryEventRecord = {
  id: UUID;
  queue_entry: UUID;
  event_type: QueueEventType;
  from_status: QueueEntryStatus | null;
  to_status: QueueEntryStatus | null;
  performed_by: UUID | null;
  performed_by_email: string | null;
  reason: string | null;
  occurred_at: ISODateTime;
  created_at: ISODateTime;
};

export type ServicePointLookupRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  department: UUID | null;
  department_name: string | null;
  service_point_type: UUID;
  service_point_type_name: string;
  name: string;
  code: string;
  location_description: string | null;
  floor: string | null;
  display_order: number;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type FacilitySpecialtyLookupRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  specialty: UUID;
  specialty_name: string;
  department: UUID | null;
  department_name: string | null;
  appointment_duration_minutes: number;
  accepts_appointments: boolean;
  accepts_walk_ins: boolean;
  requires_referral: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type CheckinLookupRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  patient: UUID;
  patient_number: string;
  patient_name: string;
  appointment: UUID | null;
  appointment_number: string | null;
  facility_specialty: UUID | null;
  specialty_name: string | null;
  checkin_method: "reception" | "mobile" | "qr_code" | "self_service";
  checked_in_at: ISODateTime;
  voided_at: ISODateTime | null;
  void_reason: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type QueueListParams = {
  facility_id?: UUID;
  organization_id?: UUID;
  service_point_id?: UUID;
  facility_specialty_id?: UUID;
  queue_date?: string;
  status?: QueueStatus | "";
};

export type QueueEntryListParams = {
  queue_id?: UUID;
  facility_id?: UUID;
  patient_id?: UUID;
  patient_checkin_id?: UUID;
  status?: QueueEntryStatus | "";
  active_only?: boolean;
};

export type QueueTransferListParams = {
  facility_id?: UUID;
  source_queue_entry_id?: UUID;
  destination_queue_entry_id?: UUID;
  transferred_from?: ISODateTime | string;
  transferred_to?: ISODateTime | string;
};

export type QueueCreatePayload = {
  service_point_id: UUID;
  facility_specialty_id?: UUID | null;
  queue_date?: string | null;
};

export type QueueStatusActionPayload = {
  at?: ISODateTime | null;
};

export type QueueEntryCreatePayload = {
  queue_id: UUID;
  patient_checkin_id: UUID;
  practitioner_shift_id?: UUID | null;
  priority_level?: QueuePriorityLevel;
  priority_reason?: string | null;
  joined_at?: ISODateTime | null;
};

export type QueueEntryActionPayload = {
  at?: ISODateTime | null;
  reason?: string | null;
};

export type QueueEntryCancelPayload = {
  cancellation_reason: string;
  cancelled_at?: ISODateTime | null;
};

export type QueueEntryPriorityPayload = {
  priority_level: QueuePriorityLevel;
  priority_reason: string;
};

export type QueueTransferPayload = {
  destination_queue_id: UUID;
  transfer_reason: string;
  transferred_at?: ISODateTime | null;
};
