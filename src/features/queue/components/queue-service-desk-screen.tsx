"use client";

import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { SelectField } from "@/components/forms/select-field";
import { Button } from "@/components/ui/button";

import {
  useCallQueueEntryMutation,
  useCancelQueueEntryMutation,
  useChangePriorityMutation,
  useCompleteServiceMutation,
  useRecallQueueEntryMutation,
  useSkipQueueEntryMutation,
  useStartServiceMutation,
  useTransferQueueEntryMutation,
} from "../hooks/use-queue-mutations";
import {
  useNextQueueEntryQuery,
  useQueueEntriesQuery,
  useQueueEntryEventsQuery,
  useQueuesQuery,
} from "../hooks/use-queue-queries";
import { useQueueWorkspace } from "../hooks/use-queue-workspace";
import { QueueEntryEventsPanel } from "./queue-entry-events-panel";
import { QueueEntryMobileCard } from "./queue-entry-mobile-card";
import { QueueEntryTable } from "./queue-entry-table";
import { NextQueueEntryPanel } from "./next-queue-entry-panel";
import { QueueServiceActionsPanel } from "./queue-service-actions-panel";
import { sortQueueEntries } from "./queue-formatters";

const today = format(new Date(), "yyyy-MM-dd");

export function QueueServiceDeskScreen() {
  const searchParams = useSearchParams();
  const workspace = useQueueWorkspace();
  const [selectedQueueId, setSelectedQueueId] = useState(searchParams.get("queueId") ?? "");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const hasFacilityScope = Boolean(workspace.activeMembership?.facility);

  const queuesQuery = useQueuesQuery(
    {
      facility_id: workspace.activeMembership?.facility ?? undefined,
      queue_date: today,
    },
    { enabled: workspace.canViewQueues && hasFacilityScope },
  );
  const resolvedQueueId = selectedQueueId || queuesQuery.data?.[0]?.id || "";
  const entriesQuery = useQueueEntriesQuery(
    { queue_id: resolvedQueueId || undefined, active_only: false },
    { enabled: workspace.canViewQueues && Boolean(resolvedQueueId) },
  );
  const nextEntryQuery = useNextQueueEntryQuery(resolvedQueueId || undefined, {
    enabled: workspace.canViewQueues && Boolean(resolvedQueueId),
  });
  const entries = useMemo(() => sortQueueEntries(entriesQuery.data ?? []), [entriesQuery.data]);
  const nextEntry = nextEntryQuery.error?.status === 404 ? null : nextEntryQuery.data ?? entries[0] ?? null;
  const activeSelectedEntryId = selectedEntryId ?? nextEntry?.id ?? entries[0]?.id ?? null;
  const eventsQuery = useQueueEntryEventsQuery(selectedEntryId ?? undefined, {
    enabled: workspace.canViewQueues && Boolean(activeSelectedEntryId),
  });
  const callMutation = useCallQueueEntryMutation();
  const recallMutation = useRecallQueueEntryMutation();
  const skipMutation = useSkipQueueEntryMutation();
  const startMutation = useStartServiceMutation();
  const completeMutation = useCompleteServiceMutation();
  const cancelMutation = useCancelQueueEntryMutation();
  const transferMutation = useTransferQueueEntryMutation();
  const priorityMutation = useChangePriorityMutation();

  const selectedEntry = entries.find((entry) => entry.id === activeSelectedEntryId) ?? null;
  const destinationQueues = (queuesQuery.data ?? []).filter(
    (queue) => queue.id !== resolvedQueueId && queue.status === "open",
  );
  const busy = [
    callMutation,
    recallMutation,
    skipMutation,
    startMutation,
    completeMutation,
    cancelMutation,
    transferMutation,
    priorityMutation,
  ].some((mutation) => mutation.isPending);

  if (workspace.isLoading) {
    return <LoadingState title="Loading service desk" description="Preparing the live queue operations screen." />;
  }
  if (!workspace.canViewQueues) {
    return <ErrorState title="Queue access required" description="You do not have permission to use the service desk." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Queue Service Desk"
        description="Call, recall, skip, transfer, and complete patient service from one operational screen."
      />

      <ResponsiveActionBar>
        <div className="min-w-[280px] flex-1">
          <SelectField
            label="Selected queue"
            value={resolvedQueueId}
            onChange={(event) => {
              setSelectedQueueId(event.target.value);
              setSelectedEntryId(null);
            }}
            options={[
              { label: "Select queue", value: "" },
              ...(queuesQuery.data ?? []).map((queue) => ({
                label: `${queue.service_point_name} · ${queue.specialty_name ?? "General"} · ${queue.status}`,
                value: queue.id,
              })),
            ]}
            disabled={!hasFacilityScope}
          />
        </div>
        <Button variant="secondary" onClick={() => void Promise.all([queuesQuery.refetch(), entriesQuery.refetch(), nextEntryQuery.refetch()])} disabled={!resolvedQueueId}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </ResponsiveActionBar>

      {!hasFacilityScope ? (
        <ScopeNotice
          title="Facility scope required for service desk"
          description="The service desk works against facility-level queues and checked-in patients. Link this account to a facility membership to continue."
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <NextQueueEntryPanel entry={nextEntry} title="Current next patient" />
        <QueueServiceActionsPanel
          selectedEntry={selectedEntry}
          destinationQueues={destinationQueues}
          canCall={workspace.canCallEntries}
          canSkip={workspace.canSkipEntries}
          canStart={workspace.canStartService}
          canComplete={workspace.canCompleteService}
          canCancel={workspace.canCancelEntries}
          canTransfer={workspace.canTransferEntries}
          canChangePriority={workspace.canChangePriority}
          isBusy={busy}
          onCall={async () => {
            if (!selectedEntry) return;
            await callMutation.mutateAsync({ entryId: selectedEntry.id });
          }}
          onRecall={async () => {
            if (!selectedEntry) return;
            await recallMutation.mutateAsync({ entryId: selectedEntry.id });
          }}
          onSkip={async (reason) => {
            if (!selectedEntry) return;
            await skipMutation.mutateAsync({ entryId: selectedEntry.id, payload: { reason } });
          }}
          onStart={async () => {
            if (!selectedEntry) return;
            await startMutation.mutateAsync({ entryId: selectedEntry.id });
          }}
          onComplete={async () => {
            if (!selectedEntry) return;
            await completeMutation.mutateAsync({ entryId: selectedEntry.id });
          }}
          onCancel={async (reason) => {
            if (!selectedEntry || !reason.trim()) {
              toast.error("Please provide a cancellation reason.");
              return;
            }
            await cancelMutation.mutateAsync({ entryId: selectedEntry.id, payload: { cancellation_reason: reason } });
          }}
          onTransfer={async (destinationQueueId, reason) => {
            if (!selectedEntry || !destinationQueueId || !reason.trim()) {
              toast.error("Please choose a destination queue and provide a transfer reason.");
              return;
            }
            await transferMutation.mutateAsync({ entryId: selectedEntry.id, payload: { destination_queue_id: destinationQueueId, transfer_reason: reason } });
          }}
          onChangePriority={async (level, reason) => {
            if (!selectedEntry) return;
            if (level > 0 && !reason.trim()) {
              toast.error("Please provide a reason for non-normal priority.");
              return;
            }
            await priorityMutation.mutateAsync({ entryId: selectedEntry.id, payload: { priority_level: level, priority_reason: reason || "Normal queue flow" } });
          }}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <QueueEntryTable entries={entries} selectedEntryId={activeSelectedEntryId} onSelect={(entry) => setSelectedEntryId(entry.id)} emptyMessage="No queue entries available for the selected queue." />
          <div className="space-y-4 md:hidden">
            {entries.map((entry) => (
              <QueueEntryMobileCard key={entry.id} entry={entry} selected={activeSelectedEntryId === entry.id} onSelect={(selected) => setSelectedEntryId(selected.id)} />
            ))}
          </div>
        </div>
        <QueueEntryEventsPanel events={eventsQuery.data ?? []} />
      </section>
    </PageContainer>
  );
}
