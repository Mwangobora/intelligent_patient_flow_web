import { CheckinDetailScreen } from "@/features/checkins/components/checkin-detail-screen";

type CheckinDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckinDetailPage({ params }: CheckinDetailPageProps) {
  const { id } = await params;
  return <CheckinDetailScreen checkinId={id} />;
}
