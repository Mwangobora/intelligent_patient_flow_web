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
import { QueueDisplayBoard } from "./queue-display-board";
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
  const resolvedQueueId = selectedQueueId || queuesQuery.data?.[0]?.id || "";
  const entriesQuery = useQueueEntriesQuery(
    { queue_id: resolvedQueueId || undefined, active_only: true },
    {
      enabled: workspace.canViewQueues && Boolean(resolvedQueueId),
      refetchInterval: resolvedQueueId ? 12000 : false,
    },
  );
  const nextEntryQuery = useNextQueueEntryQuery(resolvedQueueId || undefined, {
    enabled: workspace.canViewQueues && Boolean(resolvedQueueId),
    refetchInterval: resolvedQueueId ? 12000 : false,
  });

  const entries = sortQueueEntries(entriesQuery.data ?? []);
  const nextEntry = nextEntryQuery.error?.status === 404 ? null : nextEntryQuery.data ?? entries[0] ?? null;
  const waitingEntries = entries.filter((entry) =>
    ["waiting", "called", "skipped"].includes(entry.status),
  );

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
        value={resolvedQueueId}
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

      <QueueDisplayBoard nowCalling={nextEntry} waitingEntries={waitingEntries} />
    </PageContainer>
  );
}
