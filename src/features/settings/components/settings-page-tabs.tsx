"use client";

import { PageTabs } from "@/components/navigation/page-tabs";

const tabs = [
  { label: "Overview", value: "overview", href: "/settings" },
  { label: "Organizations", value: "organizations", href: "/settings/organizations" },
  { label: "Users", value: "users", href: "/settings/users" },
  { label: "Roles", value: "roles", href: "/settings/roles" },
  { label: "Permissions", value: "permissions", href: "/settings/permissions" },
  { label: "Facility flow", value: "flow", href: "/settings/facility-flow" },
  { label: "Profile", value: "profile", href: "/settings/profile" },
];

export function SettingsPageTabs({ activeTab }: { activeTab: string }) {
  return <PageTabs activeTab={activeTab} tabs={tabs} />;
}
