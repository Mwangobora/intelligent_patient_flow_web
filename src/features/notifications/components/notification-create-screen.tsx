"use client";

import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

import { useCreateFactoryNotificationMutation, useCreateNotificationMutation } from "../hooks/use-notification-mutations";
import { useNotificationWorkspace } from "../hooks/use-notification-queries";
import type { NotificationFactoryPayload } from "../types/notification.types";
import { NotificationCreateForm, NotificationFactoryForm } from "./notification-forms";
import { cleanNotificationPayload } from "./notification-formatters";

export function NotificationCreateScreen() {
  const workspace = useNotificationWorkspace();
  const createMutation = useCreateNotificationMutation();
  const factoryMutation = useCreateFactoryNotificationMutation();

  if (workspace.isLoading) return <LoadingState title="Loading notification form" description="Checking notification creation permissions." />;
  if (!workspace.canCreateNotifications) return <ErrorState title="Notification creation access required" description="You do not have permission to create notifications." />;

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Create Notification" description="Create patient notifications or use backend factory actions. Message content is encrypted server-side and hidden from normal responses." actions={<Link href="/notifications"><Button variant="secondary">Back to notifications</Button></Link>} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Manual notification" description="Use this when staff needs to create a general or source-linked notification.">
          <NotificationCreateForm isSubmitting={createMutation.isPending} onSubmit={async (values) => { await createMutation.mutateAsync(cleanNotificationPayload(values)); }} />
        </SectionCard>
        <SectionCard title="Factory actions" description="Create standardized appointment or queue notifications from backend factory endpoints.">
          <NotificationFactoryForm
            isSubmitting={factoryMutation.isPending}
            onSubmit={async (values) => {
              const payload: NotificationFactoryPayload = cleanNotificationPayload({
                channel: values.channel,
                scheduled_for: values.scheduled_for,
                idempotency_key: values.idempotency_key,
                ...(values.factory_type.startsWith("appointment_") ? { appointment_id: values.source_id } : { queue_entry_id: values.source_id }),
              });
              await factoryMutation.mutateAsync({ kind: values.factory_type, payload });
            }}
          />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
