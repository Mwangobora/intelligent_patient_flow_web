"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import { practitionerTypeSchema, type PractitionerTypeFormValues } from "../schemas/practitioner.schemas";

type PractitionerTypeFormProps = {
  isSubmitting?: boolean;
  onSubmit: (values: PractitionerTypeFormValues) => Promise<void>;
};

export function PractitionerTypeForm({ isSubmitting = false, onSubmit }: PractitionerTypeFormProps) {
  const form = useForm<PractitionerTypeFormValues>({
    resolver: zodResolver(practitionerTypeSchema),
    defaultValues: { name: "", description: "", requires_license: false },
  });

  const errors = form.formState.errors;

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
        form.reset();
      })}
    >
      <FormErrorAlert message={errors.root?.message} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInputField label="Type name" error={errors.name?.message} {...form.register("name")} />
      </div>
      <TextareaField label="Description" rows={3} error={errors.description?.message} {...form.register("description")} />
      <label className="flex items-center gap-3 rounded-md border border-border bg-secondary/30 px-3 py-3 text-sm text-foreground">
        <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("requires_license")} />
        <span>Requires license</span>
      </label>
      <SubmitButton label="Create practitioner type" loadingLabel="Saving..." isLoading={isSubmitting} />
    </form>
  );
}
