import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));
const requiredText = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const organizationSchema = z.object({
  name: requiredText("Organization name"),
  legal_name: optionalText,
  email: optionalText,
  phone_number: optionalText,
  registration_number: optionalText,
});

export const userSchema = z.object({
  email: optionalText,
  phone_number: optionalText,
  password: optionalText,
  first_name: requiredText("First name"),
  middle_name: optionalText,
  last_name: requiredText("Last name"),
});

export const roleSchema = z.object({
  name: requiredText("Role name"),
  description: optionalText,
  organization_id: optionalText,
  facility_id: optionalText,
});

export const permissionSchema = z.object({
  name: requiredText("Permission name"),
  module: requiredText("Module"),
  action: requiredText("Action"),
  code: optionalText,
  description: optionalText,
});

export const membershipSchema = z.object({
  user_id: requiredText("User"),
  organization_id: requiredText("Organization"),
  facility_id: optionalText,
  starts_at: optionalText,
  ends_at: optionalText,
});

export const roleAssignmentSchema = z.object({
  user_id: requiredText("User"),
  role_id: requiredText("Role"),
  starts_at: optionalText,
  ends_at: optionalText,
});

export const flowSettingsSchema = z.object({
  facility_id: requiredText("Facility"),
  max_advance_booking_days: z.number().int().min(0),
  minimum_booking_notice_minutes: z.number().int().min(0),
  cancellation_cutoff_minutes: z.number().int().min(0),
  reschedule_cutoff_minutes: z.number().int().min(0),
  early_checkin_minutes: z.number().int().min(0),
  late_checkin_grace_minutes: z.number().int().min(0),
  no_show_after_minutes: z.number().int().min(0),
  default_reminder_minutes_before: z.number().int().min(0),
  queue_number_padding: z.number().int().min(1).max(6),
  auto_create_daily_queues: z.boolean(),
});

export const profileSchema = z.object({
  first_name: requiredText("First name"),
  middle_name: optionalText,
  last_name: requiredText("Last name"),
});

export const passwordSchema = z.object({
  old_password: requiredText("Current password"),
  new_password: z.string().min(8, "New password must be at least 8 characters."),
});

export type OrganizationFormValues = z.input<typeof organizationSchema>;
export type UserFormValues = z.input<typeof userSchema>;
export type RoleFormValues = z.input<typeof roleSchema>;
export type PermissionFormValues = z.input<typeof permissionSchema>;
export type MembershipFormValues = z.input<typeof membershipSchema>;
export type RoleAssignmentFormValues = z.input<typeof roleAssignmentSchema>;
export type FlowSettingsFormValues = z.infer<typeof flowSettingsSchema>;
export type ProfileFormValues = z.input<typeof profileSchema>;
export type PasswordFormValues = z.input<typeof passwordSchema>;
