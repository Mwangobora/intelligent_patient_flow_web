import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

import type { PatientRecord } from "../types/patient.types";
import { formatPatientDate, formatPatientRecordName } from "./patient-formatters";
import { PatientStatusBadge } from "./patient-status-badge";

type PatientsTableProps = {
  patients: PatientRecord[];
  canUpdate: boolean;
  canDeactivate: boolean;
  onDeactivate: (patient: PatientRecord) => void;
  emptyMessage?: string;
};

export function PatientsTable({
  patients,
  canUpdate,
  canDeactivate,
  onDeactivate,
  emptyMessage = "No patient records found.",
}: PatientsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Patient #", "Full name", "Phone", "Email", "Sex / DOB", "Status", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {patients.length ? patients.map((patient) => (
            <tr key={patient.id} className="align-top">
              <td className="px-4 py-4 font-semibold text-foreground">{patient.patient_number}</td>
              <td className="px-4 py-4">{formatPatientRecordName(patient)}</td>
              <td className="px-4 py-4">{patient.phone_number ?? "—"}</td>
              <td className="px-4 py-4">{patient.email ?? "—"}</td>
              <td className="px-4 py-4">
                <div>{patient.sex_code ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{formatPatientDate(patient.date_of_birth)}</div>
              </td>
              <td className="px-4 py-4"><PatientStatusBadge isActive={patient.is_active} /></td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/patients/${patient.id}`}><Button variant="secondary"><Eye className="mr-2 h-4 w-4" />View</Button></Link>
                  {canUpdate ? <Link href={`/patients/${patient.id}/edit`}><Button variant="secondary">Edit</Button></Link> : null}
                  {canDeactivate && patient.is_active ? (
                    <Button variant="danger" onClick={() => onDeactivate(patient)}>Deactivate</Button>
                  ) : null}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
