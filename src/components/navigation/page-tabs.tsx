import Link from "next/link";

import { cn } from "@/lib/utils";

type PageTab = {
  label: string;
  value: string;
  href: string;
  badgeCount?: number;
  disabled?: boolean;
};

type PageTabsProps = {
  tabs: PageTab[];
  activeTab: string;
};

export function PageTabs({ tabs, activeTab }: PageTabsProps) {
  return (
    <div className="overflow-x-auto border-b border-border">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const active = tab.value === activeTab;

          return (
            <Link
              key={tab.value}
              href={tab.disabled ? "#" : tab.href}
              aria-disabled={tab.disabled}
              className={cn(
                "inline-flex items-center gap-2 rounded-t-lg border border-transparent px-4 py-3 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-secondary hover:text-foreground",
                active && "border-border border-b-background bg-card text-primary",
                tab.disabled && "pointer-events-none opacity-50",
              )}
            >
              <span>{tab.label}</span>
              {tab.badgeCount !== undefined ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground">
                  {tab.badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
