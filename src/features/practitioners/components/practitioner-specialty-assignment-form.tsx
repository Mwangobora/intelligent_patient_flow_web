"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { specialtyAssignmentSchema, type SpecialtyAssignmentFormValues } from "../schemas/practitioner.schemas";
import type { FacilitySpecialtyLookupRecord } from "../types/practitioner.types";

type PractitionerSpecialtyAssignmentFormProps = {
  specialties: FacilitySpecialtyLookupRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: SpecialtyAssignmentFormValues) => Promise<void>;
};

export function PractitionerSpecialtyAssignmentForm({ specialties, isSubmitting = false, onSubmit }: PractitionerSpecialtyAssignmentFormProps) {
  const form = useForm<SpecialtyAssignmentFormValues>({
    resolver: zodResolver(specialtyAssignmentSchema),
    defaultValues: { facility_specialty_id: "", starts_on: "", ends_on: "", is_primary: false },
  });
  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => { await onSubmit(values); form.reset(); })}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Facility specialty" options={[{ label: "Select specialty", value: "" }, ...specialties.map((specialty) => ({ label: `${specialty.specialty_name}${specialty.department_name ? ` • ${specialty.department_name}` : ""}`, value: specialty.id }))]} error={errors.facility_specialty_id?.message} {...form.register("facility_specialty_id")} />
        <TextInputField label="Starts on" type="date" error={errors.starts_on?.message} {...form.register("starts_on")} />
        <TextInputField label="Ends on" type="date" error={errors.ends_on?.message} {...form.register("ends_on")} />
        <label className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-3 text-sm text-foreground">
          <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_primary")} />
          <span>Primary specialty assignment</span>
        </label>
      </div>
      <SubmitButton label="Add specialty assignment" loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
