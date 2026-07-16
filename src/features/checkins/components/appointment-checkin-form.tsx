"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextareaField } from "@/components/forms/textarea-field";
import { useAppointmentsQuery, usePatientsLookupQuery } from "@/features/appointments/hooks/use-appointment-queries";
import { PatientSearchSelect } from "@/features/appointments/components/patient-search-select";

import { appointmentCheckinSchema, type AppointmentCheckinFormValues } from "../schemas/checkin.schemas";
import type { FacilityLookupRecord } from "@/features/appointments/types/appointment.types";

type AppointmentCheckinFormProps = {
  facilities: FacilityLookupRecord[];
  defaultFacilityId?: string;
  organizationId?: string;
  isSubmitting: boolean;
  onSubmit: (values: AppointmentCheckinFormValues) => Promise<void>;
};

const checkinMethodOptions = [
  { label: "Reception", value: "reception" },
  { label: "Mobile", value: "mobile" },
  { label: "QR code", value: "qr_code" },
  { label: "Self service", value: "self_service" },
];

export function AppointmentCheckinForm({
  facilities,
  defaultFacilityId = "",
  organizationId,
  isSubmitting,
  onSubmit,
}: AppointmentCheckinFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const form = useForm<AppointmentCheckinFormValues>({
    resolver: zodResolver(appointmentCheckinSchema),
    defaultValues: {
      facility_id: defaultFacilityId,
      patient_id: "",
      appointment_id: "",
      checkin_method: "reception",
      notes: "",
    },
  });

  const facilityId = useWatch({ control: form.control, name: "facility_id" });
  const patientsQuery = usePatientsLookupQuery(
    { organization_id: organizationId, registered_facility_id: facilityId || undefined, is_active: true },
    { enabled: Boolean(organizationId && facilityId) },
  );
  const appointmentsQuery = useAppointmentsQuery(
    { facility_id: facilityId || undefined, patient_id: selectedPatientId || undefined },
    { enabled: Boolean(selectedPatientId && facilityId) },
  );

  const patientNameById = useMemo(
    () => Object.fromEntries((patientsQuery.data ?? []).map((patient) => [patient.id, `${patient.first_name} ${patient.last_name}`.trim()])),
    [patientsQuery.data],
  );
  const fieldErrors = form.formState.errors;

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
          form.setValue("appointment_id", "");
        }}
      />
      <SelectField
        label="Appointment"
        required
        options={[
          { label: "Select appointment", value: "" },
          ...(appointmentsQuery.data ?? []).map((appointment) => ({
            label: `${appointment.appointment_number} · ${appointment.specialty_name} · ${patientNameById[appointment.patient] ?? "Patient"}`,
            value: appointment.id,
          })),
        ]}
        helperText={
          selectedPatientId
            ? "Only real backend appointments for the selected patient are shown."
            : "Select a patient first."
        }
        error={fieldErrors.appointment_id?.message}
        disabled={!selectedPatientId}
        {...form.register("appointment_id")}
      />
      <TextareaField label="Notes" rows={3} error={fieldErrors.notes?.message} {...form.register("notes")} />
      <SubmitButton label="Check in appointment" loadingLabel="Checking in..." isLoading={isSubmitting} />
    </form>
  );
}
