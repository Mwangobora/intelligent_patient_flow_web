import { StatusBadge } from "@/components/common/status-badge";

import { formatExportFormat, formatReportType, getReportStatusTone } from "./reporting-formatters";
import type { ExportFormat, ReportExportStatus, ReportType } from "../types/reporting.types";

export function ReportStatusBadge({ status }: { status: ReportExportStatus }) {
  return <StatusBadge label={status.replace("_", " ")} status={getReportStatusTone(status)} />;
}

export function ReportTypeBadge({ reportType }: { reportType: ReportType }) {
  return <StatusBadge label={formatReportType(reportType)} status="info" />;
}

export function ReportFormatBadge({ exportFormat }: { exportFormat: ExportFormat }) {
  return <StatusBadge label={formatExportFormat(exportFormat)} status="neutral" />;
}
