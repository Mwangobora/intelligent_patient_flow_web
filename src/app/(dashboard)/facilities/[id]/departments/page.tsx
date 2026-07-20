import { FacilityDepartmentsScreen } from "@/features/facilities/components/facility-departments-screen";

export default async function FacilityDepartmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilityDepartmentsScreen facilityId={id} />;
}
