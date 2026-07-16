import { PageTabs } from "@/components/navigation/page-tabs";

type PractitionerPageTabsProps = {
  activeTab: "list" | "detail" | "schedule" | "shifts" | "availability" | "leave" | "calendar";
  practitionerId?: string;
};

export function PractitionerPageTabs({ activeTab, practitionerId }: PractitionerPageTabsProps) {
  return (
    <PageTabs
      activeTab={activeTab}
      tabs={[
        { label: "Practitioners", value: "list", href: "/practitioners" },
        { label: "Shifts", value: "shifts", href: "/practitioners/shifts" },
        { label: "Availability", value: "availability", href: "/practitioners/availability" },
        { label: "Leave", value: "leave", href: "/practitioners/leave-requests" },
        { label: "Calendar", value: "calendar", href: "/practitioners/calendar" },
        { label: "Profile", value: "detail", href: practitionerId ? `/practitioners/${practitionerId}` : "#", disabled: !practitionerId },
        { label: "Schedule", value: "schedule", href: practitionerId ? `/practitioners/${practitionerId}/schedule` : "#", disabled: !practitionerId },
      ]}
    />
  );
}
