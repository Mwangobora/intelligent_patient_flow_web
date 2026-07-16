import { EmptyState } from "@/components/common/empty-state";

import {
  dayOfWeekLabel,
  formatDateLabel,
  formatDateTimeLabel,
  formatTimeRangeLabel,
} from "./practitioner-formatters";
import { LeaveStatusBadge, ShiftStatusBadge } from "./practitioner-status-badges";
import type {
  AvailabilityPeriodRecord,
  LeaveRequestRecord,
  PractitionerShiftRecord,
} from "../types/practitioner.types";

type PractitionerScheduleCalendarProps = {
  availability: AvailabilityPeriodRecord[];
  shifts: PractitionerShiftRecord[];
  leaveRequests: LeaveRequestRecord[];
};

export function PractitionerScheduleCalendar({
  availability,
  shifts,
  leaveRequests,
}: PractitionerScheduleCalendarProps) {
  if (!availability.length && !shifts.length && !leaveRequests.length) {
    return <EmptyState title="No schedule activity yet" description="Availability periods, shifts, and leave requests will appear here." />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Weekly availability</h3>
        <div className="mt-3 space-y-3">
          {availability.map((item) => (
            <div key={item.id} className="rounded-lg bg-secondary/50 px-3 py-3 text-sm">
              <p className="font-medium text-foreground">{dayOfWeekLabel(item.day_of_week)}</p>
              <p className="text-muted-foreground">{formatTimeRangeLabel(item.starts_at, item.ends_at)}</p>
              <p className="text-xs text-muted-foreground">{formatDateLabel(item.valid_from)} to {formatDateLabel(item.valid_until)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Shifts</h3>
        <div className="mt-3 space-y-3">
          {shifts.map((shift) => (
            <div key={shift.id} className="rounded-lg bg-secondary/50 px-3 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{formatDateTimeLabel(shift.starts_at)}</p>
                <ShiftStatusBadge status={shift.status} />
              </div>
              <p className="text-muted-foreground">{shift.service_point_name ?? "No service point"} • {shift.consultation_room_name ?? "No room"}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Leave periods</h3>
        <div className="mt-3 space-y-3">
          {leaveRequests.map((leave) => (
            <div key={leave.id} className="rounded-lg bg-secondary/50 px-3 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{formatDateTimeLabel(leave.starts_at)}</p>
                <LeaveStatusBadge status={leave.status} />
              </div>
              <p className="text-muted-foreground">{formatDateTimeLabel(leave.ends_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
