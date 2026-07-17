"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import { relatedPersonContactSchema } from "../schemas/patient.schemas";

type RelatedPersonContactValues = z.input<typeof relatedPersonContactSchema>;

type RelatedPersonContactFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: RelatedPersonContactValues) => Promise<void>;
};

export function RelatedPersonContactForm({
  isSubmitting,
  onSubmit,
}: RelatedPersonContactFormProps) {
  const form = useForm<RelatedPersonContactValues>({
    resolver: zodResolver(relatedPersonContactSchema),
    defaultValues: {
      channel: "phone",
      value: "",
      label: "",
      is_primary: true,
    },
  });
  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
      <SelectField
        label="Channel"
        options={[
          { label: "Phone", value: "phone" },
          { label: "Email", value: "email" },
        ]}
        error={errors.channel?.message}
        {...form.register("channel")}
      />
      <TextInputField label="Label" error={errors.label?.message} {...form.register("label")} />
      <TextInputField label="Value" required error={errors.value?.message} {...form.register("value")} />
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
        <input className="h-4 w-4 cursor-pointer" type="checkbox" {...form.register("is_primary")} />
        Set as primary contact
      </label>
      <div className="lg:col-span-2">
        <SubmitButton label="Add contact" loadingLabel="Adding contact..." isLoading={isSubmitting} />
      </div>
    </form>
  );
}
