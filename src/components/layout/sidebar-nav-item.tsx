import Link from "next/link";

import type { NavigationItem } from "@/config/navigation.config";
import { cn } from "@/lib/utils";

import { navigationIcons } from "./navigation-icons";

type SidebarNavItemProps = {
  item: NavigationItem;
  active: boolean;
  collapsed: boolean;
};

export function SidebarNavItem({
  item,
  active,
  collapsed,
}: SidebarNavItemProps) {
  const Icon = navigationIcons[item.icon];

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      className={cn(
        "flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors",
        "text-primary-foreground/72 hover:bg-secondary hover:text-foreground",
        active &&
          "!bg-secondary !text-foreground shadow-sm ring-1 ring-primary/15 [&_svg]:!text-foreground",
        collapsed ? "justify-center" : "gap-3",
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}
