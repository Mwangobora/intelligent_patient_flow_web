"use client";

import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAppointmentsQuery } from "@/features/appointments/hooks/use-appointment-queries";
import { formatAppointmentDateTime } from "@/features/appointments/components/appointment-formatters";
import { useCheckinsQuery } from "@/features/checkins/hooks/use-checkin-queries";
import { formatCheckinDateTime } from "@/features/checkins/components/checkin-formatters";
import { useQueueEntriesQuery } from "@/features/queue/hooks/use-queue-queries";

import { usePatientDetailQuery } from "../hooks/use-patient-queries";
import { usePatientWorkspace } from "../hooks/use-patient-workspace";
import { formatPatientRecordName } from "./patient-formatters";
import { PatientPageTabs } from "./patient-page-tabs";

export function PatientHistoryScreen({ patientId }: { patientId: string }) {
  const workspace = usePatientWorkspace();
  const patientQuery = usePatientDetailQuery(patientId, { enabled: workspace.canViewPatients });
  const appointmentsQuery = useAppointmentsQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const checkinsQuery = useCheckinsQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });
  const queueEntriesQuery = useQueueEntriesQuery({ patient_id: patientId }, { enabled: workspace.canViewPatients });

  if (workspace.isLoading || patientQuery.isLoading) {
    return <LoadingState title="Loading patient history" description="Fetching appointments, check-ins, and queue activity." />;
  }
  if (!workspace.canViewPatients) {
    return <ErrorState title="Patients access required" description="You do not have permission to review patient workflow history." />;
  }
  if (!patientQuery.data) {
    return <EmptyState title="Patient not found" description="The patient history could not be loaded because the patient record was not found." />;
  }

  return (
    <PageContainer className="space-y-6">
      <PatientPageTabs activeTab="history" patientId={patientId} />
      <PageHeader
        title={`${formatPatientRecordName(patientQuery.data)} History`}
        description="This page uses real scheduling, check-in, and queue endpoints filtered by patient ID. No separate patient-history endpoint is currently required."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Appointments" description="Booking and reschedule history for this patient.">
          <div className="space-y-3">
            {(appointmentsQuery.data ?? []).slice(0, 8).map((appointment) => (
              <div key={appointment.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{appointment.appointment_number}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.specialty_name} • {formatAppointmentDateTime(appointment.scheduled_start)}
                </p>
                <div className="mt-3">
                  <Link href={`/appointments/${appointment.id}`}><Button variant="secondary">View appointment</Button></Link>
                </div>
              </div>
            ))}
            {!appointmentsQuery.data?.length ? <EmptyState title="No appointments" description="No appointment records were found for this patient." /> : null}
          </div>
        </SectionCard>

        <SectionCard title="Check-ins" description="Arrival activity recorded through reception, mobile, or QR workflows.">
          <div className="space-y-3">
            {(checkinsQuery.data ?? []).slice(0, 8).map((checkin) => (
              <div key={checkin.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{checkin.appointment_number ?? "Walk-in check-in"}</p>
                <p className="text-sm text-muted-foreground">
                  {checkin.facility_name} • {formatCheckinDateTime(checkin.checked_in_at)}
                </p>
                <div className="mt-3">
                  <Link href={`/checkins/${checkin.id}`}><Button variant="secondary">View check-in</Button></Link>
                </div>
              </div>
            ))}
            {!checkinsQuery.data?.length ? <EmptyState title="No check-ins" description="No check-in records were found for this patient." /> : null}
          </div>
        </SectionCard>

        <SectionCard title="Queue history" description="Queue entries created after check-in for service-desk and operational workflows.">
          <div className="space-y-3">
            {(queueEntriesQuery.data ?? []).slice(0, 8).map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{entry.display_queue_number}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.service_point_name} • {entry.status.replaceAll("_", " ")}
                </p>
                <div className="mt-3">
                  <Link href={`/queue/queues/${entry.queue}`}><Button variant="secondary">View queue</Button></Link>
                </div>
              </div>
            ))}
            {!queueEntriesQuery.data?.length ? <EmptyState title="No queue history" description="No queue entries were found for this patient." /> : null}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
