"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextareaField } from "@/components/forms/textarea-field";
import { PatientSearchSelect } from "@/features/appointments/components/patient-search-select";
import { useFacilitySpecialtiesQuery } from "@/features/appointments/hooks/use-appointment-queries";
import type { FacilityLookupRecord } from "@/features/appointments/types/appointment.types";

import { walkinCheckinSchema, type WalkinCheckinFormValues } from "../schemas/checkin.schemas";

type WalkinCheckinFormProps = {
  facilities: FacilityLookupRecord[];
  defaultFacilityId?: string;
  organizationId?: string;
  isSubmitting: boolean;
  onSubmit: (values: WalkinCheckinFormValues) => Promise<void>;
};

const checkinMethodOptions = [
  { label: "Reception", value: "reception" },
  { label: "Mobile", value: "mobile" },
  { label: "QR code", value: "qr_code" },
  { label: "Self service", value: "self_service" },
];

export function WalkinCheckinForm({
  facilities,
  defaultFacilityId = "",
  organizationId,
  isSubmitting,
  onSubmit,
}: WalkinCheckinFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const form = useForm<WalkinCheckinFormValues>({
    resolver: zodResolver(walkinCheckinSchema),
    defaultValues: {
      facility_id: defaultFacilityId,
      patient_id: "",
      facility_specialty_id: "",
      checkin_method: "reception",
      notes: "",
    },
  });

  const fieldErrors = form.formState.errors;
  const facilityId = useWatch({ control: form.control, name: "facility_id" });
  const specialtiesQuery = useFacilitySpecialtiesQuery(
    { facility_id: facilityId || undefined, is_active: true },
    { enabled: Boolean(facilityId) },
  );
  const walkinSpecialties = (specialtiesQuery.data ?? []).filter((specialty) => specialty.accepts_walk_ins);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormErrorAlert message={form.formState.errors.root?.message} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField
          label="Facility"
          required
          options={[{ label: "Select facility", value: "" }, ...facilities.map((facility) => ({ label: facility.name, value: facility.id }))]}
          error={fieldErrors.facility_id?.message}
          {...form.register("facility_id")}
        />
        <SelectField
          label="Check-in method"
          required
          options={checkinMethodOptions}
          error={fieldErrors.checkin_method?.message}
          {...form.register("checkin_method")}
        />
      </div>
      <PatientSearchSelect
        organizationId={organizationId}
        facilityId={facilityId}
        value={selectedPatientId}
        onChange={(patientId) => {
          setSelectedPatientId(patientId);
          form.setValue("patient_id", patientId, { shouldValidate: true });
        }}
      />
      <SelectField
        label="Walk-in service"
        required
        options={[
          { label: "Select walk-in service", value: "" },
          ...walkinSpecialties.map((specialty) => ({
            label: `${specialty.specialty_name}${specialty.department_name ? ` · ${specialty.department_name}` : ""}`,
            value: specialty.id,
          })),
        ]}
        helperText="Only services that explicitly accept walk-ins are listed."
        error={fieldErrors.facility_specialty_id?.message}
        disabled={!facilityId}
        {...form.register("facility_specialty_id")}
      />
      <TextareaField label="Notes" rows={3} error={fieldErrors.notes?.message} {...form.register("notes")} />
      <SubmitButton label="Create walk-in check-in" loadingLabel="Checking in..." isLoading={isSubmitting} />
    </form>
  );
}
