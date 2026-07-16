import Link from "next/link";

import { MobileRecordCard } from "@/components/data-display/mobile-record-card";
import { Button } from "@/components/ui/button";

import { CheckinMethodBadge, CheckinModeBadge, CheckinStatusBadge } from "./checkin-status-badge";
import { formatCheckinDateTime, getCheckinPatientSummary } from "./checkin-formatters";
import type { CheckinRecord } from "../types/checkin.types";

type CheckinMobileCardProps = {
  checkin: CheckinRecord;
  canVoid: boolean;
  onVoid: (checkin: CheckinRecord) => void;
};

export function CheckinMobileCard({ checkin, canVoid, onVoid }: CheckinMobileCardProps) {
  return (
    <MobileRecordCard
      title={getCheckinPatientSummary(checkin)}
      subtitle={checkin.appointment_number ?? "Walk-in check-in"}
      meta={
        <>
          <div className="flex items-center justify-between">
            <CheckinStatusBadge checkin={checkin} />
            <CheckinMethodBadge method={checkin.checkin_method} />
          </div>
          <div className="flex items-center justify-between">
            <span>{checkin.facility_name}</span>
            <CheckinModeBadge checkin={checkin} />
          </div>
          <p>{checkin.specialty_name ?? "General service"}</p>
          <p>{formatCheckinDateTime(checkin.checked_in_at)}</p>
        </>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          <Link href={`/checkins/${checkin.id}`}><Button variant="secondary">View</Button></Link>
          {!checkin.voided_at ? <Link href="/queue/service-desk"><Button variant="secondary">Add to queue</Button></Link> : null}
          {canVoid && !checkin.voided_at ? <Button variant="danger" onClick={() => onVoid(checkin)}>Void</Button> : null}
        </div>
      }
    />
  );
}
