"use client";

import { Clock } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { formatAppointmentDateTime } from "./appointment-formatters";
import type { AppointmentSlotRecord } from "../types/appointment.types";

type SlotPickerProps = {
  slots: AppointmentSlotRecord[];
  selectedSlotId?: string;
  isLoading: boolean;
  onSelect: (slot: AppointmentSlotRecord) => void;
};

export function SlotPicker({
  slots,
  selectedSlotId,
  isLoading,
  onSelect,
}: SlotPickerProps) {
  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-secondary" />;
  }

  if (!slots.length) {
    return (
      <EmptyState
        title="No slots available"
        description="Try another date, specialty, or practitioner filter."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          onClick={() => onSelect(slot)}
          className={`rounded-xl border px-4 py-4 text-left transition-colors ${
            selectedSlotId === slot.id
              ? "border-primary bg-secondary"
              : "border-border bg-card hover:bg-secondary/60"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatAppointmentDateTime(slot.starts_at)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{slot.specialty_name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Practitioner {slot.practitioner_number} • {slot.booked_count}/{slot.capacity} booked
          </p>
        </button>
      ))}
    </div>
  );
}
