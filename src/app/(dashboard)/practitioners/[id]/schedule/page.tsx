import { PractitionerScheduleScreen } from "@/features/practitioners/components/practitioner-schedule-screen";

type PractitionerSchedulePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PractitionerSchedulePage({ params }: PractitionerSchedulePageProps) {
  const { id } = await params;
  return <PractitionerScheduleScreen practitionerId={id} />;
}
