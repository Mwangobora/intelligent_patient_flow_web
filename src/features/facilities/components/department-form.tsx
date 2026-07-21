"use client";

import { useState } from "react";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import { departmentSchema } from "../schemas/facility.schemas";
import type { DepartmentRecord } from "../types/facility.types";
import { cleanPayload } from "./facility-formatters";

type DepartmentFormProps = {
  departments: DepartmentRecord[];
  isSubmitting: boolean;
  onSubmit: (payload: Record<string, string | null>) => Promise<void>;
};

export function DepartmentForm({ departments, isSubmitting, onSubmit }: DepartmentFormProps) {
  const [error, setError] = useState("");
  const [values, setValues] = useState({ name: "", parent_department_id: "", description: "" });
  const update = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const parsed = departmentSchema.safeParse(values);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Please check the department form.");
          return;
        }
        await onSubmit(cleanPayload(parsed.data));
        setValues({ name: "", parent_department_id: "", description: "" });
      }}
    >
      <FormErrorAlert message={error} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="Department name" required value={values.name} onChange={(event) => update("name", event.target.value)} />
        <SelectField
          label="Parent department"
          value={values.parent_department_id}
          onChange={(event) => update("parent_department_id", event.target.value)}
          options={[{ label: "No parent", value: "" }, ...departments.map((item) => ({ label: item.name, value: item.id }))]}
        />
        <TextareaField label="Description" value={values.description} onChange={(event) => update("description", event.target.value)} />
      </div>
      <SubmitButton label="Create department" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}
