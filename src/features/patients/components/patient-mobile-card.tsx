import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { PatientRecord } from "../types/patient.types";
import { formatPatientDate, formatPatientRecordName, formatSexCodeLabel } from "./patient-formatters";
import { PatientStatusBadge } from "./patient-status-badge";

type PatientMobileCardProps = {
  patient: PatientRecord;
  canUpdate: boolean;
  canDeactivate: boolean;
  onDeactivate: (patient: PatientRecord) => void;
};

export function PatientMobileCard({
  patient,
  canUpdate,
  canDeactivate,
  onDeactivate,
}: PatientMobileCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{patient.patient_number}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">
            {formatPatientRecordName(patient)}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.phone_number ?? "No phone"} • {patient.email ?? "No email"}
          </p>
        </div>
        <PatientStatusBadge isActive={patient.is_active} />
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><p className="text-muted-foreground">Sex</p><p className="font-medium">{formatSexCodeLabel(patient.sex_code)}</p></div>
        <div><p className="text-muted-foreground">Date of birth</p><p className="font-medium">{formatPatientDate(patient.date_of_birth)}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/patients/${patient.id}`}><Button variant="secondary">View</Button></Link>
        {canUpdate ? <Link href={`/patients/${patient.id}/edit`}><Button variant="secondary">Edit</Button></Link> : null}
        {canDeactivate && patient.is_active ? (
          <Button variant="danger" onClick={() => onDeactivate(patient)}>Deactivate</Button>
        ) : null}
      </div>
    </div>
  );
}
