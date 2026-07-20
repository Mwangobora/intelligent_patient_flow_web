import type { ISODateTime, UUID } from "@/types/common";
import type { OrganizationRecord, FacilityRecord } from "@/features/facilities/types/facility.types";

export type SettingsOutcome = "active" | "inactive" | "all";

export type UserRecord = {
  id: UUID;
  email: string | null;
  phone_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  is_active: boolean;
  email_verified_at?: ISODateTime | null;
  phone_verified_at?: ISODateTime | null;
  date_joined?: ISODateTime;
  memberships?: MembershipRecord[];
  role_assignments?: RoleAssignmentRecord[];
};

export type RoleRecord = {
  id: UUID;
  name: string;
  code: string;
  description: string | null;
  organization: UUID | null;
  organization_name: string | null;
  facility: UUID | null;
  facility_name: string | null;
  is_active: boolean;
  role_permissions?: RolePermissionRecord[];
};

export type PermissionRecord = {
  id: UUID;
  name: string;
  code: string;
  module: string;
  action: string;
  description: string | null;
  is_active: boolean;
};

export type RolePermissionRecord = {
  id: UUID;
  permission: UUID;
  permission_code: string;
  permission_name: string;
  is_active: boolean;
};

export type MembershipRecord = {
  id: UUID;
  user?: UUID;
  organization: UUID;
  organization_name?: string;
  facility: UUID | null;
  facility_name?: string | null;
  starts_at: ISODateTime;
  ends_at: ISODateTime | null;
  is_active: boolean;
};

export type RoleAssignmentRecord = {
  id: UUID;
  user?: UUID;
  role: UUID;
  role_name?: string;
  role_code?: string;
  starts_at: ISODateTime;
  ends_at: ISODateTime | null;
  is_active: boolean;
};

export type FlowSettingRecord = {
  id: UUID;
  facility: UUID;
  facility_name: string;
  max_advance_booking_days: number;
  minimum_booking_notice_minutes: number;
  cancellation_cutoff_minutes: number;
  reschedule_cutoff_minutes: number;
  early_checkin_minutes: number;
  late_checkin_grace_minutes: number;
  no_show_after_minutes: number;
  default_reminder_minutes_before: number;
  queue_number_padding: number;
  auto_create_daily_queues: boolean;
  created_by: UUID | null;
  created_by_email: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type SettingsListParams = {
  organization_id?: UUID;
  facility_id?: UUID;
  is_active?: boolean;
  search?: string;
  module?: string;
};

export type UserPayload = {
  email?: string | null;
  phone_number?: string | null;
  password?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
};

export type RolePayload = {
  name: string;
  code?: string | null;
  description?: string | null;
  organization_id?: UUID | null;
  facility_id?: UUID | null;
};

export type PermissionPayload = {
  name: string;
  module: string;
  action: string;
  code?: string | null;
  description?: string | null;
};

export type OrganizationPayload = Partial<OrganizationRecord>;
export type FacilityFlowPayload = Partial<FlowSettingRecord> & { facility_id?: UUID; created_by_id?: UUID | null };
export type { OrganizationRecord, FacilityRecord };
