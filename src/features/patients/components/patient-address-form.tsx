"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { patientAddressSchema } from "../schemas/patient.schemas";

type PatientAddressValues = z.input<typeof patientAddressSchema>;

type PatientAddressFormProps = {
  isSubmitting: boolean;
  initialValues?: Partial<PatientAddressValues>;
  submitLabel?: string;
  onSubmit: (values: PatientAddressValues) => Promise<void>;
};

export function PatientAddressForm({
  isSubmitting,
  initialValues,
  submitLabel = "Save address",
  onSubmit,
}: PatientAddressFormProps) {
  const form = useForm<PatientAddressValues>({
    resolver: zodResolver(patientAddressSchema),
    defaultValues: {
      label: initialValues?.label ?? "",
      address_line1: initialValues?.address_line1 ?? "",
      address_line2: initialValues?.address_line2 ?? "",
      country_code: initialValues?.country_code ?? "",
      region: initialValues?.region ?? "",
      district: initialValues?.district ?? "",
      ward: initialValues?.ward ?? "",
      postal_code: initialValues?.postal_code ?? "",
      is_primary: initialValues?.is_primary ?? true,
    },
  });
  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
      <TextInputField label="Address label" error={errors.label?.message} {...form.register("label")} />
      <TextInputField label="Country code" error={errors.country_code?.message} {...form.register("country_code")} />
      <TextInputField label="Address line 1" error={errors.address_line1?.message} {...form.register("address_line1")} />
      <TextInputField label="Address line 2" error={errors.address_line2?.message} {...form.register("address_line2")} />
      <TextInputField label="Region" error={errors.region?.message} {...form.register("region")} />
      <TextInputField label="District" error={errors.district?.message} {...form.register("district")} />
      <TextInputField label="Ward" error={errors.ward?.message} {...form.register("ward")} />
      <TextInputField label="Postal code" error={errors.postal_code?.message} {...form.register("postal_code")} />
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_primary")} />
        Set as primary address
      </label>
      <div className="lg:col-span-2">
        <SubmitButton label={submitLabel} loadingLabel="Saving address..." isLoading={isSubmitting} />
      </div>
    </form>
  );
}
