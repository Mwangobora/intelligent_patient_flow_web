import type { ISODateTime, UUID } from "@/types/common";

export type ActiveState = "all" | "active" | "inactive";

export type FacilityListParams = {
  organization_id?: UUID;
  facility_type_id?: UUID;
  is_active?: boolean;
  search?: string;
};

export type SimpleListParams = {
  is_active?: boolean;
  search?: string;
};

export type FacilityScopedParams = {
  facility_id?: UUID;
  department_id?: UUID;
  is_active?: boolean;
  search?: string;
};

export type OrganizationRecord = {
  id: UUID;
  name: string;
  legal_name: string | null;
  code: string;
  email: string | null;
  phone_number: string | null;
  registration_number: string | null;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type FacilityTypeRecord = {
  id: UUID;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type FacilityRecord = {
  id: UUID;
  organization: UUID;
  organization_name: string;
  facility_type: UUID;
  facility_type_name: string;
  name: string;
  code: string;
  license_number?: string | null;
  email?: string | null;
  phone_number?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  ward?: string | null;
  postal_code?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  timezone: string;
  is_primary: boolean;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type DepartmentRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  parent_department: UUID | null;
  parent_department_name: string | null;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type SpecialtyRecord = {
  id: UUID;
  parent_specialty: UUID | null;
  parent_specialty_name: string | null;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type FacilitySpecialtyRecord = {
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
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type ServicePointTypeRecord = FacilityTypeRecord;

export type ServicePointRecord = {
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
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type ConsultationRoomRecord = {
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
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type OperatingHourRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  day_of_week: number;
  period_order: number;
  opens_at: string | null;
  closes_at: string | null;
  closes_next_day: boolean;
  is_24_hours: boolean;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type ScheduleExceptionRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  exception_date: string;
  period_order: number;
  is_closed: boolean;
  opens_at: string | null;
  closes_at: string | null;
  closes_next_day: boolean;
  is_24_hours: boolean;
  reason: string | null;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type FacilityPayload = Partial<FacilityRecord> & {
  organization_id?: UUID;
  facility_type_id?: UUID;
};
