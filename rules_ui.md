Continue the frontend for the Intelligent Patient Flow and Appointment Scheduling System.

Part 1A Design System + Trust Teal/Navy colors is complete.

Now do PART 1B ONLY:
Install required frontend packages and create scalable enterprise folder architecture.

Do not build full pages yet.
Do not build auth yet.
Do not connect real backend endpoints yet.
Do not build dashboard charts yet.
Do not build module screens yet.

Important frontend rules:
- Maximum 150 lines per file , set it no file wile will have 151 lines, all files must be less than that
- Reusable components are required.
- Clean folder structure is required.
- Any developer should understand and continue the project easily.
- Use TypeScript properly.
- Avoid `any`.
- No random colors.
- Use existing Trust Teal + Navy theme tokens.
- No API calls directly inside UI components.
- Server/API state must use TanStack Query.
- Local UI state must use Zustand.
- No auth tokens in localStorage.
- Prepare for HttpOnly cookie auth flow.
- Axios must use withCredentials: true.

PART 1B TASKS

1. Detect package manager.

Use the existing lockfile:
- pnpm-lock.yaml -> use pnpm
- package-lock.json -> use npm
- yarn.lock -> use yarn
- bun.lockb -> use bun

Do not mix package managers.

2. Install required packages.

Install these packages if not already installed:

Core API/state:
- axios
- @tanstack/react-query
- @tanstack/react-query-devtools
- zustand

Tables/charts:
- @tanstack/react-table
- recharts

Forms/validation:
- react-hook-form
- zod
- @hookform/resolvers

Icons/animation/toasts:
- lucide-react
- motion
- sonner

Date utilities:
- date-fns

Do NOT install GSAP now.
Reason:
- Use Motion for React UI animations.
- GSAP can be added later only if we need complex marketing/scroll timeline animations.

3. Inspect backend apps and Swagger/OpenAPI docs if available in the repo.

Create frontend folders based on backend domain modules.

Backend apps are:
- accounts/auth
- facilities
- patients
- practitioners
- scheduling
- checkins
- queueing
- intelligence
- notifications
- reporting
- audit

Create frontend module folders for these, but do not build their full pages yet.

4. Create clean frontend structure.

Use this structure if compatible with the current Next.js project:

src/
  app/
    layout.tsx
    page.tsx

  components/
    common/
    feedback/
    layout/
    navigation/
    data-display/
    forms/
    charts/
    tables/
    providers/

  config/
    app.config.ts
    navigation.config.ts
    theme.config.ts
    permissions.config.ts

  features/
    auth/
      api/
      components/
      hooks/
      schemas/
      stores/
      types/

    dashboard/
      api/
      components/
      hooks/
      types/

    appointments/
      api/
      components/
      hooks/
      schemas/
      types/

    queue/
      api/
      components/
      hooks/
      schemas/
      types/

    checkins/
      api/
      components/
      hooks/
      schemas/
      types/

    patients/
      api/
      components/
      hooks/
      schemas/
      types/

    practitioners/
      api/
      components/
      hooks/
      schemas/
      types/

    facilities/
      api/
      components/
      hooks/
      schemas/
      types/

    intelligence/
      api/
      components/
      hooks/
      schemas/
      types/

    notifications/
      api/
      components/
      hooks/
      schemas/
      types/

    reporting/
      api/
      components/
      hooks/
      schemas/
      types/

    audit/
      api/
      components/
      hooks/
      schemas/
      types/

  lib/
    api/
    query/
    errors/
    formatting/
    permissions/
    routes/
    utils/

  stores/
    use-ui-store.ts

  types/
    api.ts
    common.ts
    pagination.ts
    permissions.ts

If the project already has a different src structure, adapt cleanly but keep the same architecture.

5. Create provider setup.

Create:
- src/components/providers/app-providers.tsx

Include:
- TanStack Query QueryClientProvider
- React Query Devtools only in development
- Sonner Toaster
- any future provider placeholders if needed

Create:
- src/lib/query/query-client.ts

QueryClient defaults:
- staleTime: 60 seconds for normal queries
- gcTime: reasonable
- retry: 1 for queries
- retry: false for mutations if configured separately
- refetchOnWindowFocus: false
- do not aggressively refetch hospital workflow data unless hooks choose to

6. Create Axios foundation.

Create:
- src/lib/api/api-client.ts
- src/lib/api/api-error.ts
- src/lib/api/endpoints.ts

api-client.ts:
- create axios instance
- baseURL from NEXT_PUBLIC_API_BASE_URL
- withCredentials: true
- JSON headers
- response interceptor
- normalize errors using api-error.ts
- do not store tokens
- do not read tokens from localStorage
- prepare 401 handling but do not implement full refresh flow yet

api-error.ts:
- ApiError type
- normalizeApiError
- getErrorMessage

endpoints.ts:
Create grouped endpoint placeholders only:
- auth
- facilities
- patients
- practitioners
- appointments
- checkins
- queueing
- intelligence
- notifications
- reporting
- audit

Do not write every endpoint yet.
Keep it readable.

7. Create query key factory.

Create:
- src/lib/query/query-keys.ts

Use grouped query keys:
- auth
- dashboard
- appointments
- queueing
- checkins
- patients
- practitioners
- facilities
- intelligence
- notifications
- reporting
- audit

Keep it small and scalable.

8. Create Zustand UI store.

Create:
- src/stores/use-ui-store.ts

State:
- sidebarCollapsed
- setSidebarCollapsed
- toggleSidebar
- commandMenuOpen
- setCommandMenuOpen

Rules:
- Do not store server data here.
- Do not store large API responses here.
- Do not store auth token here.
- Keep file small.

9. Create shared types.

Create:
- src/types/api.ts
- src/types/pagination.ts
- src/types/permissions.ts
- src/types/common.ts

Include:
api.ts:
- ApiResponse<T>
- ApiListResponse<T>
- ApiErrorResponse

pagination.ts:
- PaginatedResponse<T>
- PaginationParams

permissions.ts:
- PermissionCode type as string for now
- UserPermissionSet type

common.ts:
- UUID
- ISODateTime
- SelectOption
- StatusVariant

Keep types generic only.
Do not create all domain model types yet.

10. Create app config files.

Create:
- src/config/app.config.ts
- src/config/permissions.config.ts
- src/config/navigation.config.ts

app.config.ts:
- app name
- short name
- API base env accessor
- default date format if useful

permissions.config.ts:
Include permission constants from backend style:
- reporting_analytics.view
- scheduling_appointment.view
- queueing_entry.view
- checkins_checkin.view
- patients_patient.view
- practitioners_practitioner.view
- facilities_facility.view
- reporting_report.view
- audit_log.view

navigation.config.ts:
Create initial nav items:
- Dashboard
- Appointments
- Queue
- Check-ins
- Patients
- Practitioners
- Facilities
- Intelligence
- Notifications
- Reports
- Audit Logs
- Settings

Each item:
- label
- href
- icon name or icon component
- requiredPermission

Do not implement permission filtering yet.
Just prepare config.

11. Create placeholder README for frontend architecture.

Create or update:
- FRONTEND_ARCHITECTURE.md

Include:
- package choices
- folder structure explanation
- TanStack Query vs Zustand rule
- max 150 lines per file rule
- API client rule
- no localStorage token rule
- module folder convention

Keep it clear and practical.

12. Update .env.example.

Add:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

Do not add secrets.

13. Do not build real pages yet.

Only update homepage minimally if needed to confirm providers and no build errors.
Do not create full dashboard UI in this step.

14. Run checks.

Use the detected package manager.

Examples:

npm run lint
npm run build

or:

pnpm lint
pnpm build

Also show installed package versions from package.json.

Stop after PART 1B only and show:
- packages installed
- files/folders created
- provider setup summary
- API client summary
- Zustand store summary
- command results
- any assumptions