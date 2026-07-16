"use client";

import { format } from "date-fns";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SelectField } from "@/components/forms/select-field";

import { useNextQueueEntryQuery, useQueueEntriesQuery, useQueuesQuery } from "../hooks/use-queue-queries";
import { useQueueWorkspace } from "../hooks/use-queue-workspace";
import { QueueEntryMobileCard } from "./queue-entry-mobile-card";
import { QueueEntryTable } from "./queue-entry-table";
import { NextQueueEntryPanel } from "./next-queue-entry-panel";
import { sortQueueEntries } from "./queue-formatters";

const today = format(new Date(), "yyyy-MM-dd");

export function QueueDisplayScreen() {
  const workspace = useQueueWorkspace();
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const hasFacilityScope = Boolean(workspace.activeMembership?.facility);
  const queuesQuery = useQueuesQuery(
    {
      facility_id: workspace.activeMembership?.facility ?? undefined,
      queue_date: today,
    },
    { enabled: workspace.canViewQueues && hasFacilityScope },
  );
  const entriesQuery = useQueueEntriesQuery(
    { queue_id: selectedQueueId || undefined, active_only: true },
    { enabled: workspace.canViewQueues && Boolean(selectedQueueId) },
  );
  const nextEntryQuery = useNextQueueEntryQuery(selectedQueueId || undefined, {
    enabled: workspace.canViewQueues && Boolean(selectedQueueId),
  });

  const entries = sortQueueEntries(entriesQuery.data ?? []);
  const nextEntry = nextEntryQuery.error?.status === 404 ? null : nextEntryQuery.data ?? entries[0] ?? null;

  if (workspace.isLoading) {
    return <LoadingState title="Loading queue display" description="Preparing the live queue board." />;
  }
  if (!workspace.canViewQueues) {
    return <ErrorState title="Queue access required" description="You do not have permission to view queue displays." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title="Queue Display"
        description="A clean read-only board for the next patient and the current waiting list."
      />

      {!hasFacilityScope ? (
        <ScopeNotice
          title="Facility scope required for queue display"
          description="Queue displays are rendered from facility-level open queues. Attach this account to a facility membership to continue."
        />
      ) : null}

      <SelectField
        label="Queue"
        value={selectedQueueId}
        onChange={(event) => setSelectedQueueId(event.target.value)}
        options={[
          { label: "Select queue", value: "" },
          ...(queuesQuery.data ?? []).map((queue) => ({
            label: `${queue.service_point_name} · ${queue.specialty_name ?? "General"}`,
            value: queue.id,
          })),
        ]}
        disabled={!hasFacilityScope}
      />

      <NextQueueEntryPanel entry={nextEntry} title="Now calling" />

      <QueueEntryTable entries={entries} emptyMessage="No active queue entries to display." />
      <div className="space-y-4 md:hidden">
        {entries.map((entry) => (
          <QueueEntryMobileCard key={entry.id} entry={entry} />
        ))}
      </div>
    </PageContainer>
  );
}
