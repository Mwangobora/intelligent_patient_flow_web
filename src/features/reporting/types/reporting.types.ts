import type {
  AppointmentDashboardSummary,
  DashboardOverviewSummary,
  IntelligenceDashboardSummary,
} from "@/features/dashboard/types/dashboard.types";
import type { FacilityLookupRecord } from "@/features/appointments/types/appointment.types";
import type { ISODateTime, UUID } from "@/types/common";

export type ReportType =
  | "patient_waiting_time"
  | "appointment_utilization"
  | "doctor_workload"
  | "daily_attendance"
  | "prediction_accuracy";

export type ExportFormat = "csv" | "xlsx" | "pdf" | "docx";
export type ReportExportStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

export type ReportExportRecord = {
  id: UUID;
  organization: UUID;
  organization_name: string;
  facility: UUID | null;
  facility_name: string | null;
  report_type: ReportType;
  export_format: ExportFormat;
  parameters: Record<string, unknown> | null;
  status: ReportExportStatus;
  requested_by: UUID | null;
  row_count: number | null;
  generated_at: ISODateTime | null;
  expires_at: ISODateTime | null;
  failed_at: ISODateTime | null;
  failure_reason: string | null;
  file_available: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type ReportingQueryParams = {
  organization_id?: UUID;
  facility_id?: UUID;
  date_from?: string;
  date_to?: string;
};

export type ReportExportListParams = {
  organization_id?: UUID;
  facility_id?: UUID;
  report_type?: ReportType | "";
  status?: ReportExportStatus | "";
  requested_by_id?: UUID;
};

export type CreateReportExportPayload = {
  organization_id: UUID;
  facility_id?: UUID | null;
  report_type: ReportType;
  export_format: ExportFormat;
  parameters?: Record<string, unknown> | null;
};

export type PatientWaitingTimeRow = {
  facility: string;
  service_point: string;
  patient_number: string;
  queue_number: string;
  joined_at: ISODateTime;
  service_started_at: ISODateTime;
  waiting_minutes: number;
  priority_level: number;
  status: string;
};

export type AppointmentUtilizationRow = {
  facility: string;
  specialty: string;
  practitioner: string;
  total_slots: number;
  booked_slots: number;
  completed_appointments: number;
  cancelled_appointments: number;
  no_show_appointments: number;
  utilization_percentage: number;
};

export type DoctorWorkloadRow = {
  practitioner: string;
  facility: string;
  department: string;
  specialty: string;
  shifts_count: number;
  total_scheduled_hours: number;
  completed_appointments: number;
  average_service_minutes: number | null;
};

export type DailyAttendanceRow = {
  date: string;
  facility: string;
  total_checkins: number;
  appointment_checkins: number;
  walkin_checkins: number;
  voided_checkins: number;
  completed_queue_entries: number;
};

export type PredictionAccuracyRow = {
  prediction_method: string;
  model_version: string;
  predicted_wait_minutes: number;
  actual_wait_minutes: number;
  absolute_error_minutes: number;
  generated_at: ISODateTime;
  queue: string;
  service_point: string;
  facility: string;
};

export type AnalyticsResponse<T> = {
  rows: T[];
  row_count: number;
};

export type ReportDownloadResult = {
  blob: Blob;
  filename: string;
  contentType: string;
};

export type ReportingOverviewBundle = {
  overview: DashboardOverviewSummary;
  appointments: AppointmentDashboardSummary;
  intelligence: IntelligenceDashboardSummary;
  exportHistory: ReportExportRecord[];
};

export type ReportDefinition = {
  type: ReportType;
  title: string;
  description: string;
};

export type ReportGenerateFormOptions = {
  facilities: FacilityLookupRecord[];
};
