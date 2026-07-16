"use client";

import {
  CalendarClock,
  FileBarChart,
  Hospital,
  ListOrdered,
  QrCode,
} from "lucide-react";
import { motion } from "motion/react";

const workflowItems = [
  { label: "Appointments", icon: CalendarClock },
  { label: "Check-ins", icon: QrCode },
  { label: "Queue Management", icon: ListOrdered },
  { label: "Reports", icon: FileBarChart },
];

const operationalStats = [
  { label: "Live queues", value: "06" },
  { label: "Smart scheduling", value: "24/7" },
  { label: "Real-time check-ins", value: "< 1m" },
];

export function LoginBrandPanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex h-full w-full items-center bg-foreground px-8 py-10 text-primary-foreground lg:px-12 lg:py-12"
    >
      <div className="flex w-full max-w-[520px] flex-col justify-center gap-8">
        <div className="space-y-5">
          <div className="inline-flex rounded-full bg-primary/16 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Hospital operations platform
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Hospital className="h-7 w-7" />
          </div>
          <div className="space-y-3">
            <h2 className="max-w-lg text-[2rem] font-semibold tracking-tight lg:text-[2.35rem]">
              One workspace for modern patient flow operations.
            </h2>
            <p className="max-w-lg text-sm leading-7 text-primary-foreground/76 lg:text-[15px]">
              Manage appointments, check-ins, queues, practitioners, and reports
              from one secure hospital console.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {operationalStats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 * index, ease: "easeOut" }}
              className="rounded-2xl bg-white/7 px-4 py-4"
            >
              <p className="text-xl font-semibold">{item.value}</p>
              <p className="mt-1 text-sm text-primary-foreground/72">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {workflowItems.map(({ label, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + index * 0.04, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-2xl bg-white/7 px-4 py-3"
            >
              <div className="rounded-xl bg-secondary p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
