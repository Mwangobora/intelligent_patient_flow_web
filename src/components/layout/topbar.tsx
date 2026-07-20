"use client";

import { Bell, PanelLeftOpen, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rawQuery = search.trim();
    if (!rawQuery) return;

    const prefixMatch = rawQuery.match(/^([a-z-]+)\s*:\s*(.+)$/i);
    const prefix = prefixMatch?.[1].toLowerCase();
    const query = (prefixMatch?.[2] ?? rawQuery).trim();
    const encodedQuery = encodeURIComponent(query);
    const targetPath =
      prefix === "appointment" || prefix === "appointments" || prefix === "appt"
        ? "/appointments"
        : prefix === "queue" || prefix === "queues"
          ? "/queue/queues"
          : prefix === "checkin" || prefix === "checkins"
            ? "/checkins"
            : prefix === "practitioner" || prefix === "practitioners" || prefix === "doctor"
              ? "/practitioners"
              : "/patients";

    router.push(`${targetPath}?search=${encodedQuery}`);
  };

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

        <form
          onSubmit={handleSearchSubmit}
          className="hidden min-w-[320px] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 lg:flex"
          role="search"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Search patients, appointments, queues"
            aria-label="Search hospital workspace"
          />
        </form>

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
