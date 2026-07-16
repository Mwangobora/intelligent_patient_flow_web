export const apiEndpoints = {
  auth: {
    base: "/accounts",
    docs: "/docs/",
  },
  facilities: { base: "/facilities" },
  patients: { base: "/patients" },
  practitioners: { base: "/practitioners" },
  appointments: { base: "/scheduling/appointments" },
  checkins: { base: "/checkins" },
  queueing: { base: "/queueing" },
  intelligence: { base: "/intelligence" },
  notifications: { base: "/notifications" },
  reporting: { base: "/reporting" },
  audit: { base: "/audit" },
} as const;
