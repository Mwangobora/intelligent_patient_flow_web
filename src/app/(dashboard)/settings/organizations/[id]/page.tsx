import { SettingsOrganizationsScreen } from "@/features/settings/components/settings-organizations-screen";

export default async function SettingsOrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SettingsOrganizationsScreen organizationId={id} />;
}
