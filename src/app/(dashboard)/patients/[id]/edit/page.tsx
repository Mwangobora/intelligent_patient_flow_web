import { PatientFormScreen } from "@/features/patients/components/patient-form-screen";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientFormScreen mode="update" patientId={id} />;
}
