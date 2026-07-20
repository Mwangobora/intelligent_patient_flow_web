import { FacilityDetailScreen } from "@/features/facilities/components/facility-detail-screen";

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilityDetailScreen facilityId={id} />;
}
