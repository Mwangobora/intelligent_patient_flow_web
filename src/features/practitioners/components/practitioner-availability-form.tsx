"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { availabilitySchema, type AvailabilityFormValues } from "../schemas/practitioner.schemas";
import type { PractitionerFacilityAssignmentRecord } from "../types/practitioner.types";

type PractitionerAvailabilityFormProps = {
  assignments: PractitionerFacilityAssignmentRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: AvailabilityFormValues) => Promise<void>;
};

const dayOptions = [
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
  { label: "Sunday", value: "7" },
];

export function PractitionerAvailabilityForm({ assignments, isSubmitting = false, onSubmit }: PractitionerAvailabilityFormProps) {
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { practitioner_facility_assignment_id: "", day_of_week: "1", starts_at: "", ends_at: "", valid_from: "", valid_until: "", is_available_for_appointments: true },
  });
  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => { await onSubmit(values); form.reset(); })}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Facility assignment" options={[{ label: "Select practitioner assignment", value: "" }, ...assignments.map((assignment) => ({ label: `${assignment.practitioner_number} • ${assignment.facility_name}`, value: assignment.id }))]} error={errors.practitioner_facility_assignment_id?.message} {...form.register("practitioner_facility_assignment_id")} />
        <SelectField label="Day of week" options={dayOptions} error={errors.day_of_week?.message} {...form.register("day_of_week")} />
        <TextInputField label="Start time" type="time" error={errors.starts_at?.message} {...form.register("starts_at")} />
        <TextInputField label="End time" type="time" error={errors.ends_at?.message} {...form.register("ends_at")} />
        <TextInputField label="Valid from" type="date" error={errors.valid_from?.message} {...form.register("valid_from")} />
        <TextInputField label="Valid until" type="date" error={errors.valid_until?.message} {...form.register("valid_until")} />
      </div>
      <label className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-3 text-sm text-foreground">
        <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_available_for_appointments")} />
        <span>Available for appointments</span>
      </label>
      <SubmitButton label="Create availability period" loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
