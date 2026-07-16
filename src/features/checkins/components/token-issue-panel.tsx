"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { PatientSearchSelect } from "@/features/appointments/components/patient-search-select";
import { useAppointmentsQuery } from "@/features/appointments/hooks/use-appointment-queries";
import type { FacilityLookupRecord } from "@/features/appointments/types/appointment.types";

import { issueTokenSchema, type IssueTokenFormValues } from "../schemas/checkin.schemas";
import type { IssuedCheckinTokenRecord } from "../types/checkin.types";

type TokenIssuePanelProps = {
  facilities: FacilityLookupRecord[];
  organizationId?: string;
  defaultFacilityId?: string;
  issuedToken?: IssuedCheckinTokenRecord | null;
  isSubmitting: boolean;
  onSubmit: (values: IssueTokenFormValues) => Promise<void>;
};

export function TokenIssuePanel({
  facilities,
  organizationId,
  defaultFacilityId = "",
  issuedToken,
  isSubmitting,
  onSubmit,
}: TokenIssuePanelProps) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const form = useForm<IssueTokenFormValues>({
    resolver: zodResolver(issueTokenSchema),
    defaultValues: { facility_id: defaultFacilityId, patient_id: "", appointment_id: "", expires_at: "" },
  });
  const fieldErrors = form.formState.errors;
  const facilityId = useWatch({ control: form.control, name: "facility_id" });
  const appointmentsQuery = useAppointmentsQuery(
    { facility_id: facilityId || undefined, patient_id: selectedPatientId || undefined },
    { enabled: Boolean(selectedPatientId && facilityId) },
  );

  return (
    <div className="space-y-4">
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
          <TextInputField
            label="Expires at"
            type="datetime-local"
            helperText="Optional. Leave blank to use the backend default token lifetime."
            error={fieldErrors.expires_at?.message}
            {...form.register("expires_at")}
          />
        </div>
        <PatientSearchSelect
          organizationId={organizationId}
          facilityId={facilityId}
          value={selectedPatientId}
          onChange={(patientId) => {
            setSelectedPatientId(patientId);
            form.setValue("patient_id", patientId, { shouldValidate: true });
            form.setValue("appointment_id", "");
          }}
        />
        <SelectField
          label="Appointment"
          required
        options={[
          { label: "Select appointment", value: "" },
          ...(appointmentsQuery.data ?? []).map((appointment) => ({
            label: `${appointment.appointment_number} · ${appointment.specialty_name} · ${appointment.status}`,
            value: appointment.id,
          })),
        ]}
          disabled={!selectedPatientId}
          error={fieldErrors.appointment_id?.message}
          helperText="The raw token is shown only once immediately after issue."
          {...form.register("appointment_id")}
        />
        <SubmitButton label="Issue QR token" loadingLabel="Issuing token..." isLoading={isSubmitting} />
      </form>
      {issuedToken?.raw_token ? (
        <div className="rounded-xl border border-primary/15 bg-secondary/50 p-4">
          <p className="text-sm font-semibold text-foreground">Issued token</p>
          <p className="mt-2 break-all rounded-lg bg-card px-3 py-3 font-mono text-sm text-foreground">{issuedToken.raw_token}</p>
          <p className="mt-2 text-xs text-muted-foreground">Copy or scan this token now. The raw token is not stored and will not appear again after refresh.</p>
        </div>
      ) : null}
    </div>
  );
}
