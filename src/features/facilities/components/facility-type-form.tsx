"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import { facilityTypeSchema } from "../schemas/facility.schemas";
import { cleanPayload } from "./facility-formatters";

type FacilityTypeFormProps = {
  isSubmitting: boolean;
  onSubmit: (payload: Record<string, string | null>) => Promise<void>;
};

export function FacilityTypeForm({ isSubmitting, onSubmit }: FacilityTypeFormProps) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({ name: "", description: "" });
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const parsed = facilityTypeSchema.safeParse(values);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Please check the facility type form.");
          return;
        }
        await onSubmit(cleanPayload(parsed.data));
        setValues({ name: "", description: "" });
      }}
    >
      <FormErrorAlert message={error} />
      <TextInputField label="Facility type name" required value={values.name} onChange={(event) => update("name", event.target.value)} />
      <TextareaField label="Description" value={values.description} onChange={(event) => update("description", event.target.value)} />
      <SubmitButton label="Create facility type" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}
