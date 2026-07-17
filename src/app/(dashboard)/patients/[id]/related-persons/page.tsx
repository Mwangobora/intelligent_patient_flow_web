import { PatientRelatedPersonsScreen } from "@/features/patients/components/patient-related-persons-screen";

export default async function PatientRelatedPersonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientRelatedPersonsScreen patientId={id} />;
}
