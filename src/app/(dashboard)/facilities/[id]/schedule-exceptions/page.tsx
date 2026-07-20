import { FacilityScheduleExceptionsScreen } from "@/features/facilities/components/facility-schedule-exceptions-screen";

export default async function FacilityScheduleExceptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilityScheduleExceptionsScreen facilityId={id} />;
}
