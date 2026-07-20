"use client";

import { KeyRound, UserCog } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

import { useChangePasswordMutation, useUpdateProfileMutation } from "../hooks/use-settings-mutations";
import { ProfileForm, PasswordForm } from "./settings-forms";
import { formatOptional, formatSettingsName } from "./settings-formatters";
import { SettingsPageTabs } from "./settings-page-tabs";

function profileInitialValues(user: NonNullable<ReturnType<typeof useCurrentUserQuery>["data"]>) {
  return {
    first_name: user.first_name,
    middle_name: user.middle_name ?? "",
    last_name: user.last_name,
  };
}

export function SettingsProfileScreen() {
  const userQuery = useCurrentUserQuery();
  const updateProfile = useUpdateProfileMutation();
  const changePassword = useChangePasswordMutation();

  if (userQuery.isLoading) return <LoadingState title="Loading profile" description="Fetching your current account." />;
  if (!userQuery.data) return <ErrorState title="Profile unavailable" description="We could not load the current user profile." />;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageTabs activeTab="profile" />
      <PageHeader title="Profile Settings" description="Update your own profile and password using the authenticated /auth/me endpoints." />
      <SectionCard title="Account summary" description="Safe user details only. Business access is handled by memberships and roles.">
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <div><p className="text-muted-foreground">Name</p><p className="font-semibold">{formatSettingsName(userQuery.data.first_name, userQuery.data.middle_name, userQuery.data.last_name)}</p></div>
          <div><p className="text-muted-foreground">Email</p><p className="font-semibold">{formatOptional(userQuery.data.email)}</p></div>
          <div><p className="text-muted-foreground">Phone</p><p className="font-semibold">{formatOptional(userQuery.data.phone_number)}</p></div>
        </div>
      </SectionCard>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Profile" description="Update your display name fields." action={<UserCog className="h-5 w-5 text-primary" />}>
          <ProfileForm initialValues={profileInitialValues(userQuery.data)} isSubmitting={updateProfile.isPending} onSubmit={async (values) => { await updateProfile.mutateAsync(values); }} />
        </SectionCard>
        <SectionCard title="Password" description="Change your password securely." action={<KeyRound className="h-5 w-5 text-primary" />}>
          <PasswordForm isSubmitting={changePassword.isPending} onSubmit={async (values) => { await changePassword.mutateAsync(values); }} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
