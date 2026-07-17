import { PatientIdentifiersScreen } from "@/features/patients/components/patient-identifiers-screen";

export default async function PatientIdentifiersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientIdentifiersScreen patientId={id} />;
}
