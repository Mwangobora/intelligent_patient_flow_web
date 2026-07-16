"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ScanLine } from "lucide-react";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import { consumeTokenSchema, type ConsumeTokenFormValues } from "../schemas/checkin.schemas";

type TokenConsumePanelProps = {
  isSubmitting: boolean;
  onSubmit: (values: ConsumeTokenFormValues) => Promise<void>;
};

export function TokenConsumePanel({ isSubmitting, onSubmit }: TokenConsumePanelProps) {
  const form = useForm<ConsumeTokenFormValues>({
    resolver: zodResolver(consumeTokenSchema),
    defaultValues: { raw_token: "", notes: "" },
  });
  const fieldErrors = form.formState.errors;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary"><ScanLine className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold text-foreground">Manual QR token entry</p>
            <p className="mt-1 text-sm text-muted-foreground">
              A camera-based QR scanner package is not installed in this project yet, so this staff screen uses secure manual token entry against the real backend consume endpoint.
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormErrorAlert message={form.formState.errors.root?.message} />
        <TextInputField label="QR token" required placeholder="Paste or type the check-in token" error={fieldErrors.raw_token?.message} {...form.register("raw_token")} />
        <TextareaField label="Notes" rows={3} error={fieldErrors.notes?.message} {...form.register("notes")} />
        <SubmitButton label="Consume token and check in" loadingLabel="Checking in..." isLoading={isSubmitting} />
      </form>
    </div>
  );
}
