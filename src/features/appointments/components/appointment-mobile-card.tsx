import Link from "next/link";

import { MobileRecordCard } from "@/components/data-display/mobile-record-card";
import { Button } from "@/components/ui/button";

import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatAppointmentDateTime } from "./appointment-formatters";
import type { AppointmentRecord } from "../types/appointment.types";

type AppointmentMobileCardProps = {
  appointment: AppointmentRecord;
  patientName?: string;
  onCancel: (appointment: AppointmentRecord) => void;
};

export function AppointmentMobileCard({
  appointment,
  patientName,
  onCancel,
}: AppointmentMobileCardProps) {
  return (
    <MobileRecordCard
      title={appointment.appointment_number}
      subtitle={patientName ?? "Patient record"}
      meta={
        <>
          <div className="flex items-center justify-between">
            <span>{appointment.specialty_name}</span>
            <AppointmentStatusBadge status={appointment.status} />
          </div>
          <p>{appointment.facility_name}</p>
          <p>{formatAppointmentDateTime(appointment.scheduled_start)}</p>
          <p>{appointment.practitioner_number ?? "Unassigned practitioner"}</p>
        </>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          <Link href={`/appointments/${appointment.id}`}><Button variant="secondary">View</Button></Link>
          <Link href={`/appointments/${appointment.id}/reschedule`}><Button variant="secondary">Reschedule</Button></Link>
          <Button variant="danger" onClick={() => onCancel(appointment)}>Cancel</Button>
        </div>
      }
    />
  );
}
