"use client";

import Link from "next/link";
import { RefreshCw, Smartphone } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SelectField } from "@/components/forms/select-field";
import { TextInputField } from "@/components/forms/text-input-field";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsiveFilterPanel } from "@/components/layout/responsive-filter-panel";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { ConfirmDialog } from "@/components/overlays/confirm-dialog";
import { FormSheet } from "@/components/overlays/form-sheet";
import { Button } from "@/components/ui/button";

import {
  useDeactivatePushDeviceMutation,
  useRegisterPushDeviceMutation,
  useRevokePushDeviceMutation,
  useUpdatePushDeviceLastSeenMutation,
} from "../hooks/use-notification-mutations";
import { useNotificationWorkspace, usePushDevicesQuery } from "../hooks/use-notification-queries";
import type { PushDeviceRecord } from "../types/notification.types";
import { PushDeviceRegisterForm } from "./notification-forms";
import { cleanNotificationPayload, formatNotificationDate, formatNotificationLabel, formatOptional } from "./notification-formatters";

export function PushDevicesScreen() {
  const workspace = useNotificationWorkspace();
  const [showRegister, setShowRegister] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<PushDeviceRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PushDeviceRecord | null>(null);
  const [filters, setFilters] = useState({ user_id: "", active_state: "active" });
  const devicesQuery = usePushDevicesQuery({
    user_id: filters.user_id,
    is_active: filters.active_state === "all" ? undefined : filters.active_state === "active",
    revoked: filters.active_state === "revoked" ? true : undefined,
  }, { enabled: workspace.canViewDevices });
  const registerMutation = useRegisterPushDeviceMutation();
  const revokeMutation = useRevokePushDeviceMutation();
  const deactivateMutation = useDeactivatePushDeviceMutation();
  const lastSeenMutation = useUpdatePushDeviceLastSeenMutation();

  if (workspace.isLoading) return <LoadingState title="Loading push devices" description="Checking push device permissions." />;
  if (!workspace.canViewDevices) return <ErrorState title="Push device access required" description="You do not have permission to view push devices." />;

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<PageHeader title="Push Devices" description="Manage registered push devices without exposing raw tokens, encrypted tokens, or token hashes." />}
        actions={<ResponsiveActionBar>
          <Link href="/notifications"><Button variant="secondary">Back to notifications</Button></Link>
          {workspace.canManageDevices ? <Button onClick={() => setShowRegister(true)}><Smartphone className="mr-2 h-4 w-4" />Register device</Button> : null}
          <Button variant="secondary" onClick={() => void devicesQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </ResponsiveActionBar>}
        filters={<ResponsiveFilterPanel title="Device filters" description="Filter push devices by user and lifecycle status.">
          <div className="grid gap-4 lg:grid-cols-3">
            <TextInputField label="User ID" value={filters.user_id} onChange={(event) => setFilters((current) => ({ ...current, user_id: event.target.value }))} />
            <SelectField label="Status" value={filters.active_state} onChange={(event) => setFilters((current) => ({ ...current, active_state: event.target.value }))} options={[{ label: "Active only", value: "active" }, { label: "Inactive only", value: "inactive" }, { label: "Revoked only", value: "revoked" }, { label: "All devices", value: "all" }]} />
          </div>
        </ResponsiveFilterPanel>}
      >
        {devicesQuery.isLoading ? <LoadingState title="Loading devices" description="Fetching registered push devices." /> : null}
        {devicesQuery.error ? <ErrorState title="Unable to load push devices" description={devicesQuery.error.message} actionLabel="Retry" onAction={() => void devicesQuery.refetch()} /> : null}
        {!devicesQuery.isLoading && !devicesQuery.error ? <PushDevicesTable devices={devicesQuery.data ?? []} canManage={workspace.canManageDevices} onLastSeen={(device) => void lastSeenMutation.mutateAsync(device.id)} onRevoke={setRevokeTarget} onDeactivate={setDeactivateTarget} /> : null}
      </ResponsivePageShell>
      <FormSheet open={showRegister} title="Register push device" description="Raw token is accepted once and stored encrypted/hashed by the backend." onOpenChange={setShowRegister}>
        <PushDeviceRegisterForm isSubmitting={registerMutation.isPending} onSubmit={async (values) => { await registerMutation.mutateAsync(cleanNotificationPayload(values)); setShowRegister(false); }} />
      </FormSheet>
      <ConfirmDialog open={Boolean(revokeTarget)} title="Revoke push device?" description="Revoked devices are inactive and cannot receive push notifications." confirmLabel="Revoke device" isSubmitting={revokeMutation.isPending} onClose={() => setRevokeTarget(null)} onConfirm={async () => { if (!revokeTarget) return; await revokeMutation.mutateAsync(revokeTarget.id); setRevokeTarget(null); }} />
      <ConfirmDialog open={Boolean(deactivateTarget)} title="Deactivate push device?" description="This marks the device inactive without deleting it." confirmLabel="Deactivate device" isSubmitting={deactivateMutation.isPending} onClose={() => setDeactivateTarget(null)} onConfirm={async () => { if (!deactivateTarget) return; await deactivateMutation.mutateAsync(deactivateTarget.id); setDeactivateTarget(null); }} />
    </PageContainer>
  );
}

function PushDevicesTable({ devices, canManage, onLastSeen, onRevoke, onDeactivate }: { devices: PushDeviceRecord[]; canManage: boolean; onLastSeen: (device: PushDeviceRecord) => void; onRevoke: (device: PushDeviceRecord) => void; onDeactivate: (device: PushDeviceRecord) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="hidden min-w-full divide-y divide-border text-sm md:table">
        <thead className="bg-secondary/60 text-left text-muted-foreground">
          <tr><th className="px-4 py-3 font-medium">Platform</th><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Device</th><th className="px-4 py-3 font-medium">Last seen</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {devices.map((device) => <tr key={device.id}><td className="px-4 py-4 font-medium">{formatNotificationLabel(device.platform)}</td><td className="px-4 py-4">{device.user}</td><td className="px-4 py-4">{formatOptional(device.device_name)} · {formatOptional(device.app_version)}</td><td className="px-4 py-4">{formatNotificationDate(device.last_seen_at)}</td><td className="px-4 py-4">{device.revoked_at ? "Revoked" : device.is_active ? "Active" : "Inactive"}</td><td className="px-4 py-4"><DeviceActions device={device} canManage={canManage} onLastSeen={onLastSeen} onRevoke={onRevoke} onDeactivate={onDeactivate} /></td></tr>)}
          {!devices.length ? <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No push devices found.</td></tr> : null}
        </tbody>
      </table>
      <div className="divide-y divide-border md:hidden">
        {devices.map((device) => <article key={device.id} className="space-y-3 p-4"><div><p className="font-semibold">{formatNotificationLabel(device.platform)}</p><p className="text-sm text-muted-foreground">{formatOptional(device.device_name)} · {formatOptional(device.app_version)}</p></div><p className="text-sm text-muted-foreground">Last seen: {formatNotificationDate(device.last_seen_at)}</p><p className="text-sm text-muted-foreground">Status: {device.revoked_at ? "Revoked" : device.is_active ? "Active" : "Inactive"}</p><DeviceActions device={device} canManage={canManage} onLastSeen={onLastSeen} onRevoke={onRevoke} onDeactivate={onDeactivate} /></article>)}
        {!devices.length ? <p className="p-6 text-center text-sm text-muted-foreground">No push devices found.</p> : null}
      </div>
    </div>
  );
}

function DeviceActions({ device, canManage, onLastSeen, onRevoke, onDeactivate }: { device: PushDeviceRecord; canManage: boolean; onLastSeen: (device: PushDeviceRecord) => void; onRevoke: (device: PushDeviceRecord) => void; onDeactivate: (device: PushDeviceRecord) => void }) {
  if (!canManage) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => onLastSeen(device)}>Update last seen</Button>
      {device.is_active && !device.revoked_at ? <Button variant="danger" onClick={() => onRevoke(device)}>Revoke</Button> : null}
      {device.is_active ? <Button variant="danger" onClick={() => onDeactivate(device)}>Deactivate</Button> : null}
    </div>
  );
}
