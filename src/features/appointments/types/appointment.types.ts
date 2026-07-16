import type { ISODateTime, UUID } from "@/types/common";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "queued"
  | "in_service"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type BookingChannel = "mobile" | "web" | "reception" | "api";

export type AppointmentRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  patient: UUID;
  facility_specialty: UUID;
  specialty_name: string;
  practitioner_facility_assignment: UUID | null;
  practitioner_number: string | null;
  practitioner_specialty_assignment: UUID | null;
  practitioner_shift: UUID | null;
  appointment_slot: UUID | null;
  slot_status: string | null;
  appointment_number: string;
  scheduled_start: ISODateTime;
  scheduled_end: ISODateTime;
  status: AppointmentStatus;
  booking_channel: BookingChannel;
  rescheduled_from: UUID | null;
  cancelled_at: ISODateTime | null;
  cancelled_by: UUID | null;
  cancellation_reason: string | null;
  created_by: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type AppointmentStatusHistoryRecord = {
  id: UUID;
  appointment: UUID;
  from_status: AppointmentStatus | null;
  to_status: AppointmentStatus;
  change_source: string;
  changed_by: UUID | null;
  changed_by_email: string | null;
  reason: string | null;
  changed_at: ISODateTime;
};

export type AppointmentSlotRecord = {
  id: UUID;
  practitioner_shift: UUID;
  practitioner_number: string;
  facility_specialty: UUID;
  specialty_name: string;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  capacity: number;
  booked_count: number;
  status: "available" | "full" | "blocked" | "cancelled";
  is_online_bookable: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type AppointmentListParams = {
  facility_id?: UUID;
  patient_id?: UUID;
  practitioner_id?: UUID;
  practitioner_facility_assignment_id?: UUID;
  facility_specialty_id?: UUID;
  status?: AppointmentStatus | "";
  starts_from?: ISODateTime | string;
  ends_to?: ISODateTime | string;
};

export type AvailableSlotsParams = {
  facility_id?: UUID;
  practitioner_id?: UUID;
  facility_specialty_id?: UUID;
  starts_from?: ISODateTime | string;
  ends_to?: ISODateTime | string;
  status?: string;
  only_available?: boolean;
};

export type PatientLookupRecord = {
  id: UUID;
  organization: UUID;
  organization_name: string;
  user: UUID | null;
  user_email: string | null;
  registered_facility: UUID | null;
  registered_facility_name: string | null;
  patient_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string | null;
  date_of_birth_is_estimated: boolean;
  sex_code: string | null;
  email: string | null;
  phone_number: string | null;
  is_active: boolean;
};

export type FacilityLookupRecord = {
  id: UUID;
  organization: UUID;
  organization_name: string;
  facility_type: UUID;
  facility_type_name: string;
  name: string;
  code: string;
  timezone: string;
  is_primary: boolean;
  is_active: boolean;
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

export type PractitionerLookupRecord = {
  id: UUID;
  organization: UUID;
  organization_name: string;
  user: UUID | null;
  user_email: string | null;
  practitioner_type: UUID;
  practitioner_type_name: string;
  practitioner_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  preferred_name: string | null;
  email: string | null;
  phone_number: string | null;
  is_active: boolean;
};

export type CreateAppointmentPayload = {
  facility_id: UUID;
  patient_id: UUID;
  facility_specialty_id: UUID;
  scheduled_start: ISODateTime;
  scheduled_end: ISODateTime;
  booking_channel: BookingChannel;
  appointment_slot_id: UUID;
  reason_for_visit?: string | null;
};

export type UpdateAppointmentPayload = Partial<{
  facility_specialty_id: UUID;
  scheduled_start: ISODateTime;
  scheduled_end: ISODateTime;
  booking_channel: BookingChannel;
  reason_for_visit: string | null;
}>;

export type CancelAppointmentPayload = {
  cancellation_reason: string;
};

export type RescheduleAppointmentPayload = {
  scheduled_start: ISODateTime;
  scheduled_end: ISODateTime;
  booking_channel?: BookingChannel;
  appointment_slot_id: UUID;
  reason_for_visit?: string | null;
};

export type AssignPractitionerPayload = {
  practitioner_facility_assignment_id: UUID;
  practitioner_specialty_assignment_id: UUID;
  practitioner_shift_id?: UUID | null;
  appointment_slot_id?: UUID | null;
};
