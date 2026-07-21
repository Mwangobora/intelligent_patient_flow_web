import { z } from "zod";

const requiredUuid = z.string().uuid("Please select a valid option.");
const optionalText = z.string().max(250).optional().or(z.literal(""));

export const practitionerTypeSchema = z.object({
  name: z.string().min(2, "Type name is required."),
  description: optionalText,
  requires_license: z.boolean().optional(),
});

export const practitionerSchema = z.object({
  organization_id: requiredUuid,
  practitioner_type_id: requiredUuid,
  user_id: z.string().uuid().optional().or(z.literal("")),
  first_name: z.string().min(2, "First name is required."),
  middle_name: z.string().max(100).optional().or(z.literal("")),
  last_name: z.string().min(2, "Last name is required."),
  preferred_name: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  phone_number: z.string().max(32).optional().or(z.literal("")),
});

export const facilityAssignmentSchema = z.object({
  facility_id: requiredUuid,
  starts_on: z.string().min(1, "Start date is required."),
  ends_on: z.string().optional().or(z.literal("")),
  is_primary: z.boolean().optional(),
});

export const departmentAssignmentSchema = z.object({
  department_id: requiredUuid,
  starts_on: z.string().min(1, "Start date is required."),
  ends_on: z.string().optional().or(z.literal("")),
  is_primary: z.boolean().optional(),
});

export const specialtyAssignmentSchema = z.object({
  facility_specialty_id: requiredUuid,
  starts_on: z.string().min(1, "Start date is required."),
  ends_on: z.string().optional().or(z.literal("")),
  is_primary: z.boolean().optional(),
});

export const availabilitySchema = z.object({
  practitioner_facility_assignment_id: requiredUuid,
  day_of_week: z.string().min(1, "Select a day of week."),
  starts_at: z.string().min(1, "Start time is required."),
  ends_at: z.string().min(1, "End time is required."),
  valid_from: z.string().min(1, "Valid from date is required."),
  valid_until: z.string().optional().or(z.literal("")),
  is_available_for_appointments: z.boolean().optional(),
});

export const shiftSchema = z.object({
  practitioner_facility_assignment_id: requiredUuid,
  practitioner_department_assignment_id: z.string().uuid().optional().or(z.literal("")),
  service_point_id: z.string().uuid().optional().or(z.literal("")),
  consultation_room_id: z.string().uuid().optional().or(z.literal("")),
  starts_at: z.string().min(1, "Shift start is required."),
  ends_at: z.string().min(1, "Shift end is required."),
  accepts_appointments: z.boolean().optional(),
  notes: optionalText,
});

export const leaveRequestSchema = z.object({
  practitioner_facility_assignment_id: requiredUuid,
  starts_at: z.string().min(1, "Leave start is required."),
  ends_at: z.string().min(1, "Leave end is required."),
  reason: optionalText,
});

export const leaveDecisionSchema = z.object({
  decision_note: optionalText,
});

export const cancellationReasonSchema = z.object({
  cancellation_reason: z.string().min(3, "Please provide a reason."),
});

export type PractitionerTypeFormValues = z.infer<typeof practitionerTypeSchema>;
export type PractitionerFormValues = z.infer<typeof practitionerSchema>;
export type FacilityAssignmentFormValues = z.infer<typeof facilityAssignmentSchema>;
export type DepartmentAssignmentFormValues = z.infer<typeof departmentAssignmentSchema>;
export type SpecialtyAssignmentFormValues = z.infer<typeof specialtyAssignmentSchema>;
export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;
export type ShiftFormValues = z.infer<typeof shiftSchema>;
export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;
export type LeaveDecisionFormValues = z.infer<typeof leaveDecisionSchema>;
export type CancellationReasonFormValues = z.infer<typeof cancellationReasonSchema>;
