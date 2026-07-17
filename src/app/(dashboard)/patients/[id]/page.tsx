import { PatientDetailScreen } from "@/features/patients/components/patient-detail-screen";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientDetailScreen patientId={id} />;
}
