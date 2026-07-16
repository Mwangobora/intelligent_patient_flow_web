import Link from "next/link";

import { MobileRecordCard } from "@/components/data-display/mobile-record-card";
import { Button } from "@/components/ui/button";

import { formatPractitionerName } from "./practitioner-formatters";
import type { PractitionerRecord } from "../types/practitioner.types";

type PractitionerMobileCardProps = {
  practitioner: PractitionerRecord;
  onDeactivate: (practitioner: PractitionerRecord) => void;
};

export function PractitionerMobileCard({ practitioner, onDeactivate }: PractitionerMobileCardProps) {
  return (
    <MobileRecordCard
      title={formatPractitionerName(practitioner.first_name, practitioner.middle_name, practitioner.last_name)}
      subtitle={practitioner.practitioner_number}
      meta={
        <>
          <p>{practitioner.practitioner_type_name}</p>
          <p>{practitioner.email ?? "No email"}</p>
          <p>{practitioner.phone_number ?? "No phone"}</p>
        </>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          <Link href={`/practitioners/${practitioner.id}`}><Button variant="secondary">View</Button></Link>
          <Link href={`/practitioners/${practitioner.id}/schedule`}><Button variant="secondary">Schedule</Button></Link>
          {practitioner.is_active ? <Button variant="danger" onClick={() => onDeactivate(practitioner)}>Deactivate</Button> : null}
        </div>
      }
    />
  );
}
