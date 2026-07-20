import { FacilitySpecialtiesScreen } from "@/features/facilities/components/facility-specialties-screen";

export default async function FacilitySpecialtiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilitySpecialtiesScreen facilityId={id} />;
}
