import { PageTabs } from "@/components/navigation/page-tabs";

type PatientPageTabsProps = {
  activeTab: "list" | "detail" | "identifiers" | "related" | "history" | "edit" | "new";
  patientId?: string;
};

export function PatientPageTabs({ activeTab, patientId }: PatientPageTabsProps) {
  return (
    <PageTabs
      activeTab={activeTab}
      tabs={[
        { label: "Patients", value: "list", href: "/patients" },
        { label: "New patient", value: "new", href: "/patients/new" },
        {
          label: "Profile",
          value: "detail",
          href: patientId ? `/patients/${patientId}` : "#",
          disabled: !patientId,
        },
        {
          label: "Edit",
          value: "edit",
          href: patientId ? `/patients/${patientId}/edit` : "#",
          disabled: !patientId,
        },
        {
          label: "Identifiers",
          value: "identifiers",
          href: patientId ? `/patients/${patientId}/identifiers` : "#",
          disabled: !patientId,
        },
        {
          label: "Related persons",
          value: "related",
          href: patientId ? `/patients/${patientId}/related-persons` : "#",
          disabled: !patientId,
        },
        {
          label: "History",
          value: "history",
          href: patientId ? `/patients/${patientId}/history` : "#",
          disabled: !patientId,
        },
      ]}
    />
  );
}
