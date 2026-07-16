import { PractitionerDetailScreen } from "@/features/practitioners/components/practitioner-detail-screen";

type PractitionerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PractitionerDetailPage({ params }: PractitionerDetailPageProps) {
  const { id } = await params;
  return <PractitionerDetailScreen practitionerId={id} />;
}
