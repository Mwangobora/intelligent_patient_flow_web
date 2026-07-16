"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { facilityAssignmentSchema, type FacilityAssignmentFormValues } from "../schemas/practitioner.schemas";
import type { FacilityLookupRecord } from "../types/practitioner.types";

type PractitionerFacilityAssignmentFormProps = {
  facilities: FacilityLookupRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: FacilityAssignmentFormValues) => Promise<void>;
};

export function PractitionerFacilityAssignmentForm({ facilities, isSubmitting = false, onSubmit }: PractitionerFacilityAssignmentFormProps) {
  const form = useForm<FacilityAssignmentFormValues>({
    resolver: zodResolver(facilityAssignmentSchema),
    defaultValues: { facility_id: "", starts_on: "", ends_on: "", is_primary: false },
  });
  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => { await onSubmit(values); form.reset(); })}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Facility" options={[{ label: "Select facility", value: "" }, ...facilities.map((facility) => ({ label: facility.name, value: facility.id }))]} error={errors.facility_id?.message} {...form.register("facility_id")} />
        <TextInputField label="Starts on" type="date" error={errors.starts_on?.message} {...form.register("starts_on")} />
        <TextInputField label="Ends on" type="date" error={errors.ends_on?.message} {...form.register("ends_on")} />
        <label className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-3 text-sm text-foreground">
          <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_primary")} />
          <span>Primary facility assignment</span>
        </label>
      </div>
      <SubmitButton label="Add facility assignment" loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
