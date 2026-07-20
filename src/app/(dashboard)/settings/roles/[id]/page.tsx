import { SettingsRolesScreen } from "@/features/settings/components/settings-roles-screen";

export default async function SettingsRoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SettingsRolesScreen roleId={id} />;
}
