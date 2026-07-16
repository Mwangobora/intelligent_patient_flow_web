"use client";

import { motion } from "motion/react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { navigationItems } from "@/config/navigation.config";
import { useUiStore } from "@/stores/use-ui-store";

import { SidebarNavItem } from "./sidebar-nav-item";

type SidebarProps = {
  pathname: string;
};

export function Sidebar({ pathname }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 88 : 264 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky top-0 hidden h-screen shrink-0 overflow-y-auto border-r border-white/10 bg-foreground px-3 py-4 text-primary-foreground md:flex md:flex-col"
    >
      <div className="flex items-center justify-between gap-3 px-2 pb-4">
        {!sidebarCollapsed ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Patient Flow
            </p>
            <p className="mt-1 text-xs text-primary-foreground/68">
              Hospital operations
            </p>
          </div>
        ) : <div className="h-10" />}
        <button
          type="button"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navigationItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <SidebarNavItem
              key={item.href}
              item={item}
              active={active}
              collapsed={sidebarCollapsed}
            />
          );
        })}
      </nav>
    </motion.aside>
  );
}
