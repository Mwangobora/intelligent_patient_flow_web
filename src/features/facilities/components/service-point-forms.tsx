"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { consultationRoomSchema, servicePointSchema } from "../schemas/facility.schemas";
import type { DepartmentRecord, ServicePointTypeRecord } from "../types/facility.types";
import { cleanPayload } from "./facility-formatters";

type Payload = Record<string, string | number | null>;

export function ServicePointForm({
  departments,
  servicePointTypes,
  isSubmitting,
  onSubmit,
}: {
  departments: DepartmentRecord[];
  servicePointTypes: ServicePointTypeRecord[];
  isSubmitting: boolean;
  onSubmit: (payload: Payload) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({ service_point_type_id: "", department_id: "", name: "", code: "", location_description: "", floor: "", display_order: 0 });
  const update = (key: keyof typeof values, value: string | number) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      const parsed = servicePointSchema.safeParse(values);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the service point form.");
      await onSubmit(cleanPayload(parsed.data));
      setValues({ service_point_type_id: "", department_id: "", name: "", code: "", location_description: "", floor: "", display_order: 0 });
    }}>
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField label="Service point type" required value={values.service_point_type_id} onChange={(event) => update("service_point_type_id", event.target.value)} options={[{ label: "Select type", value: "" }, ...servicePointTypes.map((item) => ({ label: item.name, value: item.id }))]} />
        <SelectField label="Department" value={values.department_id} onChange={(event) => update("department_id", event.target.value)} options={[{ label: "No department", value: "" }, ...departments.map((item) => ({ label: item.name, value: item.id }))]} />
        <TextInputField label="Service point name" required value={values.name} onChange={(event) => update("name", event.target.value)} />
        <TextInputField label="Manual code" value={values.code} onChange={(event) => update("code", event.target.value)} />
        <TextInputField label="Location" value={values.location_description} onChange={(event) => update("location_description", event.target.value)} />
        <TextInputField label="Floor" value={values.floor} onChange={(event) => update("floor", event.target.value)} />
        <TextInputField label="Display order" type="number" min={0} value={values.display_order} onChange={(event) => update("display_order", Number(event.target.value))} />
      </div>
      <SubmitButton label="Create service point" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}

export function ConsultationRoomForm({
  departments,
  isSubmitting,
  onSubmit,
}: {
  departments: DepartmentRecord[];
  isSubmitting: boolean;
  onSubmit: (payload: Payload) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({ department_id: "", name: "", code: "", location_description: "", floor: "", capacity: 1 });
  const update = (key: keyof typeof values, value: string | number) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setError("");
      const parsed = consultationRoomSchema.safeParse(values);
      if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check the room form.");
      await onSubmit(cleanPayload(parsed.data));
      setValues({ department_id: "", name: "", code: "", location_description: "", floor: "", capacity: 1 });
    }}>
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField label="Department" value={values.department_id} onChange={(event) => update("department_id", event.target.value)} options={[{ label: "No department", value: "" }, ...departments.map((item) => ({ label: item.name, value: item.id }))]} />
        <TextInputField label="Room name" required value={values.name} onChange={(event) => update("name", event.target.value)} />
        <TextInputField label="Manual code" value={values.code} onChange={(event) => update("code", event.target.value)} />
        <TextInputField label="Capacity" type="number" min={1} value={values.capacity} onChange={(event) => update("capacity", Number(event.target.value))} />
        <TextInputField label="Location" value={values.location_description} onChange={(event) => update("location_description", event.target.value)} />
        <TextInputField label="Floor" value={values.floor} onChange={(event) => update("floor", event.target.value)} />
      </div>
      <SubmitButton label="Create room" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}
