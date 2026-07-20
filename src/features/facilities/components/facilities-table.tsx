import Link from "next/link";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { FacilityRecord } from "../types/facility.types";
import { formatOptional } from "./facility-formatters";
import { FacilityStatusBadge } from "./facility-status-badge";

type FacilitiesTableProps = {
  facilities: FacilityRecord[];
  canDeactivate: boolean;
  onDeactivate: (facility: FacilityRecord) => void;
};

export function FacilitiesTable({ facilities, canDeactivate, onDeactivate }: FacilitiesTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Facility", "Organization", "Type", "Location", "Status", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {facilities.length ? facilities.map((facility) => (
            <tr key={facility.id} className="align-top">
              <td className="px-4 py-4">
                <div className="font-semibold text-foreground">{facility.name}</div>
                <div className="text-xs text-muted-foreground">{facility.code}</div>
              </td>
              <td className="px-4 py-4">{facility.organization_name}</td>
              <td className="px-4 py-4">{facility.facility_type_name}</td>
              <td className="px-4 py-4">{formatOptional(facility.district ?? facility.region)}</td>
              <td className="px-4 py-4"><FacilityStatusBadge isActive={facility.is_active} /></td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/facilities/${facility.id}`}>
                    <Button variant="secondary"><Building2 className="mr-2 h-4 w-4" />View</Button>
                  </Link>
                  {canDeactivate && facility.is_active ? (
                    <Button variant="danger" onClick={() => onDeactivate(facility)}>Deactivate</Button>
                  ) : null}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No facilities found. The table is ready when backend data is available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
