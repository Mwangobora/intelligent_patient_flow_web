"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { Button } from "@/components/ui/button";
import { permissionCodes } from "@/config/permissions.config";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-auth-queries";

import { useCancelAppointmentMutation } from "../hooks/use-appointment-mutations";
import { useAppointmentDetailQuery, useAppointmentStatusHistoryQuery, usePatientDetailQuery } from "../hooks/use-appointment-queries";
import { canCancelAppointment, canRescheduleAppointment } from "./appointment-action-rules";
import { AppointmentCancelDialog } from "./appointment-cancel-dialog";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatAppointmentDateTime } from "./appointment-formatters";
import { AppointmentStatusHistory } from "./appointment-status-history";

type AppointmentDetailScreenProps = {
  appointmentId: string;
};

export function AppointmentDetailScreen({ appointmentId }: AppointmentDetailScreenProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUserQuery();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const appointmentQuery = useAppointmentDetailQuery(appointmentId);
  const historyQuery = useAppointmentStatusHistoryQuery(appointmentId);
  const patientQuery = usePatientDetailQuery(appointmentQuery.data?.patient, { enabled: Boolean(appointmentQuery.data?.patient) });
  const cancelMutation = useCancelAppointmentMutation(appointmentId);

  const canCancel =
    currentUser?.is_staff ||
    !currentUser?.permissions ||
    currentUser.permissions.includes(permissionCodes.schedulingAppointmentCancel);

  if (appointmentQuery.isLoading) {
    return <LoadingState title="Loading appointment" description="Fetching appointment details and status history." />;
  }
  if (appointmentQuery.error) {
    return <ErrorState title="Unable to load appointment" description={appointmentQuery.error.message} actionLabel="Retry" onAction={() => void appointmentQuery.refetch()} />;
  }
  if (!appointmentQuery.data) {
    return <EmptyState title="Appointment not found" description="This appointment record is no longer available." />;
  }

  const appointment = appointmentQuery.data;
  const patientName = patientQuery.data
    ? [patientQuery.data.first_name, patientQuery.data.middle_name, patientQuery.data.last_name].filter(Boolean).join(" ")
    : "Patient record";
  const isReschedulable = canRescheduleAppointment(appointment.status);
  const isCancellable = canCancel && canCancelAppointment(appointment.status);

  return (
    <PageContainer className="space-y-6">
      <AppointmentCancelDialog
        open={showCancelDialog}
        appointmentNumber={appointment.appointment_number}
        isSubmitting={cancelMutation.isPending}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={async (reason) => {
          await cancelMutation.mutateAsync({ cancellation_reason: reason });
          setShowCancelDialog(false);
          router.refresh();
        }}
      />
      <PageHeader title={`Appointment ${appointment.appointment_number}`} description="Review appointment status, assigned service details, and workflow history." />
      <ResponsiveActionBar>
        <Link href="/appointments"><Button variant="secondary">Back to list</Button></Link>
        {isReschedulable ? <Link href={`/appointments/${appointment.id}/reschedule`}><Button variant="secondary">Reschedule</Button></Link> : null}
        {isCancellable ? <Button variant="danger" onClick={() => setShowCancelDialog(true)}>Cancel appointment</Button> : null}
      </ResponsiveActionBar>

      <SectionCard title="Appointment Summary" description="Current booking information from the scheduling service.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div><p className="text-sm text-muted-foreground">Patient</p><p className="mt-1 font-medium">{patientName}</p></div>
          <div><p className="text-sm text-muted-foreground">Facility</p><p className="mt-1 font-medium">{appointment.facility_name}</p></div>
          <div><p className="text-sm text-muted-foreground">Service</p><p className="mt-1 font-medium">{appointment.specialty_name}</p></div>
          <div><p className="text-sm text-muted-foreground">Scheduled start</p><p className="mt-1 font-medium">{formatAppointmentDateTime(appointment.scheduled_start)}</p></div>
          <div><p className="text-sm text-muted-foreground">Scheduled end</p><p className="mt-1 font-medium">{formatAppointmentDateTime(appointment.scheduled_end)}</p></div>
          <div><p className="text-sm text-muted-foreground">Status</p><div className="mt-1"><AppointmentStatusBadge status={appointment.status} /></div></div>
          <div><p className="text-sm text-muted-foreground">Booking channel</p><p className="mt-1 font-medium">{appointment.booking_channel}</p></div>
          <div><p className="text-sm text-muted-foreground">Practitioner</p><p className="mt-1 font-medium">{appointment.practitioner_number ?? "Unassigned"}</p></div>
          <div><p className="text-sm text-muted-foreground">Slot status</p><p className="mt-1 font-medium">{appointment.slot_status ?? "Not linked"}</p></div>
          {appointment.rescheduled_from ? (
            <div>
              <p className="text-sm text-muted-foreground">Rescheduled from</p>
              <Link href={`/appointments/${appointment.rescheduled_from}`} className="mt-1 inline-flex font-medium text-primary hover:text-primary/85">
                View original appointment
              </Link>
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="Status History" description="Append-only status transitions recorded by the backend workflow.">
        <AppointmentStatusHistory history={historyQuery.data} isLoading={historyQuery.isLoading} errorMessage={historyQuery.error?.message} onRetry={() => void historyQuery.refetch()} />
      </SectionCard>
    </PageContainer>
  );
}
