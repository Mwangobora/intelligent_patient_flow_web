import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));
const requiredText = (label: string) => z.string().trim().min(1, `${label} is required.`);

export const facilitySchema = z.object({
  organization_id: requiredText("Organization"),
  facility_type_id: requiredText("Facility type"),
  name: requiredText("Facility name"),
  license_number: optionalText,
  email: optionalText,
  phone_number: optionalText,
  region: optionalText,
  district: optionalText,
  address_line1: optionalText,
  timezone: z.string().trim().min(1, "Timezone is required."),
  is_primary: z.boolean().optional(),
});

export const departmentSchema = z.object({
  name: requiredText("Department name"),
  parent_department_id: optionalText,
  description: optionalText,
});

export const specialtySchema = z.object({
  name: requiredText("Specialty name"),
  parent_specialty_id: optionalText,
  description: optionalText,
});

export const facilitySpecialtySchema = z.object({
  specialty_id: requiredText("Specialty"),
  department_id: optionalText,
  appointment_duration_minutes: z.coerce.number().int().min(1, "Duration must be greater than 0."),
  accepts_appointments: z.boolean().optional(),
  accepts_walk_ins: z.boolean().optional(),
  requires_referral: z.boolean().optional(),
});

export const servicePointSchema = z.object({
  service_point_type_id: requiredText("Service point type"),
  department_id: optionalText,
  name: requiredText("Service point name"),
  location_description: optionalText,
  floor: optionalText,
  display_order: z.coerce.number().int().min(0, "Display order must be 0 or more."),
});

export const consultationRoomSchema = z.object({
  department_id: optionalText,
  name: requiredText("Room name"),
  location_description: optionalText,
  floor: optionalText,
  capacity: z.coerce.number().int().min(1, "Capacity must be greater than 0."),
});

export const operatingHourSchema = z.object({
  day_of_week: z.coerce.number().int().min(1).max(7),
  period_order: z.coerce.number().int().min(1),
  opens_at: optionalText,
  closes_at: optionalText,
  closes_next_day: z.boolean().optional(),
  is_24_hours: z.boolean().optional(),
});

export const scheduleExceptionSchema = z.object({
  exception_date: requiredText("Exception date"),
  period_order: z.coerce.number().int().min(1),
  is_closed: z.boolean().optional(),
  opens_at: optionalText,
  closes_at: optionalText,
  closes_next_day: z.boolean().optional(),
  is_24_hours: z.boolean().optional(),
  reason: optionalText,
});
