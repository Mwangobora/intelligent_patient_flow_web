"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";

import {
  createPredictionSchema,
  mlPredictionSchema,
  ruleBasedPredictionSchema,
  type CreatePredictionFormValues,
  type MlPredictionFormValues,
  type RuleBasedPredictionFormValues,
} from "../schemas/intelligence.schemas";

type Submit<T> = (values: T) => Promise<void>;

export function RuleBasedPredictionForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: Submit<RuleBasedPredictionFormValues> }) {
  const form = useForm<RuleBasedPredictionFormValues>({ resolver: zodResolver(ruleBasedPredictionSchema), defaultValues: { queue_entry_id: "", generated_at: "" } });
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <TextInputField label="Queue entry ID" required error={form.formState.errors.queue_entry_id?.message} {...form.register("queue_entry_id")} />
      <TextInputField label="Generated at" type="datetime-local" {...form.register("generated_at")} />
      <SubmitButton label="Generate rule-based prediction" loadingLabel="Generating..." isLoading={isSubmitting} />
    </form>
  );
}

export function MachineLearningPredictionForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: Submit<MlPredictionFormValues> }) {
  const form = useForm<MlPredictionFormValues>({ resolver: zodResolver(mlPredictionSchema), defaultValues: { queue_entry_id: "" } });
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <TextInputField label="Queue entry ID" required error={form.formState.errors.queue_entry_id?.message} {...form.register("queue_entry_id")} />
      <p className="rounded-lg bg-warning/10 p-3 text-sm text-warning">Machine learning is intentionally a placeholder until a trained model is configured.</p>
      <SubmitButton label="Try ML prediction" loadingLabel="Checking..." isLoading={isSubmitting} />
    </form>
  );
}

export function CreatePredictionForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: Submit<CreatePredictionFormValues> }) {
  const form = useForm<CreatePredictionFormValues>({
    resolver: zodResolver(createPredictionSchema),
    defaultValues: { queue_entry_id: "", predicted_wait_minutes: 0, prediction_method: "rule_based", model_version: "", confidence_score: null, generated_at: "" },
  });
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="Queue entry ID" required error={form.formState.errors.queue_entry_id?.message} {...form.register("queue_entry_id")} />
        <TextInputField label="Predicted wait minutes" type="number" {...form.register("predicted_wait_minutes", { valueAsNumber: true })} />
        <SelectField label="Prediction method" options={[{ label: "Rule based", value: "rule_based" }, { label: "Machine learning", value: "machine_learning" }]} {...form.register("prediction_method")} />
        <TextInputField label="Model version" {...form.register("model_version")} />
        <TextInputField label="Confidence score" type="number" step="0.01" min="0" max="1" {...form.register("confidence_score", { valueAsNumber: true })} />
        <TextInputField label="Generated at" type="datetime-local" {...form.register("generated_at")} />
      </div>
      <SubmitButton label="Create prediction" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}
