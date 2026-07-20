import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));
const requiredText = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const notificationCreateSchema = z.object({
  patient_id: requiredText("Patient"),
  appointment_id: optionalText,
  queue_entry_id: optionalText,
  notification_type: z.enum([
    "appointment_confirmation",
    "appointment_reminder",
    "appointment_rescheduled",
    "appointment_cancelled",
    "queue_joined",
    "queue_updated",
    "queue_called",
    "general",
  ]),
  channel: z.enum(["sms", "email", "push", "in_app"]),
  recipient_user_id: optionalText,
  destination: optionalText,
  subject: optionalText,
  body: requiredText("Message body"),
  scheduled_for: optionalText,
  idempotency_key: optionalText,
});

export const notificationFactorySchema = z.object({
  factory_type: z.enum([
    "appointment_confirmation",
    "appointment_reminder",
    "appointment_rescheduled",
    "appointment_cancelled",
    "queue_joined",
    "queue_updated",
    "queue_called",
  ]),
  source_id: requiredText("Source record"),
  channel: z.enum(["sms", "email", "push", "in_app"]),
  scheduled_for: optionalText,
  idempotency_key: optionalText,
});

export const pushDeviceRegisterSchema = z.object({
  user_id: requiredText("User"),
  platform: z.enum(["android", "ios", "web"]),
  raw_token: requiredText("Push token"),
  device_name: optionalText,
  app_version: optionalText,
});

export type NotificationCreateFormValues = z.infer<typeof notificationCreateSchema>;
export type NotificationFactoryFormValues = z.infer<typeof notificationFactorySchema>;
export type PushDeviceRegisterFormValues = z.infer<typeof pushDeviceRegisterSchema>;
