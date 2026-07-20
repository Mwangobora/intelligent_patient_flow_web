"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { operatingHourSchema, scheduleExceptionSchema } from "../schemas/facility.schemas";
import { dayNames, cleanPayload } from "./facility-formatters";

type Payload = Record<string, string | number | boolean | null>;

export function OperatingHourForm({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean;
  onSubmit: (payload: Payload) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({ day_of_week: 1, period_order: 1, opens_at: "08:00", closes_at: "17:00", closes_next_day: false, is_24_hours: false });
  const update = (key: keyof typeof values, value: string | number | boolean) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      const parsed = operatingHourSchema.safeParse(values);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check operating hours.");
      await onSubmit(cleanPayload(parsed.data));
    }}>
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField label="Day" value={String(values.day_of_week)} onChange={(event) => update("day_of_week", Number(event.target.value))} options={Object.entries(dayNames).map(([value, label]) => ({ value, label }))} />
        <TextInputField label="Period order" type="number" min={1} value={values.period_order} onChange={(event) => update("period_order", Number(event.target.value))} />
        <TextInputField label="Opens at" type="time" value={values.opens_at} onChange={(event) => update("opens_at", event.target.value)} />
        <TextInputField label="Closes at" type="time" value={values.closes_at} onChange={(event) => update("closes_at", event.target.value)} />
        <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm">
          <input type="checkbox" checked={values.is_24_hours} onChange={(event) => update("is_24_hours", event.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" />
          Open 24 hours
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm">
          <input type="checkbox" checked={values.closes_next_day} onChange={(event) => update("closes_next_day", event.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" />
          Closes next day
        </label>
      </div>
      <SubmitButton label="Add operating hours" loadingLabel="Adding..." isLoading={isSubmitting} />
    </form>
  );
}

export function ScheduleExceptionForm({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean;
  onSubmit: (payload: Payload) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({ exception_date: "", period_order: 1, is_closed: true, opens_at: "", closes_at: "", closes_next_day: false, is_24_hours: false, reason: "" });
  const update = (key: keyof typeof values, value: string | number | boolean) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      const parsed = scheduleExceptionSchema.safeParse(values);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check schedule exception.");
      await onSubmit(cleanPayload(parsed.data));
    }}>
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="Date" required type="date" value={values.exception_date} onChange={(event) => update("exception_date", event.target.value)} />
        <TextInputField label="Period order" type="number" min={1} value={values.period_order} onChange={(event) => update("period_order", Number(event.target.value))} />
        <TextInputField label="Opens at" type="time" value={values.opens_at} onChange={(event) => update("opens_at", event.target.value)} />
        <TextInputField label="Closes at" type="time" value={values.closes_at} onChange={(event) => update("closes_at", event.target.value)} />
        {(["is_closed", "is_24_hours", "closes_next_day"] as const).map((key) => (
          <label key={key} className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm capitalize">
            <input type="checkbox" checked={Boolean(values[key])} onChange={(event) => update(key, event.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" />
            {key.replaceAll("_", " ")}
          </label>
        ))}
        <TextInputField label="Reason" value={values.reason} onChange={(event) => update("reason", event.target.value)} />
      </div>
      <SubmitButton label="Add schedule exception" loadingLabel="Adding..." isLoading={isSubmitting} />
    </form>
  );
}
