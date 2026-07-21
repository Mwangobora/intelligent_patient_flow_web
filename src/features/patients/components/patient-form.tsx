"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import type { FacilityLookupRecord } from "@/features/appointments/types/appointment.types";

import { patientCreateSchema, patientUpdateSchema } from "../schemas/patient.schemas";
import type { PatientIdentifierTypeRecord, RelationshipTypeRecord } from "../types/patient.types";

type PatientFormMode = "create" | "update";
type PatientCreateValues = z.input<typeof patientCreateSchema>;
type PatientUpdateValues = z.input<typeof patientUpdateSchema>;

type PatientFormProps = {
  mode: PatientFormMode;
  facilities: FacilityLookupRecord[];
  identifierTypes?: PatientIdentifierTypeRecord[];
  relationshipTypes?: RelationshipTypeRecord[];
  defaultFacilityId?: string;
  initialValues?: Partial<PatientCreateValues>;
  isSubmitting: boolean;
  onSubmit: (values: PatientCreateValues | PatientUpdateValues) => Promise<void>;
};

const sexOptions = [
  { label: "Select sex", value: "" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Intersex", value: "intersex" },
  { label: "Unknown", value: "unknown" },
];

export function PatientForm({
  mode,
  facilities,
  identifierTypes = [],
  relationshipTypes = [],
  defaultFacilityId = "",
  initialValues,
  isSubmitting,
  onSubmit,
}: PatientFormProps) {
  const isCreate = mode === "create";
  const form = useForm<PatientCreateValues | PatientUpdateValues>({
    resolver: zodResolver(isCreate ? patientCreateSchema : patientUpdateSchema),
    defaultValues: {
      registered_facility_id: initialValues?.registered_facility_id ?? defaultFacilityId,
      first_name: initialValues?.first_name ?? "",
      middle_name: initialValues?.middle_name ?? "",
      last_name: initialValues?.last_name ?? "",
      date_of_birth: initialValues?.date_of_birth ?? "",
      date_of_birth_is_estimated: initialValues?.date_of_birth_is_estimated ?? false,
      sex_code: initialValues?.sex_code ?? "",
      email: initialValues?.email ?? "",
      phone_number: initialValues?.phone_number ?? "+255",
      identifier_type_id: initialValues?.identifier_type_id ?? "",
      identifier_value: initialValues?.identifier_value ?? "",
      identifier_issuing_authority: initialValues?.identifier_issuing_authority ?? "",
      identifier_is_primary: initialValues?.identifier_is_primary ?? true,
      address_label: initialValues?.address_label ?? "",
      address_line1: initialValues?.address_line1 ?? "",
      address_line2: initialValues?.address_line2 ?? "",
      address_country_code: initialValues?.address_country_code ?? "",
      address_region: initialValues?.address_region ?? "",
      address_district: initialValues?.address_district ?? "",
      address_ward: initialValues?.address_ward ?? "",
      address_postal_code: initialValues?.address_postal_code ?? "",
      related_person_relationship_type_id: initialValues?.related_person_relationship_type_id ?? "",
      related_person_first_name: initialValues?.related_person_first_name ?? "",
      related_person_middle_name: initialValues?.related_person_middle_name ?? "",
      related_person_last_name: initialValues?.related_person_last_name ?? "",
      related_person_is_emergency_contact: initialValues?.related_person_is_emergency_contact ?? true,
      related_person_phone: initialValues?.related_person_phone ?? "",
      related_person_email: initialValues?.related_person_email ?? "",
    },
  });
  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormErrorAlert message={errors.root?.message} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="First name" required error={errors.first_name?.message} {...form.register("first_name")} />
        <TextInputField label="Last name" required error={errors.last_name?.message} {...form.register("last_name")} />
        <TextInputField label="Middle name" error={errors.middle_name?.message} {...form.register("middle_name")} />
        <SelectField
          label="Registered facility"
          options={[{ label: "No registered facility", value: "" }, ...facilities.map((facility) => ({ label: facility.name, value: facility.id }))]}
          error={errors.registered_facility_id?.message}
          {...form.register("registered_facility_id")}
        />
        <TextInputField label="Date of birth" type="date" error={errors.date_of_birth?.message} {...form.register("date_of_birth")} />
        <SelectField label="Sex" options={sexOptions} error={errors.sex_code?.message} {...form.register("sex_code")} />
        <TextInputField label="Email" type="email" error={errors.email?.message} {...form.register("email")} />
        <TextInputField label="Phone number" placeholder="+255..." error={errors.phone_number?.message} {...form.register("phone_number")} />
      </div>

      {isCreate ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Optional identifier</h3>
            <SelectField
              label="Identifier type"
              options={[
                { label: "Skip for now", value: "" },
                ...identifierTypes.map((item) => ({ label: item.name, value: item.id })),
              ]}
              helperText="You can also add or verify identifiers later."
              {...form.register("identifier_type_id")}
            />
            <TextInputField label="Identifier value" {...form.register("identifier_value")} />
            <TextInputField label="Issuing authority" {...form.register("identifier_issuing_authority")} />
          </div>
          <div className="space-y-4 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Optional address</h3>
            <TextInputField label="Address label" {...form.register("address_label")} />
            <TextInputField label="Address line 1" {...form.register("address_line1")} />
            <TextInputField label="Region" {...form.register("address_region")} />
            <TextInputField label="Postal code" {...form.register("address_postal_code")} />
          </div>
          <div className="space-y-4 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Optional emergency contact</h3>
            <SelectField
              label="Relationship type"
              options={[
                { label: "Skip for now", value: "" },
                ...relationshipTypes.map((item) => ({ label: item.name, value: item.id })),
              ]}
              {...form.register("related_person_relationship_type_id")}
            />
            <TextInputField label="Contact first name" {...form.register("related_person_first_name")} />
            <TextInputField label="Contact last name" {...form.register("related_person_last_name")} />
            <TextInputField label="Contact phone" {...form.register("related_person_phone")} />
          </div>
        </div>
      ) : null}

      <SubmitButton
        label={mode === "create" ? "Create patient" : "Save changes"}
        loadingLabel={mode === "create" ? "Creating patient..." : "Saving changes..."}
        isLoading={isSubmitting}
      />
    </form>
  );
}
