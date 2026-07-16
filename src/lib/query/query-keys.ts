const createModuleKeys = <T extends string>(module: T) => ({
  all: [module] as const,
  lists: () => [module, "list"] as const,
  detail: (id: string) => [module, "detail", id] as const,
});

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    currentUser: () => ["auth", "current-user"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    overview: (scope: string) => ["dashboard", "overview", scope] as const,
    appointments: (scope: string) => ["dashboard", "appointments", scope] as const,
    queues: (scope: string) => ["dashboard", "queues", scope] as const,
    checkins: (scope: string) => ["dashboard", "checkins", scope] as const,
    practitioners: (scope: string) => ["dashboard", "practitioners", scope] as const,
    intelligence: (scope: string) => ["dashboard", "intelligence", scope] as const,
  },
  appointments: createModuleKeys("appointments"),
  queueing: createModuleKeys("queueing"),
  checkins: createModuleKeys("checkins"),
  patients: createModuleKeys("patients"),
  practitioners: createModuleKeys("practitioners"),
  facilities: createModuleKeys("facilities"),
  intelligence: createModuleKeys("intelligence"),
  notifications: createModuleKeys("notifications"),
  reporting: createModuleKeys("reporting"),
  audit: createModuleKeys("audit"),
};
