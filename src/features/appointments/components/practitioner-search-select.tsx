"use client";

import { Search, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

import { useDebouncedValue } from "../hooks/use-debounced-value";
import { usePractitionersLookupQuery } from "../hooks/use-appointment-queries";
import { formatPersonName } from "./appointment-formatters";

type PractitionerSearchSelectProps = {
  organizationId?: string;
  facilityId?: string;
  value?: string;
  onChange: (practitionerId: string) => void;
};

export function PractitionerSearchSelect({
  organizationId,
  facilityId,
  value,
  onChange,
}: PractitionerSearchSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const practitionersQuery = usePractitionersLookupQuery(
    {
      organization_id: organizationId,
      facility_id: facilityId,
      search: debouncedSearch || undefined,
      is_active: true,
    },
    { enabled: Boolean(organizationId) },
  );

  const selected = useMemo(
    () => practitionersQuery.data?.find((practitioner) => practitioner.id === value),
    [practitionersQuery.data, value],
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">Practitioner filter</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search practitioner name or number"
        />
      </div>

      <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border bg-card p-2">
        {practitionersQuery.data?.length ? (
          practitionersQuery.data.slice(0, 8).map((practitioner) => (
            <button
              key={practitioner.id}
              type="button"
              onClick={() => onChange(practitioner.id)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                value === practitioner.id ? "bg-secondary" : "hover:bg-secondary/70"
              }`}
            >
              <div className="rounded-lg bg-secondary p-2 text-primary">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatPersonName([
                    practitioner.first_name,
                    practitioner.preferred_name ?? practitioner.middle_name,
                    practitioner.last_name,
                  ])}
                </p>
                <p className="text-xs text-muted-foreground">{practitioner.practitioner_number}</p>
              </div>
            </button>
          ))
        ) : (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            {practitionersQuery.isLoading ? "Searching practitioners..." : "No practitioners found."}
          </p>
        )}
      </div>

      {selected ? (
        <p className="text-xs text-muted-foreground">
          Selected: {formatPersonName([selected.first_name, selected.last_name])}
        </p>
      ) : null}
    </div>
  );
}
