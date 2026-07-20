"use client";

import Link from "next/link";
import { Bell, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { ActionDialog } from "@/components/overlays/action-dialog";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";

import { useCancelNotificationMutation, useMarkNotificationReadMutation, useSendNotificationMutation } from "../hooks/use-notification-mutations";
import { useNotificationWorkspace, useNotificationsQuery } from "../hooks/use-notification-queries";
import type { NotificationChannel, NotificationStatus, NotificationType, PatientNotificationRecord } from "../types/notification.types";
import { formatNotificationDate } from "./notification-formatters";
import { NotificationsTable } from "./notifications-table";

const statusOptions = ["", "pending", "processing", "sent", "delivered", "failed", "cancelled"].map((value) => ({ label: value ? value.replaceAll("_", " ") : "All statuses", value }));
const channelOptions = ["", "sms", "email", "push", "in_app"].map((value) => ({ label: value ? value.replaceAll("_", " ") : "All channels", value }));
const typeOptions = ["", "appointment_confirmation", "appointment_reminder", "appointment_rescheduled", "appointment_cancelled", "queue_joined", "queue_updated", "queue_called", "general"].map((value) => ({ label: value ? value.replaceAll("_", " ") : "All types", value }));

export function NotificationsListScreen() {
  const workspace = useNotificationWorkspace();
  const [sendTarget, setSendTarget] = useState<PatientNotificationRecord | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PatientNotificationRecord | null>(null);
  const [readTarget, setReadTarget] = useState<PatientNotificationRecord | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const debouncedPatientSearch = useDebouncedValue(patientSearch);
  const [filters, setFilters] = useState({
    patient_id: "",
    appointment_id: "",
    queue_entry_id: "",
    status: "" as NotificationStatus | "",
    channel: "" as NotificationChannel | "",
    notification_type: "" as NotificationType | "",
    date_from: "",
    date_to: "",
  });
  const notificationsQuery = useNotificationsQuery({
    patient_id: filters.patient_id,
    appointment_id: filters.appointment_id,
    queue_entry_id: filters.queue_entry_id,
    status: filters.status,
    channel: filters.channel,
    notification_type: filters.notification_type,
  }, { enabled: workspace.canViewNotifications });
  const sendMutation = useSendNotificationMutation();
  const cancelMutation = useCancelNotificationMutation();
  const markReadMutation = useMarkNotificationReadMutation();
  const notifications = useMemo(
    () => (notificationsQuery.data ?? []).filter((notification) => {
      const created = notification.created_at.slice(0, 10);
      const matchesPatient = !debouncedPatientSearch || notification.patient_number.toLowerCase().includes(debouncedPatientSearch.toLowerCase());
      const afterStart = !filters.date_from || created >= filters.date_from;
      const beforeEnd = !filters.date_to || created <= filters.date_to;
      return matchesPatient && afterStart && beforeEnd;
    }),
    [debouncedPatientSearch, filters.date_from, filters.date_to, notificationsQuery.data],
  );

  if (workspace.isLoading) return <LoadingState title="Loading notifications" description="Checking notification permissions." />;
  if (!workspace.canViewNotifications) return <ErrorState title="Notification access required" description="You do not have permission to manage notifications." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<PageHeader title="Notifications" description="Manage patient notification delivery, failures, factory actions, and safe delivery status." />}
        actions={<ResponsiveActionBar>
          {workspace.canCreateNotifications ? <Link href="/notifications/new"><Button><Bell className="mr-2 h-4 w-4" />New notification</Button></Link> : null}
          {workspace.canViewDevices ? <Link href="/notifications/devices"><Button variant="secondary">Push devices</Button></Link> : null}
          <Button variant="secondary" onClick={() => void notificationsQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
        filters={<ResponsiveFilterPanel title="Notification filters" description="Filter by status, channel, type, linked records, or patient number.">
          <div className="grid gap-4 lg:grid-cols-4">
            <SelectField label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as NotificationStatus | "" }))} options={statusOptions} />
            <SelectField label="Channel" value={filters.channel} onChange={(event) => setFilters((current) => ({ ...current, channel: event.target.value as NotificationChannel | "" }))} options={channelOptions} />
            <SelectField label="Type" value={filters.notification_type} onChange={(event) => setFilters((current) => ({ ...current, notification_type: event.target.value as NotificationType | "" }))} options={typeOptions} />
            <TextInputField label="Patient ID" value={filters.patient_id} onChange={(event) => setFilters((current) => ({ ...current, patient_id: event.target.value }))} />
            <TextInputField label="Patient number search" value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} />
            <TextInputField label="Appointment ID" value={filters.appointment_id} onChange={(event) => setFilters((current) => ({ ...current, appointment_id: event.target.value }))} />
            <TextInputField label="Queue entry ID" value={filters.queue_entry_id} onChange={(event) => setFilters((current) => ({ ...current, queue_entry_id: event.target.value }))} />
            <TextInputField label="Date from" type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))} />
            <TextInputField label="Date to" type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))} />
          </div>
        </ResponsiveFilterPanel>}
      >
        {notificationsQuery.isLoading ? <LoadingState title="Loading notifications" description="Fetching patient notifications." /> : null}
        {notificationsQuery.error ? <ErrorState title="Unable to load notifications" description={notificationsQuery.error.message} actionLabel="Retry" onAction={() => void notificationsQuery.refetch()} /> : null}
        {!notificationsQuery.isLoading && !notificationsQuery.error ? <NotificationsTable notifications={notifications} canSend={workspace.canSendNotifications} canCancel={workspace.canCancelNotifications} onSend={setSendTarget} onCancel={setCancelTarget} onMarkRead={setReadTarget} /> : null}
      </ResponsivePageShell>
      <ConfirmDialog open={Boolean(sendTarget)} title="Send notification?" description={`Attempt delivery for notification scheduled ${formatNotificationDate(sendTarget?.scheduled_for)}.`} confirmLabel="Send notification" isSubmitting={sendMutation.isPending} onClose={() => setSendTarget(null)} onConfirm={async () => { if (!sendTarget) return; await sendMutation.mutateAsync(sendTarget.id); setSendTarget(null); }} />
      <ActionDialog open={Boolean(cancelTarget)} title="Cancel notification?" description="Cancelled notifications cannot be sent later." confirmLabel="Cancel notification" reasonLabel="Cancellation reason" isSubmitting={cancelMutation.isPending} onClose={() => setCancelTarget(null)} onConfirm={async (reason) => { if (!cancelTarget) return; await cancelMutation.mutateAsync({ id: cancelTarget.id, reason }); setCancelTarget(null); }} />
      <ConfirmDialog open={Boolean(readTarget)} title="Mark notification as read?" description="This sets read_at for an in-app notification." confirmLabel="Mark read" isSubmitting={markReadMutation.isPending} onClose={() => setReadTarget(null)} onConfirm={async () => { if (!readTarget) return; await markReadMutation.mutateAsync(readTarget.id); setReadTarget(null); }} />
    </PageContainer>
  );
}
