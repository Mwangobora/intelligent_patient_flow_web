import { z } from "zod";

const requiredUuid = z.string().uuid();
const optionalText = z.string().trim().max(250).optional().or(z.literal(""));

export const appointmentCheckinSchema = z.object({
  facility_id: requiredUuid,
  patient_id: requiredUuid,
  appointment_id: requiredUuid,
  checkin_method: z.enum(["reception", "mobile", "qr_code", "self_service"]),
  notes: optionalText,
});

export const walkinCheckinSchema = z.object({
  facility_id: requiredUuid,
  patient_id: requiredUuid,
  facility_specialty_id: requiredUuid,
  checkin_method: z.enum(["reception", "mobile", "qr_code", "self_service"]),
  notes: optionalText,
});

export const voidCheckinSchema = z.object({
  void_reason: z.string().trim().min(3, "Please provide a reason for voiding this check-in.").max(250),
});

export const issueTokenSchema = z.object({
  facility_id: requiredUuid,
  patient_id: requiredUuid,
  appointment_id: requiredUuid,
  expires_at: z.string().optional().or(z.literal("")),
});

export const consumeTokenSchema = z.object({
  raw_token: z.string().trim().min(8, "Enter a valid QR token."),
  notes: optionalText,
});

export const revokeTokenSchema = z.object({
  revocation_reason: z.string().trim().min(3, "Please provide a reason for revoking this token.").max(250),
});

export type AppointmentCheckinFormValues = z.infer<typeof appointmentCheckinSchema>;
export type WalkinCheckinFormValues = z.infer<typeof walkinCheckinSchema>;
export type VoidCheckinFormValues = z.infer<typeof voidCheckinSchema>;
export type IssueTokenFormValues = z.infer<typeof issueTokenSchema>;
export type ConsumeTokenFormValues = z.infer<typeof consumeTokenSchema>;
export type RevokeTokenFormValues = z.infer<typeof revokeTokenSchema>;
