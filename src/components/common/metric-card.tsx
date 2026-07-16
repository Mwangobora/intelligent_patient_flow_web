import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: {
    direction: "up" | "down";
    label: string;
  };
};

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: MetricCardProps) {
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;
  const trendColor = trend?.direction === "down" ? "text-warning" : "text-success";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <CardTitle className="text-3xl">{value}</CardTitle>
        </div>
        <div className="rounded-lg bg-secondary p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{description}</p>
        {trend ? (
          <div className={`flex items-center gap-2 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{trend.label}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
