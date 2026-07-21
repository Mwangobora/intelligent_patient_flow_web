"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import { facilitySpecialtySchema, specialtySchema } from "../schemas/facility.schemas";
import type { DepartmentRecord, SpecialtyRecord } from "../types/facility.types";
import { cleanPayload } from "./facility-formatters";

type Payload = Record<string, string | number | boolean | null>;

export function SpecialtyForm({
  specialties,
  isSubmitting,
  onSubmit,
}: {
  specialties: SpecialtyRecord[];
  isSubmitting: boolean;
  onSubmit: (payload: Payload) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({ name: "", parent_specialty_id: "", description: "" });
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      const parsed = specialtySchema.safeParse(values);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the specialty form.");
      await onSubmit(cleanPayload(parsed.data));
      setValues({ name: "", parent_specialty_id: "", description: "" });
    }}>
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="Specialty name" required value={values.name} onChange={(event) => update("name", event.target.value)} />
        <SelectField label="Parent specialty" value={values.parent_specialty_id} onChange={(event) => update("parent_specialty_id", event.target.value)} options={[{ label: "No parent", value: "" }, ...specialties.map((item) => ({ label: item.name, value: item.id }))]} />
        <TextareaField label="Description" value={values.description} onChange={(event) => update("description", event.target.value)} />
      </div>
      <SubmitButton label="Create specialty" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}

export function FacilitySpecialtyForm({
  departments,
  specialties,
  isSubmitting,
  onSubmit,
}: {
  departments: DepartmentRecord[];
  specialties: SpecialtyRecord[];
  isSubmitting: boolean;
  onSubmit: (payload: Payload) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    specialty_id: "",
    department_id: "",
    appointment_duration_minutes: 15,
    accepts_appointments: true,
    accepts_walk_ins: true,
    requires_referral: false,
  });
  const update = (key: keyof typeof values, value: string | number | boolean) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      const parsed = facilitySpecialtySchema.safeParse(values);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the facility specialty form.");
      await onSubmit(cleanPayload(parsed.data));
      setValues({ specialty_id: "", department_id: "", appointment_duration_minutes: 15, accepts_appointments: true, accepts_walk_ins: true, requires_referral: false });
    }}>
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField label="Specialty" required value={values.specialty_id} onChange={(event) => update("specialty_id", event.target.value)} options={[{ label: "Select specialty", value: "" }, ...specialties.map((item) => ({ label: item.name, value: item.id }))]} />
        <SelectField label="Department" value={values.department_id} onChange={(event) => update("department_id", event.target.value)} options={[{ label: "No department", value: "" }, ...departments.map((item) => ({ label: item.name, value: item.id }))]} />
        <TextInputField label="Appointment duration" type="number" min={1} value={values.appointment_duration_minutes} onChange={(event) => update("appointment_duration_minutes", Number(event.target.value))} />
        {(["accepts_appointments", "accepts_walk_ins", "requires_referral"] as const).map((key) => (
          <label key={key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm capitalize">
            <input type="checkbox" checked={Boolean(values[key])} onChange={(event) => update(key, event.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" />
            {key.replaceAll("_", " ")}
          </label>
        ))}
      </div>
      <SubmitButton label="Add facility specialty" loadingLabel="Adding..." isLoading={isSubmitting} />
    </form>
  );
}
