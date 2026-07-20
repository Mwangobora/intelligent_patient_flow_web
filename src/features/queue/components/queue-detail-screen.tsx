"use client";

import Link from "next/link";
import { ArrowLeft, PlayCircle, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";

import {
  useCancelQueueMutation,
  useCloseQueueMutation,
  useCreateQueueEntryMutation,
  useOpenQueueMutation,
  usePauseQueueMutation,
  useResumeQueueMutation,
} from "../hooks/use-queue-mutations";
import {
  useCheckinsLookupQuery,
  useNextQueueEntryQuery,
  useQueueDetailQuery,
  useQueueEntriesQuery,
  useQueueEntryEventsQuery,
} from "../hooks/use-queue-queries";
import { useQueueWorkspace } from "../hooks/use-queue-workspace";
import { QueueEntryCreateForm } from "./queue-entry-create-form";
import { QueueEntryEventsPanel } from "./queue-entry-events-panel";
import { QueueEntryMobileCard } from "./queue-entry-mobile-card";
import { QueueEntryTable } from "./queue-entry-table";
import { NextQueueEntryPanel } from "./next-queue-entry-panel";
import { formatQueueDate, sortQueueEntries } from "./queue-formatters";
import { QueueStatusBadge } from "./queue-status-badge";

type QueueDetailScreenProps = {
  queueId: string;
};

export function QueueDetailScreen({ queueId }: QueueDetailScreenProps) {
  const workspace = useQueueWorkspace();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [confirmCancelQueue, setConfirmCancelQueue] = useState(false);
  const queueQuery = useQueueDetailQuery(queueId, { enabled: workspace.canViewQueues });
  const entriesQuery = useQueueEntriesQuery(
    { queue_id: queueId, active_only: false },
    { enabled: workspace.canViewQueues },
  );
  const nextEntryQuery = useNextQueueEntryQuery(queueId, { enabled: workspace.canViewQueues });
  const checkinsQuery = useCheckinsLookupQuery(
    {
      facility_id: queueQuery.data?.facility,
      is_voided: false,
    },
    { enabled: workspace.canCreateEntries && Boolean(queueQuery.data?.facility) },
  );
  const entries = useMemo(() => sortQueueEntries(entriesQuery.data ?? []), [entriesQuery.data]);
  const activeSelectedEntryId = selectedEntryId ?? entries[0]?.id ?? null;
  const eventsQuery = useQueueEntryEventsQuery(activeSelectedEntryId ?? undefined, {
    enabled: Boolean(activeSelectedEntryId) && workspace.canViewQueues,
  });
  const openMutation = useOpenQueueMutation();
  const pauseMutation = usePauseQueueMutation();
  const resumeMutation = useResumeQueueMutation();
  const closeMutation = useCloseQueueMutation();
  const cancelMutation = useCancelQueueMutation();
  const createEntryMutation = useCreateQueueEntryMutation();

  const nextEntry = nextEntryQuery.error?.status === 404 ? null : nextEntryQuery.data ?? entries[0] ?? null;

  if (workspace.isLoading || queueQuery.isLoading) {
    return <LoadingState title="Loading queue" description="Preparing queue summary, entries, and events." />;
  }
  if (!workspace.canViewQueues) {
    return <ErrorState title="Queue access required" description="You do not have permission to view queue details." />;
  }
  if (queueQuery.error || !queueQuery.data) {
    return (
      <ErrorState
        title="Unable to load queue"
        description={queueQuery.error?.message ?? "The requested queue could not be found."}
        actionLabel="Retry"
        onAction={() => void queueQuery.refetch()}
      />
    );
  }

  const queue = queueQuery.data;
  const busy =
    openMutation.isPending ||
    pauseMutation.isPending ||
    resumeMutation.isPending ||
    closeMutation.isPending ||
    cancelMutation.isPending ||
    createEntryMutation.isPending;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={`${queue.service_point_name} queue`}
        description={`${queue.specialty_name ?? "General"} queue on ${formatQueueDate(queue.queue_date)}.`}
        actions={<QueueStatusBadge status={queue.status} />}
      />

      <ResponsiveActionBar>
        <Link href="/queue"><Button variant="secondary"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></Link>
        <Link href={`/queue/service-desk?queueId=${queue.id}`}><Button><PlayCircle className="mr-2 h-4 w-4" />Service desk</Button></Link>
        {workspace.canCreateEntries ? <Button variant="secondary" onClick={() => setShowAddEntry(true)}>Add checked-in patient</Button> : null}
        <Button variant="secondary" onClick={() => void Promise.all([queueQuery.refetch(), entriesQuery.refetch(), nextEntryQuery.refetch()])}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </ResponsiveActionBar>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Queue summary" description="Operational queue details and current service state.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Facility</p><p className="font-semibold text-foreground">{queue.facility_name}</p></div>
            <div><p className="text-sm text-muted-foreground">Service point</p><p className="font-semibold text-foreground">{queue.service_point_name}</p></div>
            <div><p className="text-sm text-muted-foreground">Specialty</p><p className="font-semibold text-foreground">{queue.specialty_name ?? "General queue"}</p></div>
            <div><p className="text-sm text-muted-foreground">Next sequence</p><p className="font-semibold text-foreground">{queue.next_sequence_number}</p></div>
          </div>
          {workspace.canManageQueues ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {queue.status === "draft" ? <Button disabled={busy} onClick={() => void openMutation.mutateAsync({ queueId: queue.id })}>Open</Button> : null}
              {queue.status === "open" ? <Button variant="secondary" disabled={busy} onClick={() => void pauseMutation.mutateAsync({ queueId: queue.id })}>Pause</Button> : null}
              {queue.status === "paused" ? <Button disabled={busy} onClick={() => void resumeMutation.mutateAsync({ queueId: queue.id })}>Resume</Button> : null}
              {["open", "paused"].includes(queue.status) ? <Button variant="secondary" disabled={busy} onClick={() => void closeMutation.mutateAsync({ queueId: queue.id })}>Close</Button> : null}
              {!["closed", "cancelled"].includes(queue.status) ? <Button variant="danger" disabled={busy} onClick={() => setConfirmCancelQueue(true)}>Cancel</Button> : null}
            </div>
          ) : null}
        </SectionCard>

        <NextQueueEntryPanel entry={nextEntry} />
      </section>

      {workspace.canCreateEntries ? (
        <FormSheet open={showAddEntry} title="Add checked-in patient" description="Only non-voided check-ins for this facility can join the queue." onOpenChange={setShowAddEntry}>
          <QueueEntryCreateForm
            queueId={queue.id}
            checkins={checkinsQuery.data ?? []}
            isSubmitting={createEntryMutation.isPending}
            onSubmit={async (payload) => {
              await createEntryMutation.mutateAsync(payload);
              setShowAddEntry(false);
            }}
          />
        </FormSheet>
      ) : null}
      <ConfirmDialog
        open={confirmCancelQueue}
        title="Cancel this queue?"
        description="This records the queue cancellation and prevents new entries."
        confirmLabel="Cancel queue"
        isSubmitting={cancelMutation.isPending}
        onClose={() => setConfirmCancelQueue(false)}
        onConfirm={async () => {
          await cancelMutation.mutateAsync({ queueId: queue.id });
          setConfirmCancelQueue(false);
        }}
      />

      <SectionCard title="Queue entries" description="Waiting, called, in-service, completed, cancelled, and transferred patients.">
        {!entries.length ? (
            <EmptyState title="No queue entries yet" description="Patients added from check-ins will appear here in priority order." />
          ) : (
          <div className="space-y-4">
            <QueueEntryTable entries={entries} selectedEntryId={activeSelectedEntryId} onSelect={(entry) => setSelectedEntryId(entry.id)} />
            <div className="space-y-4 md:hidden">
              {entries.map((entry) => (
                <QueueEntryMobileCard key={entry.id} entry={entry} selected={activeSelectedEntryId === entry.id} onSelect={(selected) => setSelectedEntryId(selected.id)} />
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {activeSelectedEntryId ? (
        <QueueEntryEventsPanel events={eventsQuery.data ?? []} />
      ) : null}
    </PageContainer>
  );
}
