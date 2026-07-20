"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormErrorAlert } from "@/components/forms/form-error-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextInputField } from "@/components/forms/text-input-field";
import { TextareaField } from "@/components/forms/textarea-field";
import type { FacilityRecord, OrganizationRecord, RoleRecord, UserRecord } from "../types/settings.types";
import {
  flowSettingsSchema,
  membershipSchema,
  organizationSchema,
  passwordSchema,
  permissionSchema,
  profileSchema,
  roleAssignmentSchema,
  roleSchema,
  userSchema,
  type FlowSettingsFormValues,
  type MembershipFormValues,
  type OrganizationFormValues,
  type PasswordFormValues,
  type PermissionFormValues,
  type ProfileFormValues,
  type RoleAssignmentFormValues,
  type RoleFormValues,
  type UserFormValues,
} from "../schemas/settings.schemas";

type Submit<T> = (values: T) => Promise<void>;

const flowNumberFields = [
  "max_advance_booking_days",
  "minimum_booking_notice_minutes",
  "cancellation_cutoff_minutes",
  "reschedule_cutoff_minutes",
  "early_checkin_minutes",
  "late_checkin_grace_minutes",
  "no_show_after_minutes",
  "default_reminder_minutes_before",
  "queue_number_padding",
] as const;

export function OrganizationForm({ initialValues, isSubmitting, onSubmit }: { initialValues?: Partial<OrganizationFormValues>; isSubmitting: boolean; onSubmit: Submit<OrganizationFormValues> }) {
  const form = useForm<OrganizationFormValues>({ resolver: zodResolver(organizationSchema), defaultValues: { name: initialValues?.name ?? "", legal_name: initialValues?.legal_name ?? "", code: initialValues?.code ?? "", email: initialValues?.email ?? "", phone_number: initialValues?.phone_number ?? "", registration_number: initialValues?.registration_number ?? "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><FormErrorAlert message={form.formState.errors.root?.message} /><div className="grid gap-4 lg:grid-cols-2"><TextInputField label="Name" required error={form.formState.errors.name?.message} {...form.register("name")} /><TextInputField label="Legal name" {...form.register("legal_name")} /><TextInputField label="Code" helperText="Leave blank for backend generation." {...form.register("code")} /><TextInputField label="Email" type="email" {...form.register("email")} /><TextInputField label="Phone number" {...form.register("phone_number")} /><TextInputField label="Registration number" {...form.register("registration_number")} /></div><SubmitButton label="Save organization" loadingLabel="Saving..." isLoading={isSubmitting} /></form>;
}

export function UserForm({ initialValues, isSubmitting, onSubmit }: { initialValues?: Partial<UserFormValues>; isSubmitting: boolean; onSubmit: Submit<UserFormValues> }) {
  const form = useForm<UserFormValues>({ resolver: zodResolver(userSchema), defaultValues: { email: initialValues?.email ?? "", phone_number: initialValues?.phone_number ?? "", password: initialValues?.password ?? "", first_name: initialValues?.first_name ?? "", middle_name: initialValues?.middle_name ?? "", last_name: initialValues?.last_name ?? "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><FormErrorAlert message={form.formState.errors.root?.message} /><div className="grid gap-4 lg:grid-cols-2"><TextInputField label="First name" required error={form.formState.errors.first_name?.message} {...form.register("first_name")} /><TextInputField label="Last name" required error={form.formState.errors.last_name?.message} {...form.register("last_name")} /><TextInputField label="Middle name" {...form.register("middle_name")} /><TextInputField label="Email" type="email" {...form.register("email")} /><TextInputField label="Phone number" {...form.register("phone_number")} /><TextInputField label="Temporary password" type="password" helperText="Optional when backend allows account setup later." {...form.register("password")} /></div><SubmitButton label="Save user" loadingLabel="Saving..." isLoading={isSubmitting} /></form>;
}

export function RoleForm({ organizations, facilities, initialValues, isSubmitting, onSubmit }: { organizations: OrganizationRecord[]; facilities: FacilityRecord[]; initialValues?: Partial<RoleFormValues>; isSubmitting: boolean; onSubmit: Submit<RoleFormValues> }) {
  const form = useForm<RoleFormValues>({ resolver: zodResolver(roleSchema), defaultValues: { name: initialValues?.name ?? "", code: initialValues?.code ?? "", description: initialValues?.description ?? "", organization_id: initialValues?.organization_id ?? "", facility_id: initialValues?.facility_id ?? "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><FormErrorAlert message={form.formState.errors.root?.message} /><div className="grid gap-4 lg:grid-cols-2"><TextInputField label="Role name" required error={form.formState.errors.name?.message} {...form.register("name")} /><TextInputField label="Code" helperText="Leave blank for backend generation." {...form.register("code")} /><SelectField label="Organization scope" options={[{ label: "Platform role", value: "" }, ...organizations.map((item) => ({ label: item.name, value: item.id }))]} {...form.register("organization_id")} /><SelectField label="Facility scope" options={[{ label: "No facility scope", value: "" }, ...facilities.map((item) => ({ label: item.name, value: item.id }))]} {...form.register("facility_id")} /><TextareaField label="Description" {...form.register("description")} /></div><SubmitButton label="Save role" loadingLabel="Saving..." isLoading={isSubmitting} /></form>;
}

export function PermissionForm({ initialValues, isSubmitting, onSubmit }: { initialValues?: Partial<PermissionFormValues>; isSubmitting: boolean; onSubmit: Submit<PermissionFormValues> }) {
  const form = useForm<PermissionFormValues>({ resolver: zodResolver(permissionSchema), defaultValues: { name: initialValues?.name ?? "", module: initialValues?.module ?? "", action: initialValues?.action ?? "", code: initialValues?.code ?? "", description: initialValues?.description ?? "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><FormErrorAlert message={form.formState.errors.root?.message} /><div className="grid gap-4 lg:grid-cols-2"><TextInputField label="Permission name" required {...form.register("name")} /><TextInputField label="Module" required placeholder="accounts_user" {...form.register("module")} /><TextInputField label="Action" required placeholder="view" {...form.register("action")} /><TextInputField label="Code" helperText="Optional; backend validates module.action." {...form.register("code")} /><TextareaField label="Description" {...form.register("description")} /></div><SubmitButton label="Create permission" loadingLabel="Creating..." isLoading={isSubmitting} /></form>;
}

export function MembershipForm({ users, organizations, facilities, isSubmitting, onSubmit }: { users: UserRecord[]; organizations: OrganizationRecord[]; facilities: FacilityRecord[]; isSubmitting: boolean; onSubmit: Submit<MembershipFormValues> }) {
  const form = useForm<MembershipFormValues>({ resolver: zodResolver(membershipSchema), defaultValues: { user_id: "", organization_id: "", facility_id: "", starts_at: "", ends_at: "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 lg:grid-cols-2"><SelectField label="User" required options={[{ label: "Select user", value: "" }, ...users.map((item) => ({ label: item.email ?? `${item.first_name} ${item.last_name}`, value: item.id }))]} {...form.register("user_id")} /><SelectField label="Organization" required options={[{ label: "Select organization", value: "" }, ...organizations.map((item) => ({ label: item.name, value: item.id }))]} {...form.register("organization_id")} /><SelectField label="Facility" helperText="Leave blank for organization membership." options={[{ label: "Organization only", value: "" }, ...facilities.map((item) => ({ label: item.name, value: item.id }))]} {...form.register("facility_id")} /><TextInputField label="Starts at" type="datetime-local" {...form.register("starts_at")} /><TextInputField label="Ends at" type="datetime-local" {...form.register("ends_at")} /></div><SubmitButton label="Create membership" loadingLabel="Creating..." isLoading={isSubmitting} /></form>;
}

export function RoleAssignmentForm({ users, roles, isSubmitting, onSubmit }: { users: UserRecord[]; roles: RoleRecord[]; isSubmitting: boolean; onSubmit: Submit<RoleAssignmentFormValues> }) {
  const form = useForm<RoleAssignmentFormValues>({ resolver: zodResolver(roleAssignmentSchema), defaultValues: { user_id: "", role_id: "", starts_at: "", ends_at: "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 lg:grid-cols-2"><SelectField label="User" required options={[{ label: "Select user", value: "" }, ...users.map((item) => ({ label: item.email ?? `${item.first_name} ${item.last_name}`, value: item.id }))]} {...form.register("user_id")} /><SelectField label="Role" required options={[{ label: "Select role", value: "" }, ...roles.map((item) => ({ label: item.name, value: item.id }))]} {...form.register("role_id")} /><TextInputField label="Starts at" type="datetime-local" {...form.register("starts_at")} /><TextInputField label="Ends at" type="datetime-local" {...form.register("ends_at")} /></div><SubmitButton label="Assign role" loadingLabel="Assigning..." isLoading={isSubmitting} /></form>;
}

export function FlowSettingsForm({ facilities, initialValues, isSubmitting, onSubmit }: { facilities: FacilityRecord[]; initialValues?: Partial<FlowSettingsFormValues>; isSubmitting: boolean; onSubmit: Submit<FlowSettingsFormValues> }) {
  const form = useForm<FlowSettingsFormValues>({ resolver: zodResolver(flowSettingsSchema), defaultValues: { facility_id: initialValues?.facility_id ?? "", max_advance_booking_days: initialValues?.max_advance_booking_days ?? 30, minimum_booking_notice_minutes: initialValues?.minimum_booking_notice_minutes ?? 30, cancellation_cutoff_minutes: initialValues?.cancellation_cutoff_minutes ?? 60, reschedule_cutoff_minutes: initialValues?.reschedule_cutoff_minutes ?? 60, early_checkin_minutes: initialValues?.early_checkin_minutes ?? 30, late_checkin_grace_minutes: initialValues?.late_checkin_grace_minutes ?? 15, no_show_after_minutes: initialValues?.no_show_after_minutes ?? 15, default_reminder_minutes_before: initialValues?.default_reminder_minutes_before ?? 1440, queue_number_padding: initialValues?.queue_number_padding ?? 3, auto_create_daily_queues: initialValues?.auto_create_daily_queues ?? true } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 lg:grid-cols-2"><SelectField label="Facility" required options={[{ label: "Select facility", value: "" }, ...facilities.map((item) => ({ label: item.name, value: item.id }))]} {...form.register("facility_id")} />{flowNumberFields.map((field) => <TextInputField key={field} label={field.replaceAll("_", " ")} type="number" {...form.register(field, { valueAsNumber: true })} />)}<label className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm"><input type="checkbox" className="h-4 w-4 cursor-pointer accent-primary" {...form.register("auto_create_daily_queues")} />Auto-create daily queues</label></div><SubmitButton label="Save flow settings" loadingLabel="Saving..." isLoading={isSubmitting} /></form>;
}

export function ProfileForm({ initialValues, isSubmitting, onSubmit }: { initialValues?: Partial<ProfileFormValues>; isSubmitting: boolean; onSubmit: Submit<ProfileFormValues> }) {
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: { first_name: initialValues?.first_name ?? "", middle_name: initialValues?.middle_name ?? "", last_name: initialValues?.last_name ?? "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><div className="grid gap-4 lg:grid-cols-2"><TextInputField label="First name" required {...form.register("first_name")} /><TextInputField label="Middle name" {...form.register("middle_name")} /><TextInputField label="Last name" required {...form.register("last_name")} /></div><SubmitButton label="Update profile" loadingLabel="Saving..." isLoading={isSubmitting} /></form>;
}

export function PasswordForm({ isSubmitting, onSubmit }: { isSubmitting: boolean; onSubmit: Submit<PasswordFormValues> }) {
  const form = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema), defaultValues: { old_password: "", new_password: "" } });
  return <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"><TextInputField label="Current password" type="password" required {...form.register("old_password")} /><TextInputField label="New password" type="password" required {...form.register("new_password")} /><SubmitButton label="Change password" loadingLabel="Changing..." isLoading={isSubmitting} /></form>;
}
