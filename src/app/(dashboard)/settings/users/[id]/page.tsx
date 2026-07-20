import { SettingsUsersScreen } from "@/features/settings/components/settings-users-screen";

export default async function SettingsUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SettingsUsersScreen userId={id} />;
}
