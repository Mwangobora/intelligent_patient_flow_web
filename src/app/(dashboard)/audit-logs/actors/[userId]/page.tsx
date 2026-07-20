import { AuditHistoryScreen } from "@/features/audit/components/audit-history-screen";

export default async function ActorAuditHistoryPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <AuditHistoryScreen mode="actor" userId={userId} />;
}
