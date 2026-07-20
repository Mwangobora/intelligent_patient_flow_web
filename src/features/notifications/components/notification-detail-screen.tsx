"use client";

import Link from "next/link";
import { BellRing, RefreshCw } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ActionDialog } from "@/components/overlays/action-dialog";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { Button } from "@/components/ui/button";

import { useCancelNotificationMutation, useMarkNotificationReadMutation, useSendNotificationMutation } from "../hooks/use-notification-mutations";
import { useNotificationDetailQuery, useNotificationWorkspace } from "../hooks/use-notification-queries";
import { NotificationChannelBadge, NotificationStatusBadge } from "./notification-badges";
import { formatNotificationDate, formatNotificationLabel, formatOptional } from "./notification-formatters";

export function NotificationDetailScreen({ notificationId }: { notificationId: string }) {
  const workspace = useNotificationWorkspace();
  const notificationQuery = useNotificationDetailQuery(notificationId, { enabled: workspace.canViewNotifications });
  const [showSend, setShowSend] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const sendMutation = useSendNotificationMutation();
  const cancelMutation = useCancelNotificationMutation();
  const markReadMutation = useMarkNotificationReadMutation();
  const notification = notificationQuery.data;

  if (workspace.isLoading || notificationQuery.isLoading) return <LoadingState title="Loading notification" description="Fetching safe notification delivery details." />;
  if (!workspace.canViewNotifications) return <ErrorState title="Notification access required" description="You do not have permission to view notifications." />;
  if (notificationQuery.error) return <ErrorState title="Unable to load notification" description={notificationQuery.error.message} actionLabel="Retry" onAction={() => void notificationQuery.refetch()} />;
  if (!notification) return <ErrorState title="Notification not found" description="This notification record was not found." />;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={`Notification ${notification.patient_number}`}
        description="Safe delivery status only. Encrypted destination, subject, body, and token values are never displayed."
        actions={<ResponsiveActionBar>
          <Link href="/notifications"><Button variant="secondary">Back to notifications</Button></Link>
          {workspace.canSendNotifications && ["pending", "processing"].includes(notification.status) ? <Button onClick={() => setShowSend(true)}><BellRing className="mr-2 h-4 w-4" />Send</Button> : null}
          {workspace.canCancelNotifications && ["pending", "processing"].includes(notification.status) ? <Button variant="danger" onClick={() => setShowCancel(true)}>Cancel</Button> : null}
          {notification.channel === "in_app" && notification.status === "delivered" && !notification.read_at ? <Button variant="secondary" onClick={() => setShowRead(true)}>Mark read</Button> : null}
          <Button variant="secondary" onClick={() => void notificationQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
      />
      <SectionCard title="Notification summary" description="Patient notification source and delivery metadata.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Info label="Type" value={formatNotificationLabel(notification.notification_type)} />
          <div><p className="text-sm text-muted-foreground">Channel</p><div className="mt-1"><NotificationChannelBadge channel={notification.channel} /></div></div>
          <div><p className="text-sm text-muted-foreground">Status</p><div className="mt-1"><NotificationStatusBadge status={notification.status} /></div></div>
          <Info label="Patient" value={notification.patient_number} />
          <Info label="Appointment" value={notification.appointment} />
          <Info label="Queue entry" value={notification.queue_entry} />
          <Info label="Scheduled for" value={formatNotificationDate(notification.scheduled_for)} />
          <Info label="Last attempt" value={formatNotificationDate(notification.last_attempt_at)} />
          <Info label="Attempts" value={notification.attempt_count} />
          <Info label="Sent" value={formatNotificationDate(notification.sent_at)} />
          <Info label="Delivered" value={formatNotificationDate(notification.delivered_at)} />
          <Info label="Read" value={formatNotificationDate(notification.read_at)} />
          <Info label="Failed" value={formatNotificationDate(notification.failed_at)} />
          <Info label="Failure reason" value={notification.failure_reason} />
          <Info label="Provider message ID" value={notification.provider_message_id} />
          <Info label="Created" value={formatNotificationDate(notification.created_at)} />
        </div>
      </SectionCard>
      <ConfirmDialog open={showSend} title="Send notification?" description="This will run the backend delivery workflow. External providers may return not configured." confirmLabel="Send notification" isSubmitting={sendMutation.isPending} onClose={() => setShowSend(false)} onConfirm={async () => { await sendMutation.mutateAsync(notification.id); setShowSend(false); }} />
      <ActionDialog open={showCancel} title="Cancel notification?" description="Cancelled notifications cannot be sent later." confirmLabel="Cancel notification" reasonLabel="Cancellation reason" isSubmitting={cancelMutation.isPending} onClose={() => setShowCancel(false)} onConfirm={async (reason) => { await cancelMutation.mutateAsync({ id: notification.id, reason }); setShowCancel(false); }} />
      <ConfirmDialog open={showRead} title="Mark notification as read?" description="This sets read_at for this in-app notification." confirmLabel="Mark read" isSubmitting={markReadMutation.isPending} onClose={() => setShowRead(false)} onConfirm={async () => { await markReadMutation.mutateAsync(notification.id); setShowRead(false); }} />
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 break-words font-medium">{formatOptional(value)}</p></div>;
}
