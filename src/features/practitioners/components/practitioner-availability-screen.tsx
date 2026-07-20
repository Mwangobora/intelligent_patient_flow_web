"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { FormSheet } from "@/components/overlays/form-sheet";
import { SelectField } from "@/components/forms/select-field";
import { Button } from "@/components/ui/button";

import { useCreateAvailabilityMutation, useDeactivateAvailabilityMutation } from "../hooks/use-practitioner-mutations";
import { usePractitionerAvailabilityQuery, usePractitionerFacilityAssignmentsQuery } from "../hooks/use-practitioner-queries";
import { usePractitionerWorkspace } from "../hooks/use-practitioner-workspace";
import { PractitionerAvailabilityForm } from "./practitioner-availability-form";
import { PractitionerConfirmDialog } from "./practitioner-confirm-dialog";
import { PractitionerPageTabs } from "./practitioner-page-tabs";
import { dayOfWeekLabel, formatDateLabel, formatTimeRangeLabel } from "./practitioner-formatters";
import type { AvailabilityPeriodRecord } from "../types/practitioner.types";

export function PractitionerAvailabilityScreen() {
  const workspace = usePractitionerWorkspace();
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AvailabilityPeriodRecord | null>(null);
  const assignmentsQuery = usePractitionerFacilityAssignmentsQuery({ organization_id: workspace.activeMembership?.organization, facility_id: workspace.activeMembership?.facility || undefined, is_active: true }, { enabled: workspace.canManageAvailability && Boolean(workspace.activeMembership?.organization) });
  const availabilityQuery = usePractitionerAvailabilityQuery({ facility_id: workspace.activeMembership?.facility || undefined, day_of_week: dayOfWeek ? Number(dayOfWeek) : undefined, is_active: true }, { enabled: workspace.canManageAvailability && Boolean(workspace.activeMembership?.facility) });
  const createMutation = useCreateAvailabilityMutation();
  const deactivateMutation = useDeactivateAvailabilityMutation();

  const grouped = useMemo(() => {
    const items = availabilityQuery.data ?? [];
    return [...items].sort((left, right) => left.day_of_week - right.day_of_week);
  }, [availabilityQuery.data]);

  if (workspace.isLoading) return <LoadingState title="Loading availability" description="Preparing the practitioner availability workspace." />;
  if (!workspace.canManageAvailability) return <ErrorState title="Availability access required" description="You do not have permission to manage practitioner availability." />;

  return (
    <PageContainer className="space-y-6">
      <PractitionerConfirmDialog open={Boolean(deactivateTarget)} title="Deactivate availability?" description="This removes the availability period from active scheduling without deleting its history." confirmLabel="Deactivate availability" isSubmitting={deactivateMutation.isPending} onClose={() => setDeactivateTarget(null)} onConfirm={async () => { if (!deactivateTarget) return; await deactivateMutation.mutateAsync({ id: deactivateTarget.id }); setDeactivateTarget(null); }} />
      <PractitionerPageTabs activeTab="availability" />
      <PageHeader title="Practitioner availability" description="Create weekly availability windows and review active booking availability." actions={<Button onClick={() => setShowCreate(true)}>Create availability</Button>} />
      <ResponsiveFilterPanel title="Availability filters" description="Filter the active list by day of week.">
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField label="Day of week" value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)} options={[{ label: "All days", value: "" }, { label: "Monday", value: "1" }, { label: "Tuesday", value: "2" }, { label: "Wednesday", value: "3" }, { label: "Thursday", value: "4" }, { label: "Friday", value: "5" }, { label: "Saturday", value: "6" }, { label: "Sunday", value: "7" }]} />
        </div>
      </ResponsiveFilterPanel>
      <FormSheet open={showCreate} title="Create availability period" description="Create weekly operational availability used for practitioner scheduling and appointments." onOpenChange={setShowCreate}>
        <PractitionerAvailabilityForm
          assignments={assignmentsQuery.data ?? []}
          isSubmitting={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync({
              practitioner_facility_assignment_id: values.practitioner_facility_assignment_id,
              day_of_week: Number(values.day_of_week),
              starts_at: values.starts_at,
              ends_at: values.ends_at,
              valid_from: values.valid_from,
              valid_until: values.valid_until || null,
              is_available_for_appointments: values.is_available_for_appointments ?? true,
            });
            setShowCreate(false);
          }}
        />
      </FormSheet>
      {availabilityQuery.isLoading ? <LoadingState title="Loading availability" description="Fetching active weekly availability periods." /> : null}
      {availabilityQuery.error ? <ErrorState title="Unable to load availability" description={availabilityQuery.error.message} actionLabel="Retry" onAction={() => void availabilityQuery.refetch()} /> : null}
      {!availabilityQuery.isLoading && !availabilityQuery.error && !grouped.length ? <EmptyState title="No availability found" description="Create an availability period or adjust the day filter." /> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {grouped.map((item) => (
          <SectionCard key={item.id} title={`${dayOfWeekLabel(item.day_of_week)} • ${item.facility_name}`} description={`${formatTimeRangeLabel(item.starts_at, item.ends_at)} • ${formatDateLabel(item.valid_from)} to ${formatDateLabel(item.valid_until)}`} action={item.is_available_for_appointments ? <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Appointment ready</span> : <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Unavailable for appointments</span>}>
            <Button variant="danger" onClick={() => setDeactivateTarget(item)}>Deactivate</Button>
          </SectionCard>
        ))}
      </div>
    </PageContainer>
  );
}
