"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { departmentAssignmentSchema, type DepartmentAssignmentFormValues } from "../schemas/practitioner.schemas";
import type { DepartmentLookupRecord } from "../types/practitioner.types";

type PractitionerDepartmentAssignmentFormProps = {
  departments: DepartmentLookupRecord[];
  isSubmitting?: boolean;
  onSubmit: (values: DepartmentAssignmentFormValues) => Promise<void>;
};

export function PractitionerDepartmentAssignmentForm({ departments, isSubmitting = false, onSubmit }: PractitionerDepartmentAssignmentFormProps) {
  const form = useForm<DepartmentAssignmentFormValues>({
    resolver: zodResolver(departmentAssignmentSchema),
    defaultValues: { department_id: "", starts_on: "", ends_on: "", is_primary: false },
  });
  const errors = form.formState.errors;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => { await onSubmit(values); form.reset(); })}>
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Department" options={[{ label: "Select department", value: "" }, ...departments.map((department) => ({ label: department.name, value: department.id }))]} error={errors.department_id?.message} {...form.register("department_id")} />
        <TextInputField label="Starts on" type="date" error={errors.starts_on?.message} {...form.register("starts_on")} />
        <TextInputField label="Ends on" type="date" error={errors.ends_on?.message} {...form.register("ends_on")} />
        <label className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-3 text-sm text-foreground">
          <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_primary")} />
          <span>Primary department assignment</span>
        </label>
      </div>
      <SubmitButton label="Add department assignment" loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
