import type { ISODateTime, UUID } from "@/types/common";

export type AuthPermission = string;

export type AuthMembership = {
  id: UUID;
  organization: UUID;
  organization_name: string;
  facility: UUID | null;
  facility_name: string | null;
  starts_at: ISODateTime;
  ends_at: ISODateTime | null;
  is_active: boolean;
};

export type AuthUser = {
  id: UUID;
  email: string | null;
  phone_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name?: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  has_global_access?: boolean;
  email_verified_at?: ISODateTime | null;
  phone_verified_at?: ISODateTime | null;
  date_joined?: ISODateTime;
  permissions?: AuthPermission[];
  memberships?: AuthMembership[];
};

export type LoginRequest = {
  email_or_phone: string;
  password: string;
};

export type LoginResponse = {
  user: AuthUser;
};

export type CurrentUserResponse = AuthUser;

export type LogoutResponse = void;
