"use client";

import { Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/features/appointments/hooks/use-debounced-value";

import { usePatientSearchQuery } from "../hooks/use-patient-queries";
import { formatPatientRecordName } from "./patient-formatters";

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
  const patientsQuery = usePatientSearchQuery(
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

      <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border bg-card p-2">
        {patientsQuery.data?.length ? (
          patientsQuery.data.slice(0, 8).map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => onChange(patient.id)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                value === patient.id ? "bg-secondary" : "hover:bg-secondary/70"
              }`}
            >
              <div className="rounded-lg bg-secondary p-2 text-primary">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {formatPatientRecordName(patient)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {patient.patient_number} • {patient.phone_number ?? "No phone"}
                </p>
              </div>
            </button>
          ))
        ) : (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            {patientsQuery.isLoading ? "Searching patients..." : "No patients found."}
          </p>
        )}
      </div>

      {selectedPatient ? (
        <p className="text-xs text-muted-foreground">
          Selected: {formatPatientRecordName(selectedPatient)} • {selectedPatient.patient_number}
        </p>
      ) : null}
    </div>
  );
}
