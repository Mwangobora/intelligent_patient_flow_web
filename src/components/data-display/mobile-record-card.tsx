import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type MobileRecordCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  footer?: ReactNode;
};

export function MobileRecordCard({
  title,
  subtitle,
  meta,
  footer,
}: MobileRecordCardProps) {
  return (
    <Card className="md:hidden">
      <CardContent className="space-y-4 p-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
        </div>
        {meta ? <div className="space-y-2 text-sm text-foreground">{meta}</div> : null}
        {footer ? <div className="border-t border-border pt-3">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
