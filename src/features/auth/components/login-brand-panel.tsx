"use client";

import {
  BrainCircuit,
  CalendarClock,
  FileBarChart,
  Hospital,
  ListOrdered,
  QrCode,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";

const workflowItems = [
  { label: "Appointments", icon: CalendarClock },
  { label: "Check-ins", icon: QrCode },
  { label: "Queue Management", icon: ListOrdered },
  { label: "Doctor Schedules", icon: Stethoscope },
  { label: "Reports", icon: FileBarChart },
  { label: "AI Waiting Time", icon: BrainCircuit },
];

export function LoginBrandPanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="hidden h-full flex-col justify-between rounded-3xl bg-foreground p-8 text-primary-foreground lg:flex"
    >
      <div className="space-y-6">
        <div className="inline-flex rounded-full bg-primary/18 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          Hospital operations platform
        </div>
        <div className="space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Hospital className="h-7 w-7" />
          </div>
          <h2 className="max-w-md text-3xl font-semibold tracking-tight">
            One workspace for the entire patient flow lifecycle.
          </h2>
          <p className="max-w-lg text-sm leading-7 text-primary-foreground/76">
            Coordinate arrivals, appointments, queues, practitioners, and reporting
            from a single professional hospital operations console.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {workflowItems.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/6 px-4 py-4">
            <div className="rounded-xl bg-secondary p-2 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
