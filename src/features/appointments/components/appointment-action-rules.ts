import type { AppointmentStatus } from "../types/appointment.types";

const CANCELLABLE_STATUSES = new Set<AppointmentStatus>([
  "pending",
  "confirmed",
  "checked_in",
  "queued",
  "in_service",
]);

const RESCHEDULABLE_STATUSES = new Set<AppointmentStatus>([
  "pending",
  "confirmed",
  "checked_in",
  "queued",
  "in_service",
  "rescheduled",
]);

export function canCancelAppointment(status: AppointmentStatus) {
  return CANCELLABLE_STATUSES.has(status);
}

export function canRescheduleAppointment(status: AppointmentStatus) {
  return RESCHEDULABLE_STATUSES.has(status);
}
