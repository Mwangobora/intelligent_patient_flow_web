"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
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
        <PatientSearchSelect
          organizationId={organizationId}
          facilityId={facilityId}
          value={patientId}
          onChange={(patientId) => form.setValue("patient_id", patientId as never, { shouldValidate: true })}
        />
      ) : null}
      {mode === "create" ? (
        <SelectField
          label="Facility"
          options={facilityOptions}
          helperText={
            facilitiesQuery.isLoading
              ? "Loading facilities..."
              : facilityOptions.length > 1
                ? "Choose the facility for this booking."
                : "No active facilities available for this organization."
          }
          error={fieldErrors.facility_id?.message}
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
      <PractitionerSearchSelect
        organizationId={organizationId}
        facilityId={mode === "create" ? facilityId : appointment?.facility}
        value={practitionerId}
        onChange={(id) => form.setValue("practitioner_id", id as never)}
      />
      <SelectField label="Booking channel" options={bookingChannelOptions} error={fieldErrors.booking_channel?.message} {...form.register("booking_channel")} />
      <input type="date" className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" {...form.register("appointment_date")} />
      <SlotPicker
        slots={slotsQuery.data ?? []}
        selectedSlotId={useWatch({ control: form.control, name: "appointment_slot_id" as never }) as string | undefined}
        isLoading={slotsQuery.isLoading}
        onSelect={(slot) => form.setValue("appointment_slot_id", slot.id as never, { shouldValidate: true })}
      />
      <TextareaField label="Reason for visit" placeholder="Optional notes for the service team" error={fieldErrors.reason_for_visit?.message} {...form.register("reason_for_visit")} />
      <SubmitButton label={mode === "create" ? "Book appointment" : "Reschedule appointment"} loadingLabel="Saving..." isLoading={mode === "create" ? createMutation.isPending : rescheduleMutation.isPending} />
    </form>
  );
}
