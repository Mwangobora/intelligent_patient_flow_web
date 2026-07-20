"use client";

import Link from "next/link";
import { Building2, KeyRound, Settings, ShieldCheck, SlidersHorizontal, UserCog, Users } from "lucide-react";

import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { SectionCard } from "@/components/common/section-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

import { useSettingsWorkspace } from "../hooks/use-settings-queries";
import { SettingsPageTabs } from "./settings-page-tabs";

const cards = [
  { title: "Organizations", description: "Manage tenant organizations and registration details.", href: "/settings/organizations", icon: Building2 },
  { title: "Users & Access", description: "Create users and review memberships and roles.", href: "/settings/users", icon: Users },
  { title: "Roles", description: "Configure dynamic business authorization roles.", href: "/settings/roles", icon: ShieldCheck },
  { title: "Permissions", description: "Review and create dynamic module.action permissions.", href: "/settings/permissions", icon: KeyRound },
  { title: "Facility Flow", description: "Tune queue, booking, reminder, and check-in timing rules.", href: "/settings/facility-flow", icon: SlidersHorizontal },
  { title: "Profile", description: "Update your own account profile and password.", href: "/settings/profile", icon: UserCog },
];

export function SettingsHomeScreen() {
  const workspace = useSettingsWorkspace();
  if (workspace.isLoading) return <LoadingState title="Loading settings" description="Checking settings permissions." />;
  if (!workspace.canManageSettings) return <ErrorState title="Settings access required" description="You do not have permission to manage settings." />;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageTabs activeTab="overview" />
      <PageHeader title="Settings" description="Administrative configuration for organizations, users, roles, permissions, facility flow, and your account." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <SectionCard key={card.href} title={card.title} description={card.description}>
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-xl bg-secondary p-3 text-primary"><Icon className="h-5 w-5" /></div>
                <Link href={card.href}><Button variant="secondary">Open</Button></Link>
              </div>
            </SectionCard>
          );
        })}
      </div>
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <Settings className="mr-2 inline h-4 w-4 text-primary" />Only pages backed by real backend endpoints are included.
      </div>
    </PageContainer>
  );
}
