import { AppointmentFormScreen } from "@/features/appointments/components/appointment-form-screen";

type RescheduleAppointmentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RescheduleAppointmentPage({
  params,
}: RescheduleAppointmentPageProps) {
  const { id } = await params;
  return <AppointmentFormScreen mode="reschedule" appointmentId={id} />;
}
