"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";
import type { ApiError } from "@/lib/api/api-error";
import type { SelectOption } from "@/types/common";

import { appointmentCreateSchema, appointmentRescheduleSchema, type AppointmentCreateFormValues, type AppointmentRescheduleFormValues } from "../schemas/appointment.schemas";
import { useCreateAppointmentMutation, useRescheduleAppointmentMutation } from "../hooks/use-appointment-mutations";
import { useAvailableAppointmentSlotsQuery, useFacilitiesLookupQuery, useFacilitySpecialtiesQuery } from "../hooks/use-appointment-queries";
import { PatientSearchSelect } from "./patient-search-select";
import { PractitionerSearchSelect } from "./practitioner-search-select";
import { SlotPicker } from "./slot-picker";
import type { AppointmentRecord, BookingChannel } from "../types/appointment.types";

type AppointmentFormProps = {
  mode: "create" | "reschedule";
  organizationId: string;
  defaultFacilityId?: string;
  appointment?: AppointmentRecord;
};

function buildDayRange(date: string) {
  return {
    starts_from: new Date(`${date}T00:00:00`).toISOString(),
    ends_to: new Date(`${date}T23:59:59`).toISOString(),
  };
}

const bookingChannelOptions: SelectOption[] = [
  { label: "Reception", value: "reception" },
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "API", value: "api" },
];

export function AppointmentForm({
  mode,
  organizationId,
  defaultFacilityId,
  appointment,
}: AppointmentFormProps) {
  const router = useRouter();
  const facilitiesQuery = useFacilitiesLookupQuery({ organization_id: organizationId, is_active: true });
  const createMutation = useCreateAppointmentMutation();
  const rescheduleMutation = useRescheduleAppointmentMutation(appointment?.id);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<AppointmentCreateFormValues | AppointmentRescheduleFormValues>({
    resolver: zodResolver(mode === "create" ? appointmentCreateSchema : appointmentRescheduleSchema),
    defaultValues: mode === "create"
      ? {
          facility_id: defaultFacilityId ?? "",
          patient_id: "",
          facility_specialty_id: "",
          appointment_date: "",
          appointment_slot_id: "",
          booking_channel: "reception",
          practitioner_id: "",
          reason_for_visit: "",
        }
      : {
          facility_specialty_id: appointment?.facility_specialty ?? "",
          appointment_date: appointment ? appointment.scheduled_start.slice(0, 10) : "",
          appointment_slot_id: "",
          booking_channel: appointment?.booking_channel ?? "reception",
          practitioner_id: "",
          reason_for_visit: "",
        },
  });

  const facilityId = useWatch({ control: form.control, name: "facility_id" as never }) as string | undefined;
  const facilitySpecialtyId = useWatch({ control: form.control, name: "facility_specialty_id" as never }) as string | undefined;
  const appointmentDate = useWatch({ control: form.control, name: "appointment_date" }) as string | undefined;
  const practitionerId = useWatch({ control: form.control, name: "practitioner_id" }) as string | undefined;
  const patientId = useWatch({ control: form.control, name: "patient_id" as never }) as string | undefined;
  const selectedSlotId = useWatch({ control: form.control, name: "appointment_slot_id" as never }) as string | undefined;
  const hasPatient = mode === "reschedule" || Boolean(patientId);
  const hasFacility = mode === "reschedule" || Boolean(facilityId);
  const hasService = mode === "reschedule" || Boolean(facilitySpecialtyId);
  const hasDate = Boolean(appointmentDate);

  const specialtiesQuery = useFacilitySpecialtiesQuery(
    { facility_id: mode === "create" ? facilityId : appointment?.facility, is_active: true },
    { enabled: Boolean(mode === "create" ? facilityId : appointment?.facility) },
  );

  const slotsQuery = useAvailableAppointmentSlotsQuery(
    {
      facility_id: mode === "create" ? facilityId : appointment?.facility,
      facility_specialty_id: mode === "create" ? facilitySpecialtyId : appointment?.facility_specialty,
      practitioner_id: practitionerId || undefined,
      ...buildDayRange(appointmentDate || new Date().toISOString().slice(0, 10)),
      only_available: true,
    },
    {
      enabled: Boolean(
        appointmentDate && (mode === "create" ? facilityId && facilitySpecialtyId : appointment?.facility_specialty),
      ),
    },
  );

  useEffect(() => {
    form.setValue("appointment_slot_id", "" as never);
  }, [appointmentDate, facilitySpecialtyId, practitionerId, form]);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }
    form.setValue("facility_specialty_id", "" as never);
    form.setValue("practitioner_id", "" as never);
    form.setValue("appointment_slot_id", "" as never);
  }, [facilityId, form, mode]);

  const facilityOptions = useMemo<SelectOption[]>(
    () => [
      { label: "Select facility", value: "" },
      ...(facilitiesQuery.data ?? []).map((facility) => ({
        label: facility.name,
        value: facility.id,
      })),
    ],
    [facilitiesQuery.data],
  );

  const specialtyOptions = useMemo<SelectOption[]>(
    () => [
      { label: "Select service", value: "" },
      ...(specialtiesQuery.data ?? []).map((specialty) => ({
        label: specialty.specialty_name,
        value: specialty.id,
      })),
    ],
    [specialtiesQuery.data],
  );
  const fieldErrors = form.formState.errors as Partial<Record<string, { message?: string }>>;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    const selectedSlot = slotsQuery.data?.find((slot) => slot.id === values.appointment_slot_id);
    if (!selectedSlot) {
      setFormError("Please choose an available appointment slot.");
      return;
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          facility_id: (values as AppointmentCreateFormValues).facility_id,
          patient_id: (values as AppointmentCreateFormValues).patient_id,
          facility_specialty_id: (values as AppointmentCreateFormValues).facility_specialty_id,
          appointment_slot_id: selectedSlot.id,
          scheduled_start: selectedSlot.starts_at,
          scheduled_end: selectedSlot.ends_at,
          booking_channel: values.booking_channel as BookingChannel,
          reason_for_visit: values.reason_for_visit || null,
        });
        router.push("/appointments");
        return;
      }

      const rescheduled = await rescheduleMutation.mutateAsync({
        appointment_slot_id: selectedSlot.id,
        scheduled_start: selectedSlot.starts_at,
        scheduled_end: selectedSlot.ends_at,
        booking_channel: values.booking_channel as BookingChannel,
        reason_for_visit: values.reason_for_visit || null,
      });
      router.push(`/appointments/${rescheduled.id}`);
    } catch (error) {
      setFormError((error as ApiError).message ?? "Could not save the appointment.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormErrorAlert message={formError} />
      {mode === "create" ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step 1</p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Search and select patient</h3>
          <p className="mt-1 text-sm text-muted-foreground">Start the staff-side booking flow by selecting the patient record first.</p>
          <div className="mt-4">
            <PatientSearchSelect
              organizationId={organizationId}
              facilityId={facilityId}
              value={patientId}
              onChange={(patientId) => form.setValue("patient_id", patientId as never, { shouldValidate: true })}
            />
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {mode === "create" ? "Step 2" : "Step 1"}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Choose facility and specialty</h3>
        <p className="mt-1 text-sm text-muted-foreground">Select the hospital location and the service being booked.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {mode === "create" ? (
            <SelectField
              label="Facility"
              options={facilityOptions}
              helperText={
                !hasPatient
                  ? "Select the patient first to continue the guided booking flow."
                  : facilitiesQuery.isLoading
                  ? "Loading facilities..."
                  : facilityOptions.length > 1
                    ? "Choose the facility for this booking."
                    : "No active facilities available for this organization."
              }
              error={fieldErrors.facility_id?.message}
              disabled={!hasPatient}
              {...form.register("facility_id" as never)}
            />
          ) : null}
          <SelectField
            label="Service"
            options={specialtyOptions}
            disabled={mode === "create" ? !facilityId : !appointment?.facility}
            helperText={
              mode === "create" && !facilityId
                ? "Select a facility first."
                : specialtiesQuery.isLoading
                  ? "Loading services..."
                  : specialtyOptions.length > 1
                    ? "Choose the service or specialty for this appointment."
                    : "No active services available for the selected facility."
            }
            error={fieldErrors.facility_specialty_id?.message}
            {...form.register("facility_specialty_id" as never)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {mode === "create" ? "Step 3" : "Step 2"}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Select date and available slot</h3>
        <p className="mt-1 text-sm text-muted-foreground">Pick a date, optionally narrow to a practitioner, then choose a live backend slot.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <PractitionerSearchSelect
            organizationId={organizationId}
            facilityId={mode === "create" ? facilityId : appointment?.facility}
            value={practitionerId}
            onChange={(id) => form.setValue("practitioner_id", id as never)}
          />
          <TextInputField
            label="Appointment date"
            type="date"
            helperText={
              !hasFacility
                ? "Select the facility first."
                : !hasService
                  ? "Select the specialty first."
                  : "Available slots load for the chosen day."
            }
            error={fieldErrors.appointment_date?.message}
            {...form.register("appointment_date")}
          />
        </div>
        <div className="mt-4">
          {!hasFacility || !hasService || !hasDate ? (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-6 text-sm text-muted-foreground">
              {!hasFacility
                ? "Select the facility to load available slots."
                : !hasService
                  ? "Select the specialty to load available slots."
                  : "Choose an appointment date to load live available slots."}
            </div>
          ) : (
            <SlotPicker
              slots={slotsQuery.data ?? []}
              selectedSlotId={selectedSlotId}
              isLoading={slotsQuery.isLoading}
              onSelect={(slot) => form.setValue("appointment_slot_id", slot.id as never, { shouldValidate: true })}
            />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {mode === "create" ? "Step 4" : "Step 3"}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">Confirm booking</h3>
        <p className="mt-1 text-sm text-muted-foreground">Review the booking channel, add optional notes, and save the appointment.</p>
        <div className="mt-4 space-y-4">
          <SelectField label="Booking channel" options={bookingChannelOptions} error={fieldErrors.booking_channel?.message} {...form.register("booking_channel")} />
          <TextareaField label="Reason for visit" placeholder="Optional notes for the service team" error={fieldErrors.reason_for_visit?.message} {...form.register("reason_for_visit")} />
        </div>
      </div>
      <SubmitButton label={mode === "create" ? "Book appointment" : "Reschedule appointment"} loadingLabel="Saving..." isLoading={mode === "create" ? createMutation.isPending : rescheduleMutation.isPending} />
    </form>
  );
}
