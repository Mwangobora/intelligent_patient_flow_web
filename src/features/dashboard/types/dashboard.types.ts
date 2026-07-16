import type { ISODateTime, UUID } from "@/types/common";

export type DashboardQueryParams = {
  organization_id?: UUID;
  facility_id?: UUID;
  date_from?: string;
  date_to?: string;
  department_id?: UUID;
  specialty_id?: UUID;
  service_point_id?: UUID;
  practitioner_id?: UUID;
};

export type DashboardOverviewSummary = {
  total_patients: number;
  total_appointments_today: number;
  total_checkins_today: number;
  total_waiting_now: number;
  total_called_now: number;
  total_in_service_now: number;
  completed_visits_today: number;
  cancelled_appointments_today: number;
  no_show_appointments_today: number;
  average_wait_minutes_today: number | null;
  active_queues: number;
  generated_at: ISODateTime;
};

export type AppointmentDashboardSummary = {
  appointments_total: number;
  pending: number;
  confirmed: number;
  checked_in: number;
  queued: number;
  in_service: number;
  completed: number;
  cancelled: number;
  no_show: number;
  rescheduled: number;
  appointments_by_status: Array<{ status: string; count: number }>;
  appointments_by_specialty: Array<{
    specialty_id: UUID | null;
    specialty_name: string | null;
    count: number;
  }>;
  appointments_by_hour: Array<{ hour: number; count: number }>;
  appointment_utilization_percentage: number | null;
  generated_at: ISODateTime;
};

export type QueueDashboardSummary = {
  active_queues: number;
  waiting_patients: number;
  called_patients: number;
  in_service_patients: number;
  skipped_patients: number;
  completed_today: number;
  cancelled_today: number;
  transferred_today: number;
  average_wait_minutes: number | null;
  longest_wait_minutes: number | null;
  queues_by_service_point: Array<{
    service_point_id: UUID;
    service_point_name: string;
    service_point_code: string;
    waiting: number;
    called: number;
    in_service: number;
    skipped: number;
  }>;
  next_entries_summary: Array<{
    queue_id: UUID;
    service_point_name: string;
    display_queue_number: string;
    priority_level: number;
    waiting_minutes: number;
  }>;
  generated_at: ISODateTime;
};

export type CheckinDashboardSummary = {
  total_checkins: number;
  appointment_checkins: number;
  walkin_checkins: number;
  qr_checkins: number;
  reception_checkins: number;
  mobile_checkins: number;
  self_service_checkins: number;
  voided_checkins: number;
  checkins_by_hour: Array<{ hour: number; count: number }>;
  checkins_by_method: Array<{ method: string; count: number }>;
  generated_at: ISODateTime;
};

export type PractitionerDashboardSummary = {
  active_practitioners_today: number;
  practitioners_on_shift_now: number;
  scheduled_shifts: number;
  completed_shifts: number;
  cancelled_shifts: number;
  total_scheduled_hours: number;
  completed_appointments_by_practitioner: Array<{
    practitioner_id: UUID;
    practitioner_name: string;
    completed_appointments: number;
  }>;
  average_service_time_by_practitioner: Array<{
    practitioner_id: UUID;
    practitioner_name: string;
    average_service_minutes: number | null;
  }>;
  workload_summary: Array<{
    practitioner_id: UUID;
    practitioner_name: string;
    shifts_count: number;
    scheduled_hours: number;
    completed_appointments: number;
  }>;
  generated_at: ISODateTime;
};

export type IntelligenceDashboardSummary = {
  predictions_generated: number;
  rule_based_predictions: number;
  machine_learning_predictions: number;
  average_predicted_wait_minutes: number | null;
  average_actual_wait_minutes: number | null;
  average_prediction_error_minutes: number | null;
  latest_predictions_summary: Array<{
    prediction_id: UUID;
    queue_entry_id: UUID;
    prediction_method: string;
    predicted_wait_minutes: number;
    actual_wait_minutes: number | null;
    absolute_error_minutes: number | null;
    generated_at: ISODateTime;
  }>;
  generated_at: ISODateTime;
};
