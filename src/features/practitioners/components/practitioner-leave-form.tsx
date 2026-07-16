"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import { leaveRequestSchema, type LeaveRequestFormValues } from "../schemas/practitioner.schemas";
import type { PractitionerFacilityAssignmentRecord } from "../types/practitioner.types";

type PractitionerLeaveFormProps = {
  assignments: PractitionerFacilityAssignmentRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: LeaveRequestFormValues) => Promise<void>;
};

export function PractitionerLeaveForm({ assignments, isSubmitting = false, onSubmit }: PractitionerLeaveFormProps) {
  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { practitioner_facility_assignment_id: "", starts_at: "", ends_at: "", reason: "" },
  });
  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => { await onSubmit(values); form.reset(); })}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Facility assignment" options={[{ label: "Select assignment", value: "" }, ...assignments.map((assignment) => ({ label: `${assignment.practitioner_number} • ${assignment.facility_name}`, value: assignment.id }))]} error={errors.practitioner_facility_assignment_id?.message} {...form.register("practitioner_facility_assignment_id")} />
        <TextInputField label="Starts at" type="datetime-local" error={errors.starts_at?.message} {...form.register("starts_at")} />
        <TextInputField label="Ends at" type="datetime-local" error={errors.ends_at?.message} {...form.register("ends_at")} />
      </div>
      <TextareaField label="Reason" rows={3} error={errors.reason?.message} {...form.register("reason")} />
      <SubmitButton label="Request leave" loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
