"use client";

import type { ReactNode } from "react";
import { Building2, MapPin, RefreshCw } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ResponsiveActionBar } from "@/components/layout/responsive-action-bar";
import { ResponsivePageShell } from "@/components/layout/responsive-page-shell";
import { Button } from "@/components/ui/button";

import { useFacilityQuery } from "../hooks/use-facility-queries";
import { useFacilityWorkspace } from "../hooks/use-facility-workspace";
import { formatOptional } from "./facility-formatters";
import { FacilityPageTabs } from "./facility-page-tabs";
import { FacilityStatusBadge } from "./facility-status-badge";

export function FacilityDetailScreen({ facilityId }: { facilityId: string }) {
  const workspace = useFacilityWorkspace();
  const facilityQuery = useFacilityQuery(facilityId, { enabled: workspace.canViewFacilities });
  const facility = facilityQuery.data;

  if (workspace.isLoading || facilityQuery.isLoading) {
    return <LoadingState title="Loading facility" description="Fetching facility detail from backend." />;
  }
  if (!workspace.canViewFacilities) {
    return <ErrorState title="Facilities access required" description="You do not have permission to view facilities." />;
  }
  if (facilityQuery.error) {
    return <ErrorState title="Unable to load facility" description={facilityQuery.error.message} actionLabel="Retry" onAction={() => void facilityQuery.refetch()} />;
  }
  if (!facility) {
    return <ErrorState title="Facility not found" description="The backend did not return this facility." />;
  }

  return (
    <PageContainer>
      <ResponsivePageShell
        header={<><FacilityPageTabs activeTab="detail" facilityId={facilityId} /><PageHeader title={facility.name} description={`${facility.code} · ${facility.organization_name}`} /></>}
        actions={<ResponsiveActionBar><Button variant="secondary" onClick={() => void facilityQuery.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button></ResponsiveActionBar>}
      >
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Facility profile" description="Core facility fields returned by the backend detail endpoint.">
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Status" value={<FacilityStatusBadge isActive={facility.is_active} />} />
              <Info label="Primary facility" value={facility.is_primary ? "Yes" : "No"} />
              <Info label="Facility type" value={facility.facility_type_name} />
              <Info label="Timezone" value={facility.timezone} />
              <Info label="Email" value={formatOptional(facility.email)} />
              <Info label="Phone" value={formatOptional(facility.phone_number)} />
              <Info label="License number" value={formatOptional(facility.license_number)} />
              <Info label="Country" value={formatOptional(facility.country_code)} />
            </div>
          </SectionCard>
          <SectionCard title="Location" description="Address and local administrative information.">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-secondary/50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{formatOptional(facility.address_line1)}</p>
                  <p className="text-sm text-muted-foreground">{formatOptional([facility.ward, facility.district, facility.region].filter(Boolean).join(", "))}</p>
                </div>
              </div>
              <Info label="Postal code" value={formatOptional(facility.postal_code)} />
              <Info label="Coordinates" value={`${formatOptional(facility.latitude)} / ${formatOptional(facility.longitude)}`} />
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Management areas" description="Use these tabs to maintain facility structure and schedules.">
          <div className="grid gap-3 md:grid-cols-3">
            {["Departments", "Specialties", "Service points", "Rooms", "Operating hours", "Schedule exceptions"].map((label) => (
              <div key={label} className="rounded-xl border border-border bg-secondary/30 p-4">
                <Building2 className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">Managed with exact facilities backend APIs.</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </ResponsivePageShell>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
