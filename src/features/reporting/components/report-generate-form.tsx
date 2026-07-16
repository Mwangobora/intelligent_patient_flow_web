"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import type { FacilityLookupRecord } from "@/features/appointments/types/appointment.types";

import { reportExportSchema, type ReportExportFormValues } from "../schemas/reporting.schemas";

type ReportGenerateFormProps = {
  facilities: FacilityLookupRecord[];
  defaultFacilityId?: string;
  isSubmitting: boolean;
  onSubmit: (values: ReportExportFormValues) => Promise<void>;
};

const reportTypeOptions = [
  { label: "Patient Waiting Time", value: "patient_waiting_time" },
  { label: "Appointment Utilization", value: "appointment_utilization" },
  { label: "Doctor Workload", value: "doctor_workload" },
  { label: "Daily Attendance", value: "daily_attendance" },
  { label: "Prediction Accuracy", value: "prediction_accuracy" },
];

const exportFormatOptions = [
  { label: "PDF", value: "pdf" },
  { label: "DOCX", value: "docx" },
  { label: "XLSX", value: "xlsx" },
  { label: "CSV", value: "csv" },
];

export function ReportGenerateForm({
  facilities,
  defaultFacilityId = "",
  isSubmitting,
  onSubmit,
}: ReportGenerateFormProps) {
  const form = useForm<ReportExportFormValues>({
    resolver: zodResolver(reportExportSchema),
    defaultValues: {
      facility_id: defaultFacilityId,
      report_type: "patient_waiting_time",
      export_format: "pdf",
      date_from: "",
      date_to: "",
    },
  });
  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormErrorAlert message={errors.root?.message} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField
          label="Report type"
          required
          options={reportTypeOptions}
          error={errors.report_type?.message}
          {...form.register("report_type")}
        />
        <SelectField
          label="Export format"
          required
          options={exportFormatOptions}
          error={errors.export_format?.message}
          {...form.register("export_format")}
        />
        <SelectField
          label="Facility"
          options={[{ label: "All organization facilities", value: "" }, ...facilities.map((facility) => ({ label: facility.name, value: facility.id }))]}
          error={errors.facility_id?.message}
          {...form.register("facility_id")}
        />
        <div />
        <TextInputField label="Date from" type="date" required error={errors.date_from?.message} {...form.register("date_from")} />
        <TextInputField label="Date to" type="date" required error={errors.date_to?.message} {...form.register("date_to")} />
      </div>
      <SubmitButton label="Generate report" loadingLabel="Generating..." isLoading={isSubmitting} />
    </form>
  );
}
