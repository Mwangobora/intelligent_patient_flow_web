"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { facilitySchema } from "../schemas/facility.schemas";
import type { FacilityPayload, FacilityRecord, FacilityTypeRecord, OrganizationRecord } from "../types/facility.types";
import { cleanPayload } from "./facility-formatters";

type FacilityFormValues = {
  organization_id: string;
  facility_type_id: string;
  name: string;
  code: string;
  license_number: string;
  email: string;
  phone_number: string;
  region: string;
  district: string;
  address_line1: string;
  timezone: string;
  is_primary: boolean;
};

type FacilityFormProps = {
  organizations: OrganizationRecord[];
  facilityTypes: FacilityTypeRecord[];
  initialFacility?: FacilityRecord;
  isSubmitting: boolean;
  onSubmit: (payload: FacilityPayload) => Promise<void>;
};

export function FacilityForm({ organizations, facilityTypes, initialFacility, isSubmitting, onSubmit }: FacilityFormProps) {
  const [error, setError] = useState("");
  const [values, setValues] = useState<FacilityFormValues>({
    organization_id: initialFacility?.organization ?? "",
    facility_type_id: initialFacility?.facility_type ?? "",
    name: initialFacility?.name ?? "",
    code: initialFacility?.code ?? "",
    license_number: initialFacility?.license_number ?? "",
    email: initialFacility?.email ?? "",
    phone_number: initialFacility?.phone_number ?? "",
    region: initialFacility?.region ?? "",
    district: initialFacility?.district ?? "",
    address_line1: initialFacility?.address_line1 ?? "",
    timezone: initialFacility?.timezone ?? "Africa/Dar_es_Salaam",
    is_primary: initialFacility?.is_primary ?? false,
  });

  const update = (key: keyof FacilityFormValues, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const parsed = facilitySchema.safeParse(values);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Please check the facility form.");
          return;
        }
        await onSubmit(cleanPayload(parsed.data));
      }}
    >
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField
          label="Organization"
          required
          value={values.organization_id}
          onChange={(event) => update("organization_id", event.target.value)}
          options={[{ label: "Select organization", value: "" }, ...organizations.map((item) => ({ label: item.name, value: item.id }))]}
        />
        <SelectField
          label="Facility type"
          required
          value={values.facility_type_id}
          onChange={(event) => update("facility_type_id", event.target.value)}
          options={[{ label: "Select facility type", value: "" }, ...facilityTypes.map((item) => ({ label: item.name, value: item.id }))]}
        />
        <TextInputField label="Facility name" required value={values.name} onChange={(event) => update("name", event.target.value)} />
        <TextInputField label="Manual code" value={values.code} onChange={(event) => update("code", event.target.value)} helperText="Leave blank to let backend generate it." />
        <TextInputField label="License number" value={values.license_number} onChange={(event) => update("license_number", event.target.value)} />
        <TextInputField label="Email" type="email" value={values.email} onChange={(event) => update("email", event.target.value)} />
        <TextInputField label="Phone number" value={values.phone_number} onChange={(event) => update("phone_number", event.target.value)} />
        <TextInputField label="Timezone" required value={values.timezone} onChange={(event) => update("timezone", event.target.value)} />
        <TextInputField label="Region" value={values.region} onChange={(event) => update("region", event.target.value)} />
        <TextInputField label="District" value={values.district} onChange={(event) => update("district", event.target.value)} />
        <TextInputField label="Address line 1" value={values.address_line1} onChange={(event) => update("address_line1", event.target.value)} />
        <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={values.is_primary}
            onChange={(event) => update("is_primary", event.target.checked)}
            className="h-4 w-4 cursor-pointer accent-primary"
          />
          Primary facility for this organization
        </label>
      </div>
      <SubmitButton label={initialFacility ? "Save facility" : "Create facility"} loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
