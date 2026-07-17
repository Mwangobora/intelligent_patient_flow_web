import { z } from "zod";

const optionalTrimmedString = z.string().trim().optional().transform((value) => value || undefined);

export const patientCreateSchema = z.object({
  registered_facility_id: z.string().uuid().optional().or(z.literal("")),
  first_name: z.string().trim().min(1, "First name is required."),
  middle_name: optionalTrimmedString,
  last_name: z.string().trim().min(1, "Last name is required."),
  date_of_birth: z.string().optional(),
  date_of_birth_is_estimated: z.boolean().default(false),
  sex_code: z.enum(["male", "female", "intersex", "unknown"]).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  phone_number: optionalTrimmedString,
  identifier_type_id: z.string().uuid().optional().or(z.literal("")),
  identifier_value: optionalTrimmedString,
  identifier_issuing_authority: optionalTrimmedString,
  identifier_is_primary: z.boolean().default(false),
  address_label: optionalTrimmedString,
  address_line1: optionalTrimmedString,
  address_line2: optionalTrimmedString,
  address_country_code: optionalTrimmedString,
  address_region: optionalTrimmedString,
  address_district: optionalTrimmedString,
  address_ward: optionalTrimmedString,
  address_postal_code: optionalTrimmedString,
  related_person_relationship_type_id: z.string().uuid().optional().or(z.literal("")),
  related_person_first_name: optionalTrimmedString,
  related_person_middle_name: optionalTrimmedString,
  related_person_last_name: optionalTrimmedString,
  related_person_is_emergency_contact: z.boolean().default(false),
  related_person_phone: optionalTrimmedString,
  related_person_email: z.string().trim().email("Enter a valid related person email.").optional().or(z.literal("")),
}).superRefine((values, context) => {
  if (values.identifier_value && !values.identifier_type_id) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["identifier_type_id"],
      message: "Please select a valid identifier type.",
    });
  }
  if (values.related_person_first_name || values.related_person_last_name || values.related_person_phone || values.related_person_email) {
    if (!values.related_person_relationship_type_id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["related_person_relationship_type_id"],
        message: "Please select a relationship type.",
      });
    }
    if (!values.related_person_first_name) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["related_person_first_name"],
        message: "Related person first name is required.",
      });
    }
    if (!values.related_person_last_name) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["related_person_last_name"],
        message: "Related person last name is required.",
      });
    }
  }
});

export const patientUpdateSchema = z.object({
  registered_facility_id: z.string().uuid().optional().or(z.literal("")),
  first_name: z.string().trim().min(1, "First name is required."),
  middle_name: optionalTrimmedString,
  last_name: z.string().trim().min(1, "Last name is required."),
  date_of_birth: z.string().optional(),
  date_of_birth_is_estimated: z.boolean().default(false),
  sex_code: z.enum(["male", "female", "intersex", "unknown"]).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  phone_number: optionalTrimmedString,
});

export const patientIdentifierSchema = z.object({
  identifier_type_id: z.string().uuid("Please select a valid identifier type."),
  value: z.string().trim().min(1, "Identifier value is required."),
  issuing_country_code: optionalTrimmedString,
  issuing_authority: optionalTrimmedString,
  issued_on: z.string().optional(),
  expires_on: z.string().optional(),
  is_primary: z.boolean().default(false),
});

export const patientAddressSchema = z.object({
  label: optionalTrimmedString,
  address_line1: optionalTrimmedString,
  address_line2: optionalTrimmedString,
  country_code: optionalTrimmedString,
  region: optionalTrimmedString,
  district: optionalTrimmedString,
  ward: optionalTrimmedString,
  postal_code: optionalTrimmedString,
  is_primary: z.boolean().default(false),
});

export const patientRelatedPersonSchema = z.object({
  relationship_type_id: z.string().uuid("Please select a relationship type."),
  first_name: z.string().trim().min(1, "First name is required."),
  middle_name: optionalTrimmedString,
  last_name: z.string().trim().min(1, "Last name is required."),
  is_guardian: z.boolean().default(false),
  is_caregiver: z.boolean().default(false),
  is_next_of_kin: z.boolean().default(false),
  is_emergency_contact: z.boolean().default(false),
  priority_order: z.coerce.number().int().min(1, "Priority must be at least 1."),
});

export const relatedPersonContactSchema = z.object({
  channel: z.enum(["phone", "email"]),
  value: z.string().trim().min(1, "Contact value is required."),
  label: optionalTrimmedString,
  is_primary: z.boolean().default(false),
});
