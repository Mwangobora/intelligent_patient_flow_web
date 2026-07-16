"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import {
  queueCreateSchema,
} from "../schemas/queue.schemas";
import type {
  FacilitySpecialtyLookupRecord,
  QueueCreatePayload,
  ServicePointLookupRecord,
} from "../types/queue.types";

type QueueCreateFormProps = {
  servicePoints: ServicePointLookupRecord[];
  specialties: FacilitySpecialtyLookupRecord[];
  defaultDate: string;
  isSubmitting: boolean;
  onSubmit: (payload: QueueCreatePayload) => Promise<void>;
};

export function QueueCreateForm({
  servicePoints,
  specialties,
  defaultDate,
  isSubmitting,
  onSubmit,
}: QueueCreateFormProps) {
  const [formValues, setFormValues] = useState({
    service_point_id: "",
    facility_specialty_id: "",
    queue_date: defaultDate,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const parsed = queueCreateSchema.safeParse(formValues);
  const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const validation = queueCreateSchema.safeParse(formValues);
    if (!validation.success) {
      setFormError("Please correct the highlighted queue form fields.");
      return;
    }
    try {
      await onSubmit({
        service_point_id: validation.data.service_point_id,
        facility_specialty_id: validation.data.facility_specialty_id || null,
        queue_date: validation.data.queue_date,
      });
      setFormValues((current) => ({
        ...current,
        facility_specialty_id: "",
      }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create queue.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormErrorAlert message={formError} />
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField
          label="Service point"
          required
          options={[
            { label: "Select service point", value: "" },
            ...servicePoints.map((point) => ({
              label: `${point.name} (${point.code})`,
              value: point.id,
            })),
          ]}
          value={formValues.service_point_id}
          error={fieldErrors.service_point_id?.[0]}
          helperText={
            servicePoints.length
              ? "Choose the front desk, triage desk, or service point for this queue."
              : "No active service points are available for this facility."
          }
          onChange={(event) => setFormValues((current) => ({ ...current, service_point_id: event.target.value }))}
        />
        <SelectField
          label="Specialty queue"
          options={[
            { label: "General queue", value: "" },
            ...specialties.map((specialty) => ({
              label: specialty.specialty_name,
              value: specialty.id,
            })),
          ]}
          value={formValues.facility_specialty_id}
          error={fieldErrors.facility_specialty_id?.[0]}
          helperText={
            specialties.length
              ? "Optional. Leave as General queue if this queue is not specialty-specific."
              : "No active facility specialties are available, so only a general queue can be created."
          }
          onChange={(event) => setFormValues((current) => ({ ...current, facility_specialty_id: event.target.value }))}
        />
        <TextInputField
          label="Queue date"
          type="date"
          required
          value={formValues.queue_date}
          error={fieldErrors.queue_date?.[0]}
          onChange={(event) => setFormValues((current) => ({ ...current, queue_date: event.target.value }))}
        />
      </div>
      <SubmitButton
        label="Create queue"
        loadingLabel="Creating queue..."
        isLoading={isSubmitting}
      />
    </form>
  );
}
