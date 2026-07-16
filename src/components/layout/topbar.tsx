"use client";

import { Bell, PanelLeftOpen, Search, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/use-ui-store";

type TopbarProps = {
  pageTitle: string;
  userDisplayName?: string;
};

export function Topbar({
  pageTitle,
  userDisplayName = "Operations Admin",
}: TopbarProps) {
  const { toggleSidebar } = useUiStore();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <Button
          variant="secondary"
          className="h-10 w-10 px-0"
          aria-label="Toggle navigation"
          onClick={toggleSidebar}
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Operations workspace
          </p>
          <p className="truncate text-sm text-muted-foreground">{pageTitle}</p>
        </div>

        <div className="hidden min-w-[280px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 lg:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Search patients, appointments, queues
          </span>
        </div>

        <Button variant="secondary" className="h-10 w-10 px-0" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="secondary" className="gap-2" aria-label="User menu">
          <UserRound className="h-4 w-4" />
          <span className="hidden sm:inline">{userDisplayName}</span>
        </Button>
      </div>
    </header>
  );
}
