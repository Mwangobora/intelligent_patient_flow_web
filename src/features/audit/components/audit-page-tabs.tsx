"use client";

import { PageTabs } from "@/components/navigation/page-tabs";

export function AuditPageTabs({ activeTab }: { activeTab: "logs" | "summary" }) {
  return (
    <PageTabs
      activeTab={activeTab}
      tabs={[
        { label: "Audit logs", value: "logs", href: "/audit-logs" },
        { label: "Summary", value: "summary", href: "/audit-logs/summary" },
      ]}
    />
  );
}
