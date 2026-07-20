"use client";

import { PageTabs } from "@/components/navigation/page-tabs";

type IntelligenceTab = "overview" | "predictions" | "forecast" | "slots" | "evaluation";

export function IntelligencePageTabs({ activeTab }: { activeTab: IntelligenceTab }) {
  return (
    <PageTabs
      activeTab={activeTab}
      tabs={[
        { label: "Overview", value: "overview", href: "/intelligence" },
        { label: "Predictions", value: "predictions", href: "/intelligence/predictions" },
        { label: "Arrival forecast", value: "forecast", href: "/intelligence/arrival-forecast" },
        { label: "Slot suggestions", value: "slots", href: "/intelligence/slot-suggestions" },
        { label: "Evaluation", value: "evaluation", href: "/intelligence/evaluation" },
      ]}
    />
  );
}
