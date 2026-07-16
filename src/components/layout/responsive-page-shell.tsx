import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ResponsivePageShellProps = {
  header: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ResponsivePageShell({
  header,
  filters,
  actions,
  children,
  className,
}: ResponsivePageShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {header}
      {actions}
      {filters}
      {children}
    </div>
  );
}
