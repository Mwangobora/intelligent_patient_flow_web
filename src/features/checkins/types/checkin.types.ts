import type { AppointmentRecord, FacilityLookupRecord, FacilitySpecialtyLookupRecord, PatientLookupRecord } from "@/features/appointments/types/appointment.types";
import type { ISODateTime, UUID } from "@/types/common";

export type CheckinMethod = "reception" | "mobile" | "qr_code" | "self_service";
export type CheckinMode = "appointment" | "walk_in";

export type CheckinRecord = {
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
  checkin_method: CheckinMethod;
  checked_in_at: ISODateTime;
  checked_in_by: UUID | null;
  checked_in_by_email: string | null;
  notes: string | null;
  voided_at: ISODateTime | null;
  voided_by: UUID | null;
  voided_by_email: string | null;
  void_reason: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type CheckinTokenRecord = {
  id: UUID;
  appointment: UUID;
  appointment_number: string;
  patient_number: string;
  facility_name: string;
  expires_at: ISODateTime;
  used_at: ISODateTime | null;
  patient_checkin: UUID | null;
  revoked_at: ISODateTime | null;
  revoked_by: UUID | null;
  revocation_reason: string | null;
  created_by: UUID | null;
  created_at: ISODateTime;
  is_active: boolean;
};

export type IssuedCheckinTokenRecord = CheckinTokenRecord & {
  raw_token: string;
};

export type CheckinListParams = {
  facility_id?: UUID;
  patient_id?: UUID;
  appointment_id?: UUID;
  checked_in_from?: ISODateTime | string;
  checked_in_to?: ISODateTime | string;
  is_voided?: boolean;
};

export type CheckinTokenListParams = {
  appointment_id?: UUID;
  only_active?: boolean;
};

export type AppointmentCheckinPayload = {
  facility_id: UUID;
  patient_id: UUID;
  appointment_id: UUID;
  facility_specialty_id?: UUID | null;
  checkin_method: CheckinMethod;
  checked_in_at?: ISODateTime | null;
  checked_in_by_id?: UUID | null;
  notes?: string | null;
};

export type WalkinCheckinPayload = {
  facility_id: UUID;
  patient_id: UUID;
  facility_specialty_id: UUID;
  checkin_method: CheckinMethod;
  checked_in_at?: ISODateTime | null;
  checked_in_by_id?: UUID | null;
  notes?: string | null;
};

export type VoidCheckinPayload = {
  void_reason: string;
  voided_at?: ISODateTime | null;
};

export type IssueCheckinTokenPayload = {
  appointment_id: UUID;
  expires_at?: ISODateTime | null;
};

export type ConsumeCheckinTokenPayload = {
  raw_token: string;
  checked_in_at?: ISODateTime | null;
  notes?: string | null;
};

export type RevokeCheckinTokenPayload = {
  revocation_reason: string;
  revoked_at?: ISODateTime | null;
};

export type CheckinLookupBundle = {
  facilities: FacilityLookupRecord[];
  patients: PatientLookupRecord[];
  specialties: FacilitySpecialtyLookupRecord[];
  appointments: AppointmentRecord[];
};
