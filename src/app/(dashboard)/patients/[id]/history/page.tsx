import { PatientHistoryScreen } from "@/features/patients/components/patient-history-screen";

export default async function PatientHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientHistoryScreen patientId={id} />;
}
