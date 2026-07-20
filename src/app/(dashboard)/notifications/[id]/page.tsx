import { NotificationDetailScreen } from "@/features/notifications/components/notification-detail-screen";

export default async function NotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NotificationDetailScreen notificationId={id} />;
}
