"use client";

import { format } from "date-fns";
import Link from "next/link";
import { ListOrdered, MonitorPlay, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { ScopeNotice } from "@/components/common/scope-notice";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { FormSheet } from "@/components/overlays/form-sheet";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { Button } from "@/components/ui/button";
import { useFacilitiesQuery } from "@/features/facilities/hooks/use-facility-queries";

import { useCreateQueueMutation } from "../hooks/use-queue-mutations";
import {
  useFacilitySpecialtiesLookupQuery,
  useQueueEntriesQuery,
  useQueuesQuery,
  useServicePointsLookupQuery,
} from "../hooks/use-queue-queries";
import { useQueueWorkspace } from "../hooks/use-queue-workspace";
import { QueueCreateForm } from "./queue-create-form";
import { QueueMobileCard } from "./queue-mobile-card";
import { QueueOverviewCards } from "./queue-overview-cards";
import { QueuesTable } from "./queues-table";
import type { QueueEntryStatus, QueueStatus } from "../types/queue.types";

const today = format(new Date(), "yyyy-MM-dd");

export function QueueListScreen() {
  const workspace = useQueueWorkspace();
  const searchParams = useSearchParams();
  const [showCreateQueue, setShowCreateQueue] = useState(false);
  const [filters, setFilters] = useState({
    facility_id: "",
    search: searchParams.get("search") ?? "",
    queue_date: today,
    status: "" as QueueStatus | "",
    service_point_id: "",
    facility_specialty_id: "",
  });

  const hasGlobalAccess = Boolean(workspace.data?.has_global_access || workspace.data?.is_superuser);
  const hasQueueScope = hasGlobalAccess || Boolean(workspace.activeMembership?.facility);
  const scopedFacilityId = hasGlobalAccess ? undefined : workspace.activeMembership?.facility ?? undefined;
  const selectedFacilityId = filters.facility_id || scopedFacilityId;
  const facilitiesQuery = useFacilitiesQuery({ is_active: true }, { enabled: hasGlobalAccess });
  const queuesQuery = useQueuesQuery(
    {
      facility_id: selectedFacilityId,
      queue_date: filters.queue_date,
      status: filters.status,
      service_point_id: filters.service_point_id || undefined,
      facility_specialty_id: filters.facility_specialty_id || undefined,
    },
    { enabled: workspace.canViewQueues && hasQueueScope },
  );
  const entriesQuery = useQueueEntriesQuery(
    {
      facility_id: selectedFacilityId,
      active_only: false,
    },
    { enabled: workspace.canViewQueues && hasQueueScope },
  );
  const servicePointsQuery = useServicePointsLookupQuery(
    {
      facility_id: selectedFacilityId,
      is_active: true,
    },
    { enabled: Boolean(selectedFacilityId) },
  );
  const specialtiesQuery = useFacilitySpecialtiesLookupQuery(
    {
      facility_id: selectedFacilityId,
      is_active: true,
    },
    { enabled: Boolean(selectedFacilityId) },
  );
  const createQueueMutation = useCreateQueueMutation();

  const overview = useMemo(() => {
    const entries = entriesQuery.data ?? [];
    const activeQueues = (queuesQuery.data ?? []).filter((queue) => ["open", "paused"].includes(queue.status)).length;
    const countByStatus = (status: QueueEntryStatus) => entries.filter((entry) => entry.status === status).length;
    const completedToday = entries.filter(
      (entry) => entry.status === "completed" && entry.service_completed_at?.startsWith(filters.queue_date),
    ).length;

    return {
      activeQueues,
      waitingPatients: countByStatus("waiting"),
      calledPatients: countByStatus("called"),
      inServicePatients: countByStatus("in_service"),
      completedToday,
    };
  }, [entriesQuery.data, filters.queue_date, queuesQuery.data]);
  const filteredQueues = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const queues = queuesQuery.data ?? [];
    if (!query) return queues;

    return queues.filter((queue) =>
      [
        queue.service_point_name,
        queue.service_point_code,
        queue.specialty_name,
        queue.facility_name,
        queue.status,
        queue.queue_date,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [filters.search, queuesQuery.data]);

  if (workspace.isLoading) {
    return <LoadingState title="Loading queues" description="Preparing the queue management workspace." />;
  }
  if (!workspace.canViewQueues) {
    return <ErrorState title="Queue access required" description="You do not have permission to view queue operations." />;
  }

  return (
    <PageContainer>
      <ResponsivePageShell
        header={
          <PageHeader
            title="Priority-Aware Queue Management"
            description="Open queues, review waiting patients, and manage operational desk flow."
          />
        }
        actions={
          <ResponsiveActionBar>
            <Link href="/queue/service-desk"><Button><ListOrdered className="mr-2 h-4 w-4" />Service desk</Button></Link>
            {workspace.canManageQueues && Boolean(selectedFacilityId) ? <Button onClick={() => setShowCreateQueue(true)}>Create queue</Button> : null}
            <Link href="/queue/display"><Button variant="secondary"><MonitorPlay className="mr-2 h-4 w-4" />Display</Button></Link>
            <Button variant="secondary" onClick={() => void Promise.all([queuesQuery.refetch(), entriesQuery.refetch(), facilitiesQuery.refetch()])} disabled={!hasQueueScope}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh
            </Button>
          </ResponsiveActionBar>
        }
        filters={
          <ResponsiveFilterPanel title="Queue filters" description="Filter queues by service point, specialty, date, or operational status.">
            <div className="grid gap-4 lg:grid-cols-5">
              <TextInputField
                label="Search"
                placeholder="Service point, code, specialty, status"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
              <TextInputField label="Queue date" type="date" value={filters.queue_date} onChange={(event) => setFilters((current) => ({ ...current, queue_date: event.target.value }))} />
              {hasGlobalAccess ? (
                <SelectField
                  label="Facility"
                  value={filters.facility_id}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      facility_id: event.target.value,
                      service_point_id: "",
                      facility_specialty_id: "",
                    }))
                  }
                  options={[{ label: "All facilities", value: "" }, ...(facilitiesQuery.data ?? []).map((facility) => ({ label: facility.name, value: facility.id }))]}
                />
              ) : null}
              <SelectField
                label="Queue status"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as QueueStatus | "" }))}
                options={[
                  { label: "All statuses", value: "" },
                  { label: "Draft", value: "draft" },
                  { label: "Open", value: "open" },
                  { label: "Paused", value: "paused" },
                  { label: "Closed", value: "closed" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
                disabled={!hasQueueScope}
              />
              <SelectField
                label="Service point"
                value={filters.service_point_id}
                onChange={(event) => setFilters((current) => ({ ...current, service_point_id: event.target.value }))}
                options={[
                  { label: "All service points", value: "" },
                  ...(servicePointsQuery.data ?? []).map((point) => ({ label: `${point.name} (${point.code})`, value: point.id })),
                ]}
                disabled={!selectedFacilityId}
              />
              <SelectField
                label="Specialty queue"
                value={filters.facility_specialty_id}
                onChange={(event) => setFilters((current) => ({ ...current, facility_specialty_id: event.target.value }))}
                options={[
                  { label: "All specialties", value: "" },
                  ...(specialtiesQuery.data ?? []).map((specialty) => ({ label: specialty.specialty_name, value: specialty.id })),
                ]}
                disabled={!selectedFacilityId}
              />
            </div>
          </ResponsiveFilterPanel>
        }
      >
        {!hasQueueScope ? (
          <ScopeNotice
            title="Facility scope required for queue operations"
            description="Queue management uses facility-level service points and checked-in patients. Link this account to a facility membership to start opening queues and serving patients."
          />
        ) : null}

        {workspace.canManageQueues && Boolean(selectedFacilityId) ? (
          <FormSheet open={showCreateQueue} title="Create queue" description="Open a new general or specialty queue for the selected service point." onOpenChange={setShowCreateQueue}>
            <QueueCreateForm
              servicePoints={servicePointsQuery.data ?? []}
              specialties={specialtiesQuery.data ?? []}
              defaultDate={filters.queue_date}
              isSubmitting={createQueueMutation.isPending}
              onSubmit={async (payload) => {
                await createQueueMutation.mutateAsync(payload);
                setShowCreateQueue(false);
              }}
            />
          </FormSheet>
        ) : null}

        <QueueOverviewCards
          activeQueues={overview.activeQueues}
          waitingPatients={overview.waitingPatients}
          calledPatients={overview.calledPatients}
          inServicePatients={overview.inServicePatients}
          completedToday={overview.completedToday}
        />

        {queuesQuery.isLoading ? <LoadingState title="Loading queues" description="Fetching queue records and current activity." /> : null}
        {queuesQuery.error ? (
          <ErrorState
            title="Unable to load queues"
            description={queuesQuery.error.message}
            actionLabel="Retry"
            onAction={() => void queuesQuery.refetch()}
          />
        ) : null}
        {!queuesQuery.isLoading && !queuesQuery.error && hasQueueScope && !filteredQueues.length ? (
          <EmptyState title="No queues found" description="Create a queue or adjust the selected date and service filters." />
        ) : null}

        <QueuesTable
          queues={hasQueueScope ? filteredQueues : []}
          emptyMessage="No facility queue data is available yet."
        />
        <div className="space-y-4 md:hidden">
          {filteredQueues.map((queue) => (
            <QueueMobileCard key={queue.id} queue={queue} />
          ))}
        </div>
      </ResponsivePageShell>
    </PageContainer>
  );
}
