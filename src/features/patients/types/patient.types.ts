import type { ISODateTime, UUID } from "@/types/common";

export type PatientSexCode = "male" | "female" | "intersex" | "unknown";
export type RelatedPersonContactChannel = "phone" | "email";

export type PatientRecord = {
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
  sex_code: PatientSexCode | null;
  email: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type PatientIdentifierTypeRecord = {
  id: UUID;
  organization: UUID | null;
  organization_name: string | null;
  name: string;
  code: string;
  description: string | null;
  is_sensitive: boolean;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type PatientIdentifierRecord = {
  id: UUID;
  patient: UUID;
  patient_number: string;
  identifier_type: UUID;
  identifier_type_name: string;
  last_four: string | null;
  issuing_country_code: string | null;
  issuing_authority: string | null;
  issued_on: string | null;
  expires_on: string | null;
  verified_at: ISODateTime | null;
  verified_by: UUID | null;
  verified_by_email: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PatientAddressRecord = {
  id: UUID;
  patient: UUID;
  patient_number: string;
  label: string | null;
  has_address_line1: boolean;
  has_address_line2: boolean;
  country_code: string | null;
  region: string | null;
  district: string | null;
  ward: string | null;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type RelationshipTypeRecord = {
  id: UUID;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
};

export type PatientRelatedPersonRecord = {
  id: UUID;
  patient: UUID;
  patient_number: string;
  relationship_type: UUID;
  relationship_type_name: string;
  linked_user: UUID | null;
  linked_user_email: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  is_guardian: boolean;
  is_caregiver: boolean;
  is_next_of_kin: boolean;
  is_emergency_contact: boolean;
  priority_order: number;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type RelatedPersonContactRecord = {
  id: UUID;
  related_person: UUID;
  related_person_name: string;
  channel: RelatedPersonContactChannel;
  label: string | null;
  value_present: boolean;
  verified_at: ISODateTime | null;
  verified_by: UUID | null;
  verified_by_email: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PatientAccessGrantRecord = {
  id: UUID;
  patient: UUID;
  patient_number: string;
  related_person: UUID;
  related_person_name: string;
  grantee_user: UUID;
  grantee_user_email: string;
  role: UUID;
  role_name: string;
  granted_by: UUID | null;
  granted_by_email: string | null;
  starts_at: ISODateTime;
  ends_at: ISODateTime | null;
  is_active: boolean;
  revoked_at: ISODateTime | null;
  revoked_by: UUID | null;
  revoked_by_email: string | null;
  revocation_reason: string | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type PatientListParams = {
  organization_id?: UUID;
  registered_facility_id?: UUID;
  user_id?: UUID;
  is_active?: boolean;
  search?: string;
};

export type PatientIdentifierTypeListParams = {
  organization_id?: UUID;
  include_global?: boolean;
  is_active?: boolean;
  search?: string;
};

export type PatientIdentifierListParams = {
  patient_id?: UUID;
  identifier_type_id?: UUID;
  organization_id?: UUID;
  is_active?: boolean;
};

export type PatientAddressListParams = {
  patient_id?: UUID;
  organization_id?: UUID;
  is_active?: boolean;
};

export type PatientRelatedPersonListParams = {
  patient_id?: UUID;
  linked_user_id?: UUID;
  organization_id?: UUID;
  is_active?: boolean;
  search?: string;
};

export type RelatedPersonContactListParams = {
  related_person_id?: UUID;
  patient_id?: UUID;
  channel?: RelatedPersonContactChannel;
  is_active?: boolean;
};

export type RelationshipTypeListParams = {
  is_active?: boolean;
  search?: string;
};

export type PatientAccessGrantListParams = {
  patient_id?: UUID;
  grantee_user_id?: UUID;
  role_id?: UUID;
  organization_id?: UUID;
  is_active?: boolean;
};

export type CreatePatientPayload = {
  organization_id: UUID;
  user_id?: UUID | null;
  registered_facility_id?: UUID | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth?: string | null;
  date_of_birth_is_estimated?: boolean;
  sex_code?: PatientSexCode | null;
  email?: string | null;
  phone_number?: string | null;
};

export type UpdatePatientPayload = Partial<Omit<CreatePatientPayload, "organization_id">>;

export type CreatePatientIdentifierPayload = {
  patient_id?: UUID;
  identifier_type_id: UUID;
  value: string;
  issuing_country_code?: string | null;
  issuing_authority?: string | null;
  issued_on?: string | null;
  expires_on?: string | null;
  is_primary?: boolean;
};

export type CreatePatientAddressPayload = {
  patient_id?: UUID;
  label?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  country_code?: string | null;
  region?: string | null;
  district?: string | null;
  ward?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_primary?: boolean;
};

export type UpdatePatientAddressPayload = Partial<Omit<CreatePatientAddressPayload, "patient_id" | "is_primary">>;

export type CreatePatientRelatedPersonPayload = {
  patient_id?: UUID;
  relationship_type_id: UUID;
  linked_user_id?: UUID | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  is_guardian?: boolean;
  is_caregiver?: boolean;
  is_next_of_kin?: boolean;
  is_emergency_contact?: boolean;
  priority_order?: number;
};

export type UpdatePatientRelatedPersonPayload = Partial<CreatePatientRelatedPersonPayload>;

export type CreateRelatedPersonContactPayload = {
  related_person_id?: UUID;
  channel: RelatedPersonContactChannel;
  value: string;
  label?: string | null;
  is_primary?: boolean;
};

export type PatientCreateFormValues = CreatePatientPayload & {
  identifier_type_id?: UUID | "";
  identifier_value?: string;
  identifier_issuing_authority?: string;
  identifier_is_primary?: boolean;
  address_label?: string;
  address_line1?: string;
  address_line2?: string;
  address_country_code?: string;
  address_region?: string;
  address_district?: string;
  address_ward?: string;
  address_postal_code?: string;
  related_person_relationship_type_id?: UUID | "";
  related_person_first_name?: string;
  related_person_middle_name?: string;
  related_person_last_name?: string;
  related_person_is_emergency_contact?: boolean;
  related_person_phone?: string;
  related_person_email?: string;
};
