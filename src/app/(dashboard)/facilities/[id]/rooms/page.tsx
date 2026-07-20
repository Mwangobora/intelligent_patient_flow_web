import { FacilityRoomsScreen } from "@/features/facilities/components/facility-rooms-screen";

export default async function FacilityRoomsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilityRoomsScreen facilityId={id} />;
}
