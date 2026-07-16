"use client";

import { Search, UserSearch } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

import { useDebouncedValue } from "../hooks/use-debounced-value";
import { usePatientsLookupQuery } from "../hooks/use-appointment-queries";
import { formatPersonName } from "./appointment-formatters";

type PatientSearchSelectProps = {
  organizationId?: string;
  facilityId?: string;
  value?: string;
  onChange: (patientId: string) => void;
  label?: string;
  placeholder?: string;
};

export function PatientSearchSelect({
  organizationId,
  facilityId,
  value,
  onChange,
  label = "Patient search",
  placeholder = "Search patient name or number",
}: PatientSearchSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const patientsQuery = usePatientsLookupQuery(
    {
      organization_id: organizationId,
      registered_facility_id: facilityId,
      search: debouncedSearch || undefined,
      is_active: true,
    },
    { enabled: Boolean(organizationId) },
  );

  const selectedPatient = useMemo(
    () => patientsQuery.data?.find((patient) => patient.id === value),
    [patientsQuery.data, value],
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
        />
      </div>

      <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-border bg-card p-2">
        {patientsQuery.data?.length ? (
          patientsQuery.data.slice(0, 8).map((patient) => {
            const patientName = formatPersonName([
              patient.first_name,
              patient.middle_name,
              patient.last_name,
            ]);

            return (
              <button
                key={patient.id}
                type="button"
                onClick={() => onChange(patient.id)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                  value === patient.id ? "bg-secondary" : "hover:bg-secondary/70"
                }`}
              >
                <div className="rounded-lg bg-secondary p-2 text-primary">
                  <UserSearch className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{patientName}</p>
                  <p className="text-xs text-muted-foreground">{patient.patient_number}</p>
                </div>
              </button>
            );
          })
        ) : (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            {patientsQuery.isLoading ? "Searching patients..." : "No patients found."}
          </p>
        )}
      </div>

      {selectedPatient ? (
        <p className="text-xs text-muted-foreground">
          Selected: {formatPersonName([selectedPatient.first_name, selectedPatient.last_name])}
        </p>
      ) : null}
    </div>
  );
}
