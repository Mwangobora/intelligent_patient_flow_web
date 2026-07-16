import { AppointmentDetailScreen } from "@/features/appointments/components/appointment-detail-screen";

type AppointmentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  const { id } = await params;
  return <AppointmentDetailScreen appointmentId={id} />;
}
