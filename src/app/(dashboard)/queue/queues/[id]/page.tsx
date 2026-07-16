import { QueueDetailScreen } from "@/features/queue/components/queue-detail-screen";

type QueueDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function QueueDetailPage({ params }: QueueDetailPageProps) {
  const { id } = await params;
  return <QueueDetailScreen queueId={id} />;
}
