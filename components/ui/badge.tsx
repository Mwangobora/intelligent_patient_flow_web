import type { HTMLAttributes } from "react";

import type { StatusTone } from "@/config/theme.config";
import { cn } from "@/lib/utils";

const badgeTones: Record<StatusTone, string> = {
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/25 bg-warning/10 text-warning",
  danger: "border-danger/20 bg-danger/10 text-danger",
  info: "border-info/20 bg-info/10 text-info",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
};

export function Badge({ className, tone = "info", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}
