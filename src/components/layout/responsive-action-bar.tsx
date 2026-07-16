import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ResponsiveActionBarProps = {
  children: ReactNode;
  className?: string;
};

export function ResponsiveActionBar({
  children,
  className,
}: ResponsiveActionBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {children}
    </div>
  );
}
