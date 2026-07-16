"use client";

import { addDays, format } from "date-fns";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { TextInputField } from "@/components/forms/text-input-field";

import {
  usePractitionerAvailabilityQuery,
  usePractitionerLeaveRequestsQuery,
  usePractitionerShiftsQuery,
} from "../hooks/use-practitioner-queries";
import { usePractitionerWorkspace } from "../hooks/use-practitioner-workspace";
import { PractitionerPageTabs } from "./practitioner-page-tabs";
import { dayOfWeekLabel, formatDateLabel, formatDateTimeLabel, formatTimeRangeLabel } from "./practitioner-formatters";
import { LeaveStatusBadge, ShiftStatusBadge } from "./practitioner-status-badges";

const today = format(new Date(), "yyyy-MM-dd");
const nextWeek = format(addDays(new Date(), 7), "yyyy-MM-dd");

export function PractitionerCalendarScreen() {
  const workspace = usePractitionerWorkspace();
  const [dateRange, setDateRange] = useState({ starts_from: today, ends_to: nextWeek });
  const shiftsQuery = usePractitionerShiftsQuery({ facility_id: workspace.activeMembership?.facility || undefined, starts_from: new Date(`${dateRange.starts_from}T00:00:00`).toISOString(), ends_to: new Date(`${dateRange.ends_to}T23:59:59`).toISOString() }, { enabled: workspace.canManageShifts && Boolean(workspace.activeMembership?.facility) });
  const leaveQuery = usePractitionerLeaveRequestsQuery({ facility_id: workspace.activeMembership?.facility || undefined, starts_from: new Date(`${dateRange.starts_from}T00:00:00`).toISOString(), ends_to: new Date(`${dateRange.ends_to}T23:59:59`).toISOString() }, { enabled: workspace.canManageLeave && Boolean(workspace.activeMembership?.facility) });
  const availabilityQuery = usePractitionerAvailabilityQuery({ facility_id: workspace.activeMembership?.facility || undefined, is_active: true }, { enabled: workspace.canManageAvailability && Boolean(workspace.activeMembership?.facility) });

  const calendarRows = useMemo(() => {
    const shifts = (shiftsQuery.data ?? []).map((shift) => ({ key: shift.id, date: shift.starts_at.slice(0, 10), type: "shift" as const, shift }));
    const leaveRows = (leaveQuery.data ?? []).map((leave) => ({ key: leave.id, date: leave.starts_at.slice(0, 10), type: "leave" as const, leave }));
    return [...shifts, ...leaveRows].sort((left, right) => left.date.localeCompare(right.date));
  }, [leaveQuery.data, shiftsQuery.data]);

  if (workspace.isLoading) return <LoadingState title="Loading practitioner calendar" description="Preparing the combined schedule calendar." />;
  if (!workspace.canViewPractitioners) return <ErrorState title="Practitioner access required" description="You do not have permission to view the practitioner calendar." />;

  return (
    <PageContainer className="space-y-6">
      <PractitionerPageTabs activeTab="calendar" />
      <PageHeader title="Practitioner calendar" description="Review shifts, leave periods, and weekly availability in one staff-friendly calendar view." />
      <ResponsiveFilterPanel title="Calendar range" description="Adjust the date range for the combined practitioner calendar.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextInputField label="Starts from" type="date" value={dateRange.starts_from} onChange={(event) => setDateRange((current) => ({ ...current, starts_from: event.target.value }))} />
          <TextInputField label="Ends to" type="date" value={dateRange.ends_to} onChange={(event) => setDateRange((current) => ({ ...current, ends_to: event.target.value }))} />
        </div>
      </ResponsiveFilterPanel>
      <SectionCard title="Weekly availability reference" description="Recurring availability still applies during the selected date range.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(availabilityQuery.data ?? []).map((availability) => (
            <div key={availability.id} className="rounded-lg border border-border px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{dayOfWeekLabel(availability.day_of_week)}</p>
              <p className="text-muted-foreground">{formatTimeRangeLabel(availability.starts_at, availability.ends_at)}</p>
              <p className="text-xs text-muted-foreground">{formatDateLabel(availability.valid_from)} to {formatDateLabel(availability.valid_until)}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      {shiftsQuery.isLoading || leaveQuery.isLoading ? <LoadingState title="Loading calendar events" description="Fetching shifts and leave events for the selected range." /> : null}
      {shiftsQuery.error || leaveQuery.error ? <ErrorState title="Unable to load practitioner calendar" description={shiftsQuery.error?.message ?? leaveQuery.error?.message ?? "Unknown error"} /> : null}
      {!calendarRows.length ? <EmptyState title="No calendar activity found" description="No shifts or leave requests fall inside the selected date range." /> : null}
      <div className="space-y-4">
        {calendarRows.map((item) => (
          <SectionCard key={item.key} title={item.type === "shift" ? `${item.shift.practitioner_number} • ${item.shift.facility_name}` : item.leave.facility_name} description={item.type === "shift" ? formatDateTimeLabel(item.shift.starts_at) : formatDateTimeLabel(item.leave.starts_at)} action={item.type === "shift" ? <ShiftStatusBadge status={item.shift.status} /> : <LeaveStatusBadge status={item.leave.status} />}>
            {item.type === "shift" ? (
              <p className="text-sm text-muted-foreground">{item.shift.service_point_name ?? "No service point"} • {item.shift.consultation_room_name ?? "No room"}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{item.leave.reason || "No leave reason recorded."}</p>
            )}
          </SectionCard>
        ))}
      </div>
    </PageContainer>
  );
}
