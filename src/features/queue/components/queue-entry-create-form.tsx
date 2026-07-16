"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextareaField } from "@/components/forms/textarea-field";

import {
  queueEntryCreateSchema,
} from "../schemas/queue.schemas";
import type {
  CheckinLookupRecord,
  QueueEntryCreatePayload,
} from "../types/queue.types";

type QueueEntryCreateFormProps = {
  queueId: string;
  checkins: CheckinLookupRecord[];
  isSubmitting: boolean;
  onSubmit: (payload: QueueEntryCreatePayload) => Promise<void>;
};

export function QueueEntryCreateForm({
  queueId,
  checkins,
  isSubmitting,
  onSubmit,
}: QueueEntryCreateFormProps) {
  const [formValues, setFormValues] = useState({
    patient_checkin_id: "",
    priority_level: "0",
    priority_reason: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const priorityLevel = Number(formValues.priority_level);
  const parsed = queueEntryCreateSchema.safeParse({
    ...formValues,
    priority_level: Number(formValues.priority_level),
  });
  const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const validation = queueEntryCreateSchema.safeParse({
      ...formValues,
      priority_level: Number(formValues.priority_level),
    });
    if (!validation.success) {
      setFormError("Please correct the highlighted queue entry fields.");
      return;
    }
    try {
      await onSubmit({
        queue_id: queueId,
        patient_checkin_id: validation.data.patient_checkin_id,
        priority_level: validation.data.priority_level as 0 | 1 | 2 | 3,
        priority_reason: validation.data.priority_reason || null,
      });
      setFormValues({
        patient_checkin_id: "",
        priority_level: "0",
        priority_reason: "",
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to add patient to queue.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormErrorAlert message={formError} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField
          label="Checked-in patient"
          required
          options={[
            { label: "Select active check-in", value: "" },
            ...checkins.map((checkin) => ({
              label: `${checkin.patient_name} (${checkin.patient_number})`,
              value: checkin.id,
            })),
          ]}
          value={formValues.patient_checkin_id}
          error={fieldErrors.patient_checkin_id?.[0]}
          helperText={
            checkins.length
              ? "Only active, non-voided check-ins are listed here."
              : "No active check-ins are available for this queue right now."
          }
          onChange={(event) => setFormValues((current) => ({ ...current, patient_checkin_id: event.target.value }))}
        />
        <SelectField
          label="Priority level"
          options={[
            { label: "Normal", value: "0" },
            { label: "Priority", value: "1" },
            { label: "Urgent", value: "2" },
            { label: "Emergency", value: "3" },
          ]}
          value={formValues.priority_level}
          error={fieldErrors.priority_level?.[0]}
          onChange={(event) => setFormValues((current) => ({ ...current, priority_level: event.target.value }))}
        />
      </div>
      {priorityLevel > 0 ? (
        <TextareaField
          label="Priority reason"
          required
          rows={3}
          value={formValues.priority_reason}
          error={fieldErrors.priority_reason?.[0]}
          onChange={(event) => setFormValues((current) => ({ ...current, priority_reason: event.target.value }))}
        />
      ) : null}
      <SubmitButton
        label="Add to queue"
        loadingLabel="Adding patient..."
        isLoading={isSubmitting}
      />
    </form>
  );
}
