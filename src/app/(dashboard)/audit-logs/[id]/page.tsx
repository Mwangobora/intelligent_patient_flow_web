import { AuditDetailScreen } from "@/features/audit/components/audit-detail-screen";

export default async function AuditLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuditDetailScreen auditLogId={id} />;
}
