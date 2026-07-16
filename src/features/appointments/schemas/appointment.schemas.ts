import { z } from "zod";

const requiredUuid = z.string().uuid("Please select a valid option.");

export const appointmentCreateSchema = z.object({
  patient_id: requiredUuid,
  facility_id: requiredUuid,
  facility_specialty_id: requiredUuid,
  practitioner_id: z.string().optional(),
  appointment_date: z.string().min(1, "Please choose an appointment date."),
  appointment_slot_id: requiredUuid,
  booking_channel: z.enum(["mobile", "web", "reception", "api"]),
  reason_for_visit: z.string().max(250, "Reason must be 250 characters or fewer.").optional().or(z.literal("")),
});

export const appointmentCancelSchema = z.object({
  cancellation_reason: z.string().min(3, "Please provide a cancellation reason."),
});

export const appointmentRescheduleSchema = z.object({
  appointment_date: z.string().min(1, "Please choose a new appointment date."),
  practitioner_id: z.string().optional(),
  appointment_slot_id: requiredUuid,
  booking_channel: z.enum(["mobile", "web", "reception", "api"]).optional(),
  reason_for_visit: z.string().max(250, "Reason must be 250 characters or fewer.").optional().or(z.literal("")),
});

export type AppointmentCreateFormValues = z.infer<typeof appointmentCreateSchema>;
export type AppointmentCancelFormValues = z.infer<typeof appointmentCancelSchema>;
export type AppointmentRescheduleFormValues = z.infer<typeof appointmentRescheduleSchema>;
