"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { patientRelatedPersonSchema } from "../schemas/patient.schemas";
import type { RelationshipTypeRecord } from "../types/patient.types";

type RelatedPersonValues = z.input<typeof patientRelatedPersonSchema>;

type RelatedPersonFormProps = {
  relationshipTypes: RelationshipTypeRecord[];
  initialValues?: Partial<RelatedPersonValues>;
  submitLabel?: string;
  isSubmitting: boolean;
  onSubmit: (values: RelatedPersonValues) => Promise<void>;
};

export function RelatedPersonForm({
  relationshipTypes,
  initialValues,
  submitLabel = "Save related person",
  isSubmitting,
  onSubmit,
}: RelatedPersonFormProps) {
  const form = useForm<RelatedPersonValues>({
    resolver: zodResolver(patientRelatedPersonSchema),
    defaultValues: {
      relationship_type_id: initialValues?.relationship_type_id ?? "",
      first_name: initialValues?.first_name ?? "",
      middle_name: initialValues?.middle_name ?? "",
      last_name: initialValues?.last_name ?? "",
      is_guardian: initialValues?.is_guardian ?? false,
      is_caregiver: initialValues?.is_caregiver ?? false,
      is_next_of_kin: initialValues?.is_next_of_kin ?? false,
      is_emergency_contact: initialValues?.is_emergency_contact ?? true,
      priority_order: initialValues?.priority_order ?? 1,
    },
  });
  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
      <SelectField
        label="Relationship type"
        required
        options={relationshipTypes.map((item) => ({ label: item.name, value: item.id }))}
        error={errors.relationship_type_id?.message}
        {...form.register("relationship_type_id")}
      />
      <TextInputField label="Priority order" type="number" error={errors.priority_order?.message} {...form.register("priority_order")} />
      <TextInputField label="First name" required error={errors.first_name?.message} {...form.register("first_name")} />
      <TextInputField label="Last name" required error={errors.last_name?.message} {...form.register("last_name")} />
      <TextInputField label="Middle name" error={errors.middle_name?.message} {...form.register("middle_name")} />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
          <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_emergency_contact")} />
          Emergency contact
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
          <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_guardian")} />
          Guardian
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
          <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_caregiver")} />
          Caregiver
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
          <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_next_of_kin")} />
          Next of kin
        </label>
      </div>
      <div className="lg:col-span-2">
        <SubmitButton label={submitLabel} loadingLabel="Saving related person..." isLoading={isSubmitting} />
      </div>
    </form>
  );
}
