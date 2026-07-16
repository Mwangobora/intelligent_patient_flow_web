import { z } from "zod";

export const analyticsFiltersSchema = z.object({
  facility_id: z.string().uuid().optional().or(z.literal("")),
  date_from: z.string().min(1, "Start date is required."),
  date_to: z.string().min(1, "End date is required."),
}).refine((value) => value.date_to >= value.date_from, {
  message: "End date cannot be before start date.",
  path: ["date_to"],
});

export const exportFiltersSchema = z.object({
  facility_id: z.string().uuid().optional().or(z.literal("")),
  report_type: z.string().optional().or(z.literal("")),
  status: z.string().optional().or(z.literal("")),
});

export const reportExportSchema = z.object({
  facility_id: z.string().uuid().optional().or(z.literal("")),
  report_type: z.enum([
    "patient_waiting_time",
    "appointment_utilization",
    "doctor_workload",
    "daily_attendance",
    "prediction_accuracy",
  ]),
  export_format: z.enum(["pdf", "docx", "xlsx", "csv"]),
  date_from: z.string().min(1, "Start date is required."),
  date_to: z.string().min(1, "End date is required."),
}).refine((value) => value.date_to >= value.date_from, {
  message: "End date cannot be before start date.",
  path: ["date_to"],
});

export type AnalyticsFiltersFormValues = z.infer<typeof analyticsFiltersSchema>;
export type ExportFiltersFormValues = z.infer<typeof exportFiltersSchema>;
export type ReportExportFormValues = z.infer<typeof reportExportSchema>;
