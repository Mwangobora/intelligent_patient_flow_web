import { FacilityOperatingHoursScreen } from "@/features/facilities/components/facility-operating-hours-screen";

export default async function FacilityOperatingHoursPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilityOperatingHoursScreen facilityId={id} />;
}
