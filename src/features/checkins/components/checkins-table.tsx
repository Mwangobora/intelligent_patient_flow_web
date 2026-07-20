import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";

import { CheckinMethodBadge, CheckinModeBadge, CheckinStatusBadge } from "./checkin-status-badge";
import { formatCheckinDateTime, getCheckinPatientSummary } from "./checkin-formatters";
import type { CheckinRecord } from "../types/checkin.types";

type CheckinsTableProps = {
  checkins: CheckinRecord[];
  canVoid: boolean;
  onVoid: (checkin: CheckinRecord) => void;
  emptyMessage?: string;
};

export function CheckinsTable({
  checkins,
  canVoid,
  onVoid,
  emptyMessage = "No check-ins found for the selected filters.",
}: CheckinsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Patient", "Appointment", "Facility", "Specialty", "Mode", "Method", "Checked in", "Status", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {checkins.length ? checkins.map((checkin) => (
            <tr key={checkin.id} className="align-top">
              <td className="px-4 py-4 font-medium text-foreground">{getCheckinPatientSummary(checkin)}</td>
              <td className="px-4 py-4">{checkin.appointment_number ?? "Walk-in"}</td>
              <td className="px-4 py-4">{checkin.facility_name}</td>
              <td className="px-4 py-4">{checkin.specialty_name ?? "—"}</td>
              <td className="px-4 py-4"><CheckinModeBadge checkin={checkin} /></td>
              <td className="px-4 py-4"><CheckinMethodBadge method={checkin.checkin_method} /></td>
              <td className="px-4 py-4">{formatCheckinDateTime(checkin.checked_in_at)}</td>
              <td className="px-4 py-4"><CheckinStatusBadge checkin={checkin} /></td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/checkins/${checkin.id}`}><Button variant="secondary"><Eye className="mr-2 h-4 w-4" />View</Button></Link>
                  {!checkin.voided_at ? <Link href="/queue/service-desk"><Button variant="secondary"><Calendar className="mr-2 h-4 w-4" />Add to queue</Button></Link> : null}
                  {canVoid && !checkin.voided_at ? <Button variant="danger" onClick={() => onVoid(checkin)}><Eye className="mr-2 h-4 w-4" />Void</Button> : null}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
