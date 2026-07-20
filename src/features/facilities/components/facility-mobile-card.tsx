import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { FacilityRecord } from "../types/facility.types";
import { FacilityStatusBadge } from "./facility-status-badge";

type FacilityMobileCardProps = {
  facility: FacilityRecord;
  canDeactivate: boolean;
  onDeactivate: (facility: FacilityRecord) => void;
};

export function FacilityMobileCard({ facility, canDeactivate, onDeactivate }: FacilityMobileCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">{facility.name}</h3>
          <p className="text-xs text-muted-foreground">{facility.code} · {facility.facility_type_name}</p>
        </div>
        <FacilityStatusBadge isActive={facility.is_active} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{facility.organization_name}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/facilities/${facility.id}`}><Button variant="secondary">View</Button></Link>
        {canDeactivate && facility.is_active ? (
          <Button variant="danger" onClick={() => onDeactivate(facility)}>Deactivate</Button>
        ) : null}
      </div>
    </article>
  );
}
