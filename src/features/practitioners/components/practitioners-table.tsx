import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";

import { formatPractitionerName } from "./practitioner-formatters";
import type { PractitionerRecord } from "../types/practitioner.types";

type PractitionersTableProps = {
  practitioners: PractitionerRecord[];
  onDeactivate: (practitioner: PractitionerRecord) => void;
};

export function PractitionersTable({ practitioners, onDeactivate }: PractitionersTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Practitioner", "Number", "Type", "Email", "Phone", "Status", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {practitioners.map((practitioner) => (
            <tr key={practitioner.id}>
              <td className="px-4 py-4 font-medium text-foreground">{formatPractitionerName(practitioner.first_name, practitioner.middle_name, practitioner.last_name)}</td>
              <td className="px-4 py-4">{practitioner.practitioner_number}</td>
              <td className="px-4 py-4">{practitioner.practitioner_type_name}</td>
              <td className="px-4 py-4">{practitioner.email ?? "—"}</td>
              <td className="px-4 py-4">{practitioner.phone_number ?? "—"}</td>
              <td className="px-4 py-4">{practitioner.is_active ? "Active" : "Inactive"}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/practitioners/${practitioner.id}`}><Button variant="secondary"><Eye className="mr-2 h-4 w-4" />View</Button></Link>
                  <Link href={`/practitioners/${practitioner.id}/schedule`}><Button variant="secondary"><Calendar className="mr-2 h-4 w-4" />Schedule</Button></Link>
                  {practitioner.is_active ? <Button variant="danger" onClick={() => onDeactivate(practitioner)}>Deactivate</Button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
