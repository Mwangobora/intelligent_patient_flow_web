"use client";

import { CalendarRange, Filter } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DashboardFilterBarProps = {
  dateFrom: string;
  dateTo: string;
  scopeLabel: string;
  facilityPlaceholder: string;
  dateError?: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
};

export function DashboardFilterBar({
  dateFrom,
  dateTo,
  scopeLabel,
  facilityPlaceholder,
  dateError,
  onDateFromChange,
  onDateToChange,
}: DashboardFilterBarProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              <span>Dashboard filters</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Viewing <span className="font-medium text-foreground">{scopeLabel}</span>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:min-w-[720px]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Date from</span>
              <Input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Date to</span>
              <Input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Facility filter</span>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={facilityPlaceholder} disabled />
              </div>
            </label>
          </div>
        </div>

        {dateError ? (
          <p className="mt-3 text-sm text-danger">{dateError}</p>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarRange className="h-4 w-4 text-primary" />
            <span>Date filters update the live operational summaries below.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
