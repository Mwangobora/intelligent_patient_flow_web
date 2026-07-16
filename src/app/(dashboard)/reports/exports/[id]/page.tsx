import { ReportExportDetailScreen } from "@/features/reporting/components/report-export-detail-screen";

type ReportExportDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportExportDetailPage({ params }: ReportExportDetailPageProps) {
  const { id } = await params;
  return <ReportExportDetailScreen exportId={id} />;
}
