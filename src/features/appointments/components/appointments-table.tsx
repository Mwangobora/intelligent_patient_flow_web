import Link from "next/link";

import { Button } from "@/components/ui/button";

import { canCancelAppointment, canRescheduleAppointment } from "./appointment-action-rules";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatAppointmentDateTime } from "./appointment-formatters";
import type { AppointmentRecord } from "../types/appointment.types";

type AppointmentsTableProps = {
  appointments: AppointmentRecord[];
  patientNames: Record<string, string>;
  onCancel: (appointment: AppointmentRecord) => void;
  emptyMessage?: string;
};

export function AppointmentsTable({
  appointments,
  patientNames,
  onCancel,
  emptyMessage = "No appointment records yet.",
}: AppointmentsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Appointment #", "Patient", "Facility", "Specialty", "Practitioner", "Scheduled", "Status", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {appointments.length ? (
            appointments.map((appointment) => (
              <tr key={appointment.id} className="align-top">
                <td className="px-4 py-4 font-semibold text-foreground">{appointment.appointment_number}</td>
                <td className="px-4 py-4">{patientNames[appointment.patient] ?? "Patient record"}</td>
                <td className="px-4 py-4">{appointment.facility_name}</td>
                <td className="px-4 py-4">{appointment.specialty_name}</td>
                <td className="px-4 py-4">{appointment.practitioner_number ?? "Unassigned"}</td>
                <td className="px-4 py-4">{formatAppointmentDateTime(appointment.scheduled_start)}</td>
                <td className="px-4 py-4"><AppointmentStatusBadge status={appointment.status} /></td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/appointments/${appointment.id}`}><Button variant="secondary">View</Button></Link>
                    {canRescheduleAppointment(appointment.status) ? (
                      <Link href={`/appointments/${appointment.id}/reschedule`}>
                        <Button variant="secondary">Reschedule</Button>
                      </Link>
                    ) : null}
                    {canCancelAppointment(appointment.status) ? (
                      <Button variant="danger" onClick={() => onCancel(appointment)}>Cancel</Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
