import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ReportFormatBadge, ReportStatusBadge } from "./report-status-badge";
import { formatReportDateTime, formatReportType } from "./reporting-formatters";
import type { ReportExportRecord } from "../types/reporting.types";

type ReportExportTableProps = {
  exports: ReportExportRecord[];
  canDownload: boolean;
  canCancel: boolean;
  onDownload: (item: ReportExportRecord) => void;
  onCancel: (item: ReportExportRecord) => void;
  emptyMessage?: string;
};

export function ReportExportTable({
  exports,
  canDownload,
  canCancel,
  onDownload,
  onCancel,
  emptyMessage = "No report exports found for the selected filters.",
}: ReportExportTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr>
            {["Report", "Format", "Status", "Facility", "Generated", "Expires", "Rows", "Actions"].map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {exports.length ? exports.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="px-4 py-4 font-medium text-foreground">{formatReportType(item.report_type)}</td>
              <td className="px-4 py-4"><ReportFormatBadge exportFormat={item.export_format} /></td>
              <td className="px-4 py-4"><ReportStatusBadge status={item.status} /></td>
              <td className="px-4 py-4">{item.facility_name ?? item.organization_name}</td>
              <td className="px-4 py-4">{formatReportDateTime(item.generated_at)}</td>
              <td className="px-4 py-4">{formatReportDateTime(item.expires_at)}</td>
              <td className="px-4 py-4">{item.row_count ?? "—"}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/reports/exports/${item.id}`}><Button variant="secondary">View</Button></Link>
                  {canDownload && item.file_available ? <Button variant="secondary" onClick={() => onDownload(item)}>Download</Button> : null}
                  {canCancel && (item.status === "pending" || item.status === "processing") ? <Button variant="danger" onClick={() => onCancel(item)}>Cancel</Button> : null}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
