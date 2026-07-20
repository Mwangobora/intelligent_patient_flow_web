"use client";

import { PageTabs } from "@/components/navigation/page-tabs";

const tabs = [
  { label: "Facilities", href: "/facilities", value: "list" },
  { label: "Details", href: "", value: "detail" },
  { label: "Departments", href: "departments", value: "departments" },
  { label: "Specialties", href: "specialties", value: "specialties" },
  { label: "Service points", href: "service-points", value: "service-points" },
  { label: "Rooms", href: "rooms", value: "rooms" },
  { label: "Hours", href: "operating-hours", value: "operating-hours" },
  { label: "Exceptions", href: "schedule-exceptions", value: "schedule-exceptions" },
] as const;

type FacilityPageTabsProps = {
  activeTab: (typeof tabs)[number]["value"];
  facilityId?: string;
};

export function FacilityPageTabs({ activeTab, facilityId }: FacilityPageTabsProps) {
  const items = tabs
    .filter((tab) => tab.value === "list" || facilityId)
    .map((tab) => ({
      label: tab.label,
      value: tab.value,
      href: tab.value === "list" ? "/facilities" : `/facilities/${facilityId}/${tab.href}`.replace(/\/$/, ""),
    }));

  return <PageTabs tabs={items} activeTab={activeTab} />;
}
