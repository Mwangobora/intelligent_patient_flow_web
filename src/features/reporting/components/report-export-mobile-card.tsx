import Link from "next/link";

import { MobileRecordCard } from "@/components/data-display/mobile-record-card";
import { Button } from "@/components/ui/button";

import { ReportFormatBadge, ReportStatusBadge } from "./report-status-badge";
import { formatReportDateTime, formatReportType } from "./reporting-formatters";
import type { ReportExportRecord } from "../types/reporting.types";

type ReportExportMobileCardProps = {
  item: ReportExportRecord;
  canDownload: boolean;
  canCancel: boolean;
  onDownload: (item: ReportExportRecord) => void;
  onCancel: (item: ReportExportRecord) => void;
};

export function ReportExportMobileCard({
  item,
  canDownload,
  canCancel,
  onDownload,
  onCancel,
}: ReportExportMobileCardProps) {
  return (
    <MobileRecordCard
      title={formatReportType(item.report_type)}
      subtitle={item.facility_name ?? item.organization_name}
      meta={
        <>
          <div className="flex items-center justify-between">
            <ReportStatusBadge status={item.status} />
            <ReportFormatBadge exportFormat={item.export_format} />
          </div>
          <p>Generated: {formatReportDateTime(item.generated_at)}</p>
          <p>Expires: {formatReportDateTime(item.expires_at)}</p>
          <p>Rows: {item.row_count ?? "—"}</p>
        </>
      }
      footer={
        <div className="flex flex-wrap gap-2">
          <Link href={`/reports/exports/${item.id}`}><Button variant="secondary">View</Button></Link>
          {canDownload && item.file_available ? <Button variant="secondary" onClick={() => onDownload(item)}>Download</Button> : null}
          {canCancel && (item.status === "pending" || item.status === "processing") ? <Button variant="danger" onClick={() => onCancel(item)}>Cancel</Button> : null}
        </div>
      }
    />
  );
}
