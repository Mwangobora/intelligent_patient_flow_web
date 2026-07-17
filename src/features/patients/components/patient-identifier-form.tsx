"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { patientIdentifierSchema } from "../schemas/patient.schemas";
import type { PatientIdentifierTypeRecord } from "../types/patient.types";

type PatientIdentifierValues = z.input<typeof patientIdentifierSchema>;

type PatientIdentifierFormProps = {
  identifierTypes: PatientIdentifierTypeRecord[];
  isSubmitting: boolean;
  onSubmit: (values: PatientIdentifierValues) => Promise<void>;
};

export function PatientIdentifierForm({
  identifierTypes,
  isSubmitting,
  onSubmit,
}: PatientIdentifierFormProps) {
  const form = useForm<PatientIdentifierValues>({
    resolver: zodResolver(patientIdentifierSchema),
    defaultValues: {
      identifier_type_id: "",
      value: "",
      issuing_country_code: "",
      issuing_authority: "",
      issued_on: "",
      expires_on: "",
      is_primary: true,
    },
  });
  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
      <SelectField
        label="Identifier type"
        required
        options={identifierTypes.map((item) => ({ label: item.name, value: item.id }))}
        error={errors.identifier_type_id?.message}
        {...form.register("identifier_type_id")}
      />
      <TextInputField label="Identifier value" required error={errors.value?.message} {...form.register("value")} />
      <TextInputField label="Issuing country" error={errors.issuing_country_code?.message} {...form.register("issuing_country_code")} />
      <TextInputField label="Issuing authority" error={errors.issuing_authority?.message} {...form.register("issuing_authority")} />
      <TextInputField label="Issued on" type="date" error={errors.issued_on?.message} {...form.register("issued_on")} />
      <TextInputField label="Expires on" type="date" error={errors.expires_on?.message} {...form.register("expires_on")} />
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_primary")} />
        Set as primary identifier
      </label>
      <div className="lg:col-span-2">
        <SubmitButton label="Add identifier" loadingLabel="Adding identifier..." isLoading={isSubmitting} />
      </div>
    </form>
  );
}
