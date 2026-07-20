"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";

import {
  notificationCreateSchema,
  notificationFactorySchema,
  pushDeviceRegisterSchema,
  type NotificationCreateFormValues,
  type NotificationFactoryFormValues,
  type PushDeviceRegisterFormValues,
} from "../schemas/notification.schemas";

type Submit<T> = (values: T) => Promise<void>;

const typeOptions = [
  { label: "Appointment confirmation", value: "appointment_confirmation" },
  { label: "Appointment reminder", value: "appointment_reminder" },
  { label: "Appointment rescheduled", value: "appointment_rescheduled" },
  { label: "Appointment cancelled", value: "appointment_cancelled" },
  { label: "Queue joined", value: "queue_joined" },
  { label: "Queue updated", value: "queue_updated" },
  { label: "Queue called", value: "queue_called" },
  { label: "General", value: "general" },
];

const channelOptions = [
  { label: "In-app", value: "in_app" },
  { label: "SMS", value: "sms" },
  { label: "Email", value: "email" },
  { label: "Push", value: "push" },
];

export function NotificationCreateForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: Submit<NotificationCreateFormValues> }) {
  const form = useForm<NotificationCreateFormValues>({
    resolver: zodResolver(notificationCreateSchema),
    defaultValues: { notification_type: "general", channel: "in_app", patient_id: "", appointment_id: "", queue_entry_id: "", recipient_user_id: "", destination: "", subject: "", body: "", scheduled_for: "", idempotency_key: "" },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormErrorAlert message={form.formState.errors.root?.message} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="Patient ID" required error={form.formState.errors.patient_id?.message} {...form.register("patient_id")} />
        <SelectField label="Notification type" required options={typeOptions} {...form.register("notification_type")} />
        <SelectField label="Channel" required options={channelOptions} {...form.register("channel")} />
        <TextInputField label="Recipient user ID" helperText="Required by backend for push and in-app." {...form.register("recipient_user_id")} />
        <TextInputField label="Appointment ID" {...form.register("appointment_id")} />
        <TextInputField label="Queue entry ID" {...form.register("queue_entry_id")} />
        <TextInputField label="Destination" helperText="Required by backend for SMS, email, and push." {...form.register("destination")} />
        <TextInputField label="Subject" {...form.register("subject")} />
        <TextInputField label="Scheduled for" type="datetime-local" {...form.register("scheduled_for")} />
        <TextInputField label="Idempotency key" {...form.register("idempotency_key")} />
      </div>
      <TextareaField label="Body" required error={form.formState.errors.body?.message} helperText="Sent to backend for server-side encryption; not shown in responses." {...form.register("body")} />
      <SubmitButton label="Create notification" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}

export function NotificationFactoryForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: Submit<NotificationFactoryFormValues> }) {
  const form = useForm<NotificationFactoryFormValues>({
    resolver: zodResolver(notificationFactorySchema),
    defaultValues: { factory_type: "appointment_confirmation", source_id: "", channel: "in_app", scheduled_for: "", idempotency_key: "" },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <SelectField label="Factory action" required options={typeOptions.filter((item) => item.value !== "general")} {...form.register("factory_type")} />
      <TextInputField label="Appointment or queue entry ID" required error={form.formState.errors.source_id?.message} {...form.register("source_id")} />
      <SelectField label="Channel" required options={channelOptions} {...form.register("channel")} />
      <TextInputField label="Scheduled for" type="datetime-local" {...form.register("scheduled_for")} />
      <TextInputField label="Idempotency key" {...form.register("idempotency_key")} />
      <SubmitButton label="Create factory notification" loadingLabel="Creating..." isLoading={isSubmitting} />
    </form>
  );
}

export function PushDeviceRegisterForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: Submit<PushDeviceRegisterFormValues> }) {
  const form = useForm<PushDeviceRegisterFormValues>({
    resolver: zodResolver(pushDeviceRegisterSchema),
    defaultValues: { user_id: "", platform: "web", raw_token: "", device_name: "", app_version: "" },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <TextInputField label="User ID" required error={form.formState.errors.user_id?.message} {...form.register("user_id")} />
      <SelectField label="Platform" required options={[{ label: "Web", value: "web" }, { label: "Android", value: "android" }, { label: "iOS", value: "ios" }]} {...form.register("platform")} />
      <TextareaField label="Raw push token" required error={form.formState.errors.raw_token?.message} helperText="Token is sent once and stored encrypted/hashed by backend." {...form.register("raw_token")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextInputField label="Device name" {...form.register("device_name")} />
        <TextInputField label="App version" {...form.register("app_version")} />
      </div>
      <SubmitButton label="Register device" loadingLabel="Registering..." isLoading={isSubmitting} />
    </form>
  );
}
