import { FacilityServicePointsScreen } from "@/features/facilities/components/facility-service-points-screen";

export default async function FacilityServicePointsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilityServicePointsScreen facilityId={id} />;
}
