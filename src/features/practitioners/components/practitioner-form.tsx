"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { practitionerSchema, type PractitionerFormValues } from "../schemas/practitioner.schemas";
import type { FacilityLookupRecord, PractitionerRecord, PractitionerTypeRecord } from "../types/practitioner.types";

type PractitionerFormProps = {
  organizationId: string;
  practitionerTypes: PractitionerTypeRecord[];
  facilities: FacilityLookupRecord[];
  initialValues?: PractitionerRecord;
  mode?: "create" | "update";
  isSubmitting?: boolean;
  onSubmit: (values: PractitionerFormValues) => Promise<void>;
};

export function PractitionerForm({
  organizationId,
  practitionerTypes,
  facilities,
  initialValues,
  mode = "create",
  isSubmitting = false,
  onSubmit,
}: PractitionerFormProps) {
  const form = useForm<PractitionerFormValues>({
    resolver: zodResolver(practitionerSchema),
    defaultValues: {
      organization_id: organizationId,
      practitioner_type_id: initialValues?.practitioner_type ?? "",
      user_id: initialValues?.user ?? "",
      first_name: initialValues?.first_name ?? "",
      middle_name: initialValues?.middle_name ?? "",
      last_name: initialValues?.last_name ?? "",
      preferred_name: initialValues?.preferred_name ?? "",
      email: initialValues?.email ?? "",
      phone_number: initialValues?.phone_number ?? "",
    },
  });

  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorAlert message={errors.root?.message} />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Practitioner type"
          options={[
            { label: "Select type", value: "" },
            ...practitionerTypes.map((type) => ({ label: type.name, value: type.id })),
          ]}
          error={errors.practitioner_type_id?.message}
          {...form.register("practitioner_type_id")}
        />
        <SelectField
          label="Default facility scope"
          disabled
          options={[
            { label: facilities[0] ? facilities[0].name : "Facility scope is managed by memberships", value: facilities[0]?.id ?? "" },
          ]}
          helperText="Facilities are assigned separately through facility assignments."
        />
        <TextInputField label="First name" error={errors.first_name?.message} {...form.register("first_name")} />
        <TextInputField label="Middle name" error={errors.middle_name?.message} {...form.register("middle_name")} />
        <TextInputField label="Last name" error={errors.last_name?.message} {...form.register("last_name")} />
        <TextInputField label="Preferred name" error={errors.preferred_name?.message} {...form.register("preferred_name")} />
        <TextInputField label="Email" type="email" error={errors.email?.message} {...form.register("email")} />
        <TextInputField label="Phone number" error={errors.phone_number?.message} {...form.register("phone_number")} />
      </div>
      <SubmitButton label={mode === "create" ? "Create practitioner" : "Update practitioner"} loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
