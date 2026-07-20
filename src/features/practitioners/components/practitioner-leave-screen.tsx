"use client";

import { format } from "date-fns";
import { useState } from "react";

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
  useApproveLeaveMutation,
  useCancelLeaveMutation,
  useRejectLeaveMutation,
  useRequestLeaveMutation,
} from "../hooks/use-practitioner-mutations";
import { usePractitionerFacilityAssignmentsQuery, usePractitionerLeaveRequestsQuery } from "../hooks/use-practitioner-queries";
import { usePractitionerWorkspace } from "../hooks/use-practitioner-workspace";
import { PractitionerConfirmDialog } from "./practitioner-confirm-dialog";
import { PractitionerLeaveForm } from "./practitioner-leave-form";
import { PractitionerPageTabs } from "./practitioner-page-tabs";
import { formatDateTimeLabel } from "./practitioner-formatters";
import { LeaveStatusBadge } from "./practitioner-status-badges";
import type { LeaveRequestRecord, LeaveStatus } from "../types/practitioner.types";

const today = format(new Date(), "yyyy-MM-dd");

type LeaveActionState = {
  mode: "approve" | "reject" | "cancel";
  leave: LeaveRequestRecord;
} | null;

export function PractitionerLeaveScreen() {
  const workspace = usePractitionerWorkspace();
  const [filters, setFilters] = useState<{ status: LeaveStatus | ""; starts_from: string; ends_to: string }>({ status: "", starts_from: today, ends_to: today });
  const [actionState, setActionState] = useState<LeaveActionState>(null);
  const [showCreate, setShowCreate] = useState(false);
  const assignmentsQuery = usePractitionerFacilityAssignmentsQuery({ organization_id: workspace.activeMembership?.organization, facility_id: workspace.activeMembership?.facility || undefined, is_active: true }, { enabled: workspace.canManageLeave && Boolean(workspace.activeMembership?.organization) });
  const leaveQuery = usePractitionerLeaveRequestsQuery({ facility_id: workspace.activeMembership?.facility || undefined, status: filters.status || undefined, starts_from: new Date(`${filters.starts_from}T00:00:00`).toISOString(), ends_to: new Date(`${filters.ends_to}T23:59:59`).toISOString() }, { enabled: workspace.canManageLeave && Boolean(workspace.activeMembership?.facility) });
  const requestMutation = useRequestLeaveMutation();
  const approveMutation = useApproveLeaveMutation();
  const rejectMutation = useRejectLeaveMutation();
  const cancelMutation = useCancelLeaveMutation();

  if (workspace.isLoading) return <LoadingState title="Loading leave requests" description="Preparing the practitioner leave workflow." />;
  if (!workspace.canManageLeave) return <ErrorState title="Leave access required" description="You do not have permission to manage leave requests." />;

  return (
    <PageContainer className="space-y-6">
      <PractitionerConfirmDialog
        open={Boolean(actionState)}
        title={actionState ? `${actionState.mode[0].toUpperCase()}${actionState.mode.slice(1)} leave request?` : ""}
        description="This decision will be recorded in the leave workflow history."
        confirmLabel={actionState ? `${actionState.mode[0].toUpperCase()}${actionState.mode.slice(1)} request` : "Confirm"}
        requireReason={actionState?.mode === "cancel"}
        reasonLabel={actionState?.mode === "cancel" ? "Cancellation reason" : "Decision note"}
        isSubmitting={approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending}
        onClose={() => setActionState(null)}
        onConfirm={async (reason) => {
          if (!actionState) return;
          if (actionState.mode === "approve") await approveMutation.mutateAsync({ id: actionState.leave.id, payload: { decision_note: reason || null } });
          if (actionState.mode === "reject") await rejectMutation.mutateAsync({ id: actionState.leave.id, payload: { decision_note: reason || null } });
          if (actionState.mode === "cancel") await cancelMutation.mutateAsync({ id: actionState.leave.id, payload: { cancellation_reason: reason ?? "" } });
          setActionState(null);
        }}
      />
      <PractitionerPageTabs activeTab="leave" />
      <PageHeader title="Practitioner leave requests" description="Request, approve, reject, and cancel practitioner leave using the real scheduling workflow." actions={<Button onClick={() => setShowCreate(true)}>Request leave</Button>} />
      <ResponsiveFilterPanel title="Leave filters" description="Filter by status and date range.">
        <div className="grid gap-4 lg:grid-cols-3">
          <TextInputField label="Starts from" type="date" value={filters.starts_from} onChange={(event) => setFilters((current) => ({ ...current, starts_from: event.target.value }))} />
          <TextInputField label="Ends to" type="date" value={filters.ends_to} onChange={(event) => setFilters((current) => ({ ...current, ends_to: event.target.value }))} />
          <SelectField label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as LeaveStatus | "" }))} options={[{ label: "All statuses", value: "" }, { label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }, { label: "Cancelled", value: "cancelled" }]} />
        </div>
      </ResponsiveFilterPanel>
      <FormSheet open={showCreate} title="Request leave" description="Create a new practitioner leave request for approval or review." onOpenChange={setShowCreate}>
        <PractitionerLeaveForm
          assignments={assignmentsQuery.data ?? []}
          isSubmitting={requestMutation.isPending}
          onSubmit={async (values) => {
            await requestMutation.mutateAsync({
              practitioner_facility_assignment_id: values.practitioner_facility_assignment_id,
              starts_at: new Date(values.starts_at).toISOString(),
              ends_at: new Date(values.ends_at).toISOString(),
              reason: values.reason || null,
            });
            setShowCreate(false);
          }}
        />
      </FormSheet>
      {leaveQuery.isLoading ? <LoadingState title="Loading leave requests" description="Fetching pending and historical practitioner leave requests." /> : null}
      {leaveQuery.error ? <ErrorState title="Unable to load leave requests" description={leaveQuery.error.message} actionLabel="Retry" onAction={() => void leaveQuery.refetch()} /> : null}
      {!leaveQuery.isLoading && !leaveQuery.error && !(leaveQuery.data ?? []).length ? <EmptyState title="No leave requests found" description="Create a leave request or adjust the current filters." /> : null}
      <div className="space-y-4">
        {(leaveQuery.data ?? []).map((leave) => (
          <SectionCard key={leave.id} title={leave.facility_name} description={`${formatDateTimeLabel(leave.starts_at)} to ${formatDateTimeLabel(leave.ends_at)}`} action={<LeaveStatusBadge status={leave.status} />}>
            <p className="text-sm text-muted-foreground">{leave.reason || "No reason provided."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {leave.status === "pending" ? <Button variant="secondary" onClick={() => setActionState({ mode: "approve", leave })}>Approve</Button> : null}
              {leave.status === "pending" ? <Button variant="secondary" onClick={() => setActionState({ mode: "reject", leave })}>Reject</Button> : null}
              {leave.status === "pending" || leave.status === "approved" ? <Button variant="danger" onClick={() => setActionState({ mode: "cancel", leave })}>Cancel</Button> : null}
            </div>
          </SectionCard>
        ))}
      </div>
    </PageContainer>
  );
}
