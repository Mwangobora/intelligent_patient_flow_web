"use client";

import { format } from "date-fns";
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
import { TextInputField } from "@/components/forms/text-input-field";
import { Button } from "@/components/ui/button";

import {
  useCancelShiftMutation,
  useCompleteShiftMutation,
  useCreateShiftMutation,
  useStartShiftMutation,
} from "../hooks/use-practitioner-mutations";
import {
  useConsultationRoomsLookupQuery,
  usePractitionerDepartmentAssignmentsQuery,
  usePractitionerFacilityAssignmentsQuery,
  usePractitionerShiftsQuery,
  useServicePointsLookupQuery,
} from "../hooks/use-practitioner-queries";
import { usePractitionerWorkspace } from "../hooks/use-practitioner-workspace";
import { PractitionerConfirmDialog } from "./practitioner-confirm-dialog";
import { PractitionerPageTabs } from "./practitioner-page-tabs";
import { PractitionerShiftForm } from "./practitioner-shift-form";
import { ShiftStatusBadge } from "./practitioner-status-badges";
import { formatDateTimeLabel } from "./practitioner-formatters";
import type { ShiftStatus } from "../types/practitioner.types";

const today = format(new Date(), "yyyy-MM-dd");

export function PractitionerShiftsScreen() {
  const workspace = usePractitionerWorkspace();
  const [filters, setFilters] = useState<{ status: ShiftStatus | ""; starts_from: string; ends_to: string; service_point_id: string }>({ status: "", starts_from: today, ends_to: today, service_point_id: "" });
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const assignmentsQuery = usePractitionerFacilityAssignmentsQuery({ organization_id: workspace.activeMembership?.organization, facility_id: workspace.activeMembership?.facility || undefined, is_active: true }, { enabled: workspace.canManageShifts && Boolean(workspace.activeMembership?.organization) });
  const departmentAssignmentsQuery = usePractitionerDepartmentAssignmentsQuery({ organization_id: workspace.activeMembership?.organization, facility_id: workspace.activeMembership?.facility || undefined, is_active: true }, { enabled: workspace.canManageShifts && Boolean(workspace.activeMembership?.organization) });
  const servicePointsQuery = useServicePointsLookupQuery({ facility_id: workspace.activeMembership?.facility || undefined, is_active: true }, { enabled: Boolean(workspace.activeMembership?.facility) });
  const roomsQuery = useConsultationRoomsLookupQuery({ facility_id: workspace.activeMembership?.facility || undefined, is_active: true }, { enabled: Boolean(workspace.activeMembership?.facility) });
  const shiftsQuery = usePractitionerShiftsQuery({ facility_id: workspace.activeMembership?.facility || undefined, status: filters.status || undefined, service_point_id: filters.service_point_id || undefined, starts_from: new Date(`${filters.starts_from}T00:00:00`).toISOString(), ends_to: new Date(`${filters.ends_to}T23:59:59`).toISOString() }, { enabled: workspace.canManageShifts && Boolean(workspace.activeMembership?.facility), refetchInterval: 30_000 });

  const createShiftMutation = useCreateShiftMutation();
  const cancelShiftMutation = useCancelShiftMutation();
  const startShiftMutation = useStartShiftMutation();
  const completeShiftMutation = useCompleteShiftMutation();
  const cancelTarget = useMemo(() => (shiftsQuery.data ?? []).find((item) => item.id === cancelTargetId) ?? null, [cancelTargetId, shiftsQuery.data]);

  if (workspace.isLoading) return <LoadingState title="Loading shifts" description="Preparing the practitioner shift management workspace." />;
  if (!workspace.canManageShifts) return <ErrorState title="Shift access required" description="You do not have permission to manage practitioner shifts." />;

  return (
    <PageContainer className="space-y-6">
      <PractitionerConfirmDialog open={Boolean(cancelTarget)} title="Cancel shift?" description="This records the cancellation and keeps the shift history." confirmLabel="Cancel shift" requireReason reasonLabel="Cancellation reason" isSubmitting={cancelShiftMutation.isPending} onClose={() => setCancelTargetId(null)} onConfirm={async (reason) => { if (!cancelTarget) return; await cancelShiftMutation.mutateAsync({ id: cancelTarget.id, payload: { cancellation_reason: reason ?? "" } }); setCancelTargetId(null); }} />
      <PractitionerPageTabs activeTab="shifts" />
      <PageHeader title="Practitioner shifts" description="Create, start, complete, and cancel practitioner shifts without leaving the staff dashboard." actions={<Button onClick={() => setShowCreate(true)}>Create shift</Button>} />
      <ResponsiveFilterPanel title="Shift filters" description="Filter by status, day range, and service point.">
        <div className="grid gap-4 lg:grid-cols-4">
          <TextInputField label="Starts from" type="date" value={filters.starts_from} onChange={(event) => setFilters((current) => ({ ...current, starts_from: event.target.value }))} />
          <TextInputField label="Ends to" type="date" value={filters.ends_to} onChange={(event) => setFilters((current) => ({ ...current, ends_to: event.target.value }))} />
          <SelectField label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ShiftStatus | "" }))} options={[{ label: "All statuses", value: "" }, { label: "Scheduled", value: "scheduled" }, { label: "In progress", value: "in_progress" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }]} />
          <SelectField label="Service point" value={filters.service_point_id} onChange={(event) => setFilters((current) => ({ ...current, service_point_id: event.target.value }))} options={[{ label: "All service points", value: "" }, ...(servicePointsQuery.data ?? []).map((item) => ({ label: item.name, value: item.id }))]} />
        </div>
      </ResponsiveFilterPanel>
      <FormSheet open={showCreate} title="Create shift" description="Assign a practitioner to a staffed operational shift." onOpenChange={setShowCreate}>
        <PractitionerShiftForm
          assignments={assignmentsQuery.data ?? []}
          departmentAssignments={departmentAssignmentsQuery.data ?? []}
          servicePoints={servicePointsQuery.data ?? []}
          rooms={roomsQuery.data ?? []}
          isSubmitting={createShiftMutation.isPending}
          onSubmit={async (values) => {
            await createShiftMutation.mutateAsync({
              practitioner_facility_assignment_id: values.practitioner_facility_assignment_id,
              practitioner_department_assignment_id: values.practitioner_department_assignment_id || null,
              service_point_id: values.service_point_id || null,
              consultation_room_id: values.consultation_room_id || null,
              starts_at: new Date(values.starts_at).toISOString(),
              ends_at: new Date(values.ends_at).toISOString(),
              accepts_appointments: values.accepts_appointments ?? true,
              notes: values.notes || null,
            });
            setShowCreate(false);
          }}
        />
      </FormSheet>
      {shiftsQuery.isLoading ? <LoadingState title="Loading shifts" description="Fetching scheduled and active shifts." /> : null}
      {shiftsQuery.error ? <ErrorState title="Unable to load shifts" description={shiftsQuery.error.message} actionLabel="Retry" onAction={() => void shiftsQuery.refetch()} /> : null}
      {!shiftsQuery.isLoading && !shiftsQuery.error && !(shiftsQuery.data ?? []).length ? <EmptyState title="No shifts found" description="Create a shift or adjust the filters." /> : null}
      <div className="space-y-4">
        {(shiftsQuery.data ?? []).map((shift) => (
          <SectionCard key={shift.id} title={`${shift.practitioner_number} • ${shift.facility_name}`} description={`${formatDateTimeLabel(shift.starts_at)} to ${formatDateTimeLabel(shift.ends_at)}`} action={<ShiftStatusBadge status={shift.status} />}>
            <div className="flex flex-wrap gap-2">
              {shift.status === "scheduled" ? <Button variant="secondary" onClick={() => void startShiftMutation.mutateAsync({ id: shift.id })}>Start shift</Button> : null}
              {shift.status === "in_progress" ? <Button variant="secondary" onClick={() => void completeShiftMutation.mutateAsync({ id: shift.id })}>Complete shift</Button> : null}
              {shift.status !== "completed" && shift.status !== "cancelled" ? <Button variant="danger" onClick={() => setCancelTargetId(shift.id)}>Cancel shift</Button> : null}
            </div>
          </SectionCard>
        ))}
      </div>
    </PageContainer>
  );
}
