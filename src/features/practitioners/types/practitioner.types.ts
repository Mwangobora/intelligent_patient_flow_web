import type { ISODateTime, UUID } from "@/types/common";

export type PractitionerTypeRecord = {
  id: UUID;
  name: string;
  code: string;
  description: string | null;
  requires_license: boolean;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type PractitionerRecord = {
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
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type PractitionerFacilityAssignmentRecord = {
  id: UUID;
  practitioner: UUID;
  practitioner_number: string;
  facility: UUID;
  facility_name: string;
  starts_on: string;
  ends_on: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PractitionerDepartmentAssignmentRecord = {
  id: UUID;
  practitioner_facility_assignment: UUID;
  practitioner_number: string;
  facility_name: string;
  department: UUID;
  department_name: string;
  starts_on: string;
  ends_on: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PractitionerSpecialtyAssignmentRecord = {
  id: UUID;
  practitioner_facility_assignment: UUID;
  practitioner_number: string;
  facility_name: string;
  facility_specialty: UUID;
  specialty_name: string;
  department_name: string | null;
  starts_on: string;
  ends_on: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type AvailabilityPeriodRecord = {
  id: UUID;
  practitioner_facility_assignment: UUID;
  practitioner_name: string;
  facility_name: string;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  valid_from: string;
  valid_until: string | null;
  is_available_for_appointments: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";
export type ShiftStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type LeaveRequestRecord = {
  id: UUID;
  practitioner_facility_assignment: UUID;
  facility_name: string;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  reason: string | null;
  status: LeaveStatus;
  requested_by: UUID | null;
  decided_by: UUID | null;
  decided_at: ISODateTime | null;
  decision_note: string | null;
  cancelled_by: UUID | null;
  cancelled_at: ISODateTime | null;
  cancellation_reason: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  affected_appointment_ids?: string[];
};

export type PractitionerShiftRecord = {
  id: UUID;
  practitioner_facility_assignment: UUID;
  practitioner_number: string;
  facility_name: string;
  practitioner_department_assignment: UUID | null;
  service_point: UUID | null;
  service_point_name: string | null;
  consultation_room: UUID | null;
  consultation_room_name: string | null;
  starts_at: ISODateTime;
  ends_at: ISODateTime;
  actual_started_at: ISODateTime | null;
  actual_ended_at: ISODateTime | null;
  accepts_appointments: boolean;
  status: ShiftStatus;
  notes: string | null;
  cancelled_by: UUID | null;
  cancelled_at: ISODateTime | null;
  cancellation_reason: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type FacilityLookupRecord = {
  id: UUID;
  organization: UUID;
  organization_name: string;
  name: string;
  code: string;
  timezone: string;
  is_primary: boolean;
  is_active: boolean;
};

export type DepartmentLookupRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  parent_department: UUID | null;
  parent_department_name: string | null;
  name: string;
  code: string;
  description: string | null;
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
};

export type ConsultationRoomLookupRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  department: UUID | null;
  department_name: string | null;
  name: string;
  code: string;
  location_description: string | null;
  floor: string | null;
  capacity: number;
  is_active: boolean;
};

export type PractitionerListParams = {
  organization_id?: UUID;
  facility_id?: UUID;
  practitioner_type_id?: UUID;
  user_id?: UUID;
  is_active?: boolean;
  search?: string;
};

export type AssignmentListParams = {
  practitioner_id?: UUID;
  practitioner_facility_assignment_id?: UUID;
  facility_id?: UUID;
  department_id?: UUID;
  specialty_id?: UUID;
  facility_specialty_id?: UUID;
  organization_id?: UUID;
  is_active?: boolean;
};

export type AvailabilityListParams = {
  practitioner_facility_assignment_id?: UUID;
  facility_id?: UUID;
  practitioner_id?: UUID;
  day_of_week?: number;
  is_active?: boolean;
};

export type LeaveListParams = {
  practitioner_facility_assignment_id?: UUID;
  practitioner_id?: UUID;
  facility_id?: UUID;
  status?: LeaveStatus;
  starts_from?: ISODateTime | string;
  ends_to?: ISODateTime | string;
};

export type ShiftListParams = {
  practitioner_facility_assignment_id?: UUID;
  practitioner_id?: UUID;
  facility_id?: UUID;
  practitioner_department_assignment_id?: UUID;
  service_point_id?: UUID;
  consultation_room_id?: UUID;
  status?: ShiftStatus;
  starts_from?: ISODateTime | string;
  ends_to?: ISODateTime | string;
};

export type PractitionerCreatePayload = {
  organization_id: UUID;
  practitioner_type_id: UUID;
  user_id?: UUID | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  preferred_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
};

export type PractitionerUpdatePayload = Partial<PractitionerCreatePayload>;
export type PractitionerTypeCreatePayload = {
  name: string;
  description?: string | null;
  requires_license?: boolean;
};
export type PractitionerTypeUpdatePayload = Partial<PractitionerTypeCreatePayload>;
export type FacilityAssignmentCreatePayload = {
  practitioner_id?: UUID;
  facility_id: UUID;
  starts_on: string;
  ends_on?: string | null;
  is_primary?: boolean;
};
export type FacilityAssignmentUpdatePayload = Partial<FacilityAssignmentCreatePayload>;
export type DepartmentAssignmentCreatePayload = {
  practitioner_facility_assignment_id?: UUID;
  department_id: UUID;
  starts_on: string;
  ends_on?: string | null;
  is_primary?: boolean;
};
export type DepartmentAssignmentUpdatePayload = Partial<DepartmentAssignmentCreatePayload>;
export type SpecialtyAssignmentCreatePayload = {
  practitioner_facility_assignment_id?: UUID;
  facility_specialty_id: UUID;
  starts_on: string;
  ends_on?: string | null;
  is_primary?: boolean;
};
export type SpecialtyAssignmentUpdatePayload = Partial<SpecialtyAssignmentCreatePayload>;
export type AvailabilityCreatePayload = {
  practitioner_facility_assignment_id: UUID;
  day_of_week: number;
  starts_at: string;
  ends_at: string;
  valid_from: string;
  valid_until?: string | null;
  is_available_for_appointments?: boolean;
};
export type AvailabilityUpdatePayload = Partial<AvailabilityCreatePayload>;
export type ShiftCreatePayload = {
  practitioner_facility_assignment_id: UUID;
  practitioner_department_assignment_id?: UUID | null;
  service_point_id?: UUID | null;
  consultation_room_id?: UUID | null;
  starts_at: ISODateTime | string;
  ends_at: ISODateTime | string;
  accepts_appointments?: boolean;
  notes?: string | null;
};
export type ShiftUpdatePayload = Partial<ShiftCreatePayload>;
export type ShiftCancellationPayload = { cancellation_reason: string };
export type LeaveRequestCreatePayload = {
  practitioner_facility_assignment_id: UUID;
  starts_at: ISODateTime | string;
  ends_at: ISODateTime | string;
  reason?: string | null;
};
export type LeaveDecisionPayload = { decision_note?: string | null };
export type LeaveCancellationPayload = { cancellation_reason: string };
export type GenerateSlotsPayload = {
  facility_specialty_id: UUID;
  capacity?: number;
  is_online_bookable?: boolean;
};
