import { AuditHistoryScreen } from "@/features/audit/components/audit-history-screen";

export default async function ResourceAuditHistoryPage({
  params,
}: {
  params: Promise<{ resourceType: string; resourceId: string }>;
}) {
  const { resourceType, resourceId } = await params;
  return <AuditHistoryScreen mode="resource" resourceType={resourceType} resourceId={resourceId} />;
}
