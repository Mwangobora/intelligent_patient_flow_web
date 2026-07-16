Build Objective 1 frontend: Online Appointment Scheduling Module for staff side.

This is staff web dashboard, not patient mobile app yet.

Before coding:
- Read backend Swagger/OpenAPI carefully.
- Use the real backend endpoints.
- Do not guess API paths.
- Do not use fake data when API exists.
- If an endpoint is missing or response shape is unclear, report it instead of inventing.

Goal:
Create clean, fast, responsive, interactive appointment scheduling UI for hospital staff.

Scope:
- appointment list
- appointment detail
- create appointment
- reschedule appointment
- cancel appointment
- appointment status history
- available slot selection
- patient search/select inside booking form
- facility/specialty/practitioner/slot selection using backend APIs

Do not build:
- full patient module
- full doctor schedule module
- queue module
- check-in module
- patient mobile app

Use the existing frontend architecture:
features/appointments/
  api/
  hooks/
  schemas/
  types/
  components/

Use professional naming:
- appointments-api.service.ts
- use-appointment-queries.ts
- use-appointment-mutations.ts
- appointment.schemas.ts
- appointment.types.ts

API service:
Create class-based service:

AppointmentApiService

Include only real backend endpoints from Swagger, such as:
- list appointments
- get appointment detail
- create appointment
- update appointment if available
- cancel appointment
- reschedule appointment
- assign practitioner if available
- get appointment status history
- list available slots / appointment slots if available

Do not put React hooks inside service.
Do not put toasts inside service.
Do not put UI logic inside service.

Hooks:
Create query hooks:
- useAppointmentsQuery
- useAppointmentDetailQuery
- useAppointmentStatusHistoryQuery
- useAvailableAppointmentSlotsQuery
- any needed lookup query for facility/specialty/practitioner/patient search

Create mutation hooks:
- useCreateAppointmentMutation
- useCancelAppointmentMutation
- useRescheduleAppointmentMutation
- useUpdateAppointmentMutation only if backend supports it
- useAssignPractitionerMutation only if backend supports it

Mutation behavior:
- show success toast using Sonner
- show friendly error messages
- invalidate related queries
- keep UI responsive
- do not reload the whole page

Forms:
Use existing reusable form components.
Use react-hook-form + zod.
Create clean schemas for:
- create appointment
- cancel appointment
- reschedule appointment

Booking form UX:
- Patient search/select
- Facility select
- Specialty select
- Practitioner select optional if backend supports optional practitioner
- Date/time or slot selection
- Reason for visit optional if backend supports it
- Show available slots after facility/specialty/date selection
- Disable submit until required fields are valid
- Show inline validation errors
- Show backend errors clearly

Important UX:
- Fast loading
- Skeleton loading states
- Empty states
- Error states with retry button
- Toast feedback for actions
- Confirmation dialog for cancel appointment
- Confirmation dialog for reschedule
- No silent failures
- No confusing technical errors shown to user

Custom error messages:
Map backend errors into friendly messages, for example:
- appointment overlap → “This patient or practitioner already has an appointment at this time.”
- slot full → “This appointment slot is already full.”
- invalid facility/specialty → “Selected service is not available at this facility.”
- permission denied → “You do not have permission to perform this action.”
- network error → “Could not connect to the server. Please try again.”
- unknown error → “Something went wrong. Please try again.”

Pages/routes:
Create appointment routes based on current app structure:

/appointments
/appointments/new
/appointments/[id]
/appointments/[id]/reschedule

If route structure already differs, follow existing pattern cleanly.

Appointments list page:
- PageHeader
- filters
- appointment table for desktop
- appointment cards for mobile
- actions:
  - view
  - reschedule
  - cancel
- filters:
  - date range
  - status
  - facility
  - specialty
  - practitioner
  - patient search
- use pagination if backend supports it
- use debounced search for patient/name/appointment number
- do not fetch on every keystroke without debounce

Appointment table:
Use shadcn table or existing table components.
Columns:
- appointment number
- patient
- facility
- specialty
- practitioner
- scheduled time
- status
- actions

Appointment detail page:
Show:
- appointment summary
- patient safe summary
- facility/specialty/practitioner
- scheduled start/end
- current status
- status history
- action buttons based on status:
  - reschedule
  - cancel
Do not show encrypted/sensitive fields.

Create appointment page:
- clean form
- step-like sections if useful:
  1. Patient
  2. Service
  3. Schedule
  4. Confirm
- Keep it simple, not overdesigned.
- Show slot picker clearly.
- Show loading state when fetching available slots.
- If no slots, show empty state with helpful text.

Reschedule page/dialog:
- show current appointment time
- choose new slot/time
- require reason if backend requires it
- confirm before submit
- after success, navigate back to detail page or appointment list

Cancel flow:
- use confirmation dialog
- require cancellation reason if backend requires it
- show destructive button style
- after success, update list/detail state

Responsive/mobile-friendly requirement:
All appointment pages must work well on mobile.

Create reusable responsive components for all future pages:
- responsive-page-shell.tsx
- responsive-filter-panel.tsx or filters-sheet.tsx
- mobile-record-card.tsx
- responsive-action-bar.tsx

Use these in appointments first, but design them generic enough for future modules.

Mobile behavior:
- table becomes card list
- filters move into sheet/drawer
- main actions remain reachable
- form fields stack vertically
- action buttons are easy to tap
- no horizontal scroll
- no cramped text

Icons:
Use relevant lucide icons only:
- CalendarClock
- UserSearch
- Hospital
- Stethoscope
- Clock
- RefreshCw
- XCircle
- CheckCircle
- AlertTriangle
- Search
- Filter

Permissions:
Use backend-style permission names:
- scheduling_appointment.view
- scheduling_appointment.create
- scheduling_appointment.update
- scheduling_appointment.cancel
- scheduling_appointment.reschedule
- scheduling_appointment.assign

If permission filtering is already implemented, apply it.
If not fully implemented, prepare structure and do not overbuild.

Design:
- Trust Teal + Navy
- shadcn/ui
- clean healthcare enterprise UI
- no overdesign
- no heavy gradients
- no random colors
- no fake patient photos
- no childish illustrations
- consistent spacing
- consistent form inputs
- consistent status badges

Status badges:
Use existing StatusBadge.
Support appointment statuses:
- pending
- confirmed
- checked_in
- queued
- in_service
- completed
- cancelled
- no_show
- rescheduled

Performance:
- Use TanStack Query caching.
- Debounce search.
- Do not overfetch.
- Use enabled queries for dependent dropdowns.
- Use staleTime where reasonable.
- Use optimistic UI only if safe.
- Avoid unnecessary re-renders.
- Use useMemo/useCallback only where useful.

Run:
npm run lint
npm run build

Use current package manager if not npm.

Return:
- real appointment endpoints used
- files created/changed
- pages created
- reusable responsive components created
- query hooks created
- mutation hooks created
- forms created
- error handling implemented
- mobile behavior implemented
- command resultsBuild Objective 1 frontend: Online Appointment Scheduling Module for staff side.

This is staff web dashboard, not patient mobile app yet.

Before coding:
- Read backend Swagger/OpenAPI carefully.
- Use the real backend endpoints.
- Do not guess API paths.
- Do not use fake data when API exists.
- If an endpoint is missing or response shape is unclear, report it instead of inventing.

Goal:
Create clean, fast, responsive, interactive appointment scheduling UI for hospital staff.

Scope:
- appointment list
- appointment detail
- create appointment
- reschedule appointment
- cancel appointment
- appointment status history
- available slot selection
- patient search/select inside booking form
- facility/specialty/practitioner/slot selection using backend APIs

Do not build:
- full patient module
- full doctor schedule module
- queue module
- check-in module
- patient mobile app

Use the existing frontend architecture:
features/appointments/
  api/
  hooks/
  schemas/
  types/
  components/

Use professional naming:
- appointments-api.service.ts
- use-appointment-queries.ts
- use-appointment-mutations.ts
- appointment.schemas.ts
- appointment.types.ts

API service:
Create class-based service:

AppointmentApiService

Include only real backend endpoints from Swagger, such as:
- list appointments
- get appointment detail
- create appointment
- update appointment if available
- cancel appointment
- reschedule appointment
- assign practitioner if available
- get appointment status history
- list available slots / appointment slots if available

Do not put React hooks inside service.
Do not put toasts inside service.
Do not put UI logic inside service.

Hooks:
Create query hooks:
- useAppointmentsQuery
- useAppointmentDetailQuery
- useAppointmentStatusHistoryQuery
- useAvailableAppointmentSlotsQuery
- any needed lookup query for facility/specialty/practitioner/patient search

Create mutation hooks:
- useCreateAppointmentMutation
- useCancelAppointmentMutation
- useRescheduleAppointmentMutation
- useUpdateAppointmentMutation only if backend supports it
- useAssignPractitionerMutation only if backend supports it

Mutation behavior:
- show success toast using Sonner
- show friendly error messages
- invalidate related queries
- keep UI responsive
- do not reload the whole page

Forms:
Use existing reusable form components.
Use react-hook-form + zod.
Create clean schemas for:
- create appointment
- cancel appointment
- reschedule appointment

Booking form UX:
- Patient search/select
- Facility select
- Specialty select
- Practitioner select optional if backend supports optional practitioner
- Date/time or slot selection
- Reason for visit optional if backend supports it
- Show available slots after facility/specialty/date selection
- Disable submit until required fields are valid
- Show inline validation errors
- Show backend errors clearly

Important UX:
- Fast loading
- Skeleton loading states
- Empty states
- Error states with retry button
- Toast feedback for actions
- Confirmation dialog for cancel appointment
- Confirmation dialog for reschedule
- No silent failures
- No confusing technical errors shown to user

Custom error messages:
Map backend errors into friendly messages, for example:
- appointment overlap → “This patient or practitioner already has an appointment at this time.”
- slot full → “This appointment slot is already full.”
- invalid facility/specialty → “Selected service is not available at this facility.”
- permission denied → “You do not have permission to perform this action.”
- network error → “Could not connect to the server. Please try again.”
- unknown error → “Something went wrong. Please try again.”

Pages/routes:
Create appointment routes based on current app structure:

/appointments
/appointments/new
/appointments/[id]
/appointments/[id]/reschedule

If route structure already differs, follow existing pattern cleanly.

Appointments list page:
- PageHeader
- filters
- appointment table for desktop
- appointment cards for mobile
- actions:
  - view
  - reschedule
  - cancel
- filters:
  - date range
  - status
  - facility
  - specialty
  - practitioner
  - patient search
- use pagination if backend supports it
- use debounced search for patient/name/appointment number
- do not fetch on every keystroke without debounce

Appointment table:
Use shadcn table or existing table components.
Columns:
- appointment number
- patient
- facility
- specialty
- practitioner
- scheduled time
- status
- actions

Appointment detail page:
Show:
- appointment summary
- patient safe summary
- facility/specialty/practitioner
- scheduled start/end
- current status
- status history
- action buttons based on status:
  - reschedule
  - cancel
Do not show encrypted/sensitive fields.

Create appointment page:
- clean form
- step-like sections if useful:
  1. Patient
  2. Service
  3. Schedule
  4. Confirm
- Keep it simple, not overdesigned.
- Show slot picker clearly.
- Show loading state when fetching available slots.
- If no slots, show empty state with helpful text.

Reschedule page/dialog:
- show current appointment time
- choose new slot/time
- require reason if backend requires it
- confirm before submit
- after success, navigate back to detail page or appointment list

Cancel flow:
- use confirmation dialog
- require cancellation reason if backend requires it
- show destructive button style
- after success, update list/detail state

Responsive/mobile-friendly requirement:
All appointment pages must work well on mobile.

Create reusable responsive components for all future pages:
- responsive-page-shell.tsx
- responsive-filter-panel.tsx or filters-sheet.tsx
- mobile-record-card.tsx
- responsive-action-bar.tsx

Use these in appointments first, but design them generic enough for future modules.

Mobile behavior:
- table becomes card list
- filters move into sheet/drawer
- main actions remain reachable
- form fields stack vertically
- action buttons are easy to tap
- no horizontal scroll
- no cramped text

Icons:
Use relevant lucide icons only:
- CalendarClock
- UserSearch
- Hospital
- Stethoscope
- Clock
- RefreshCw
- XCircle
- CheckCircle
- AlertTriangle
- Search
- Filter

Permissions:
Use backend-style permission names:
- scheduling_appointment.view
- scheduling_appointment.create
- scheduling_appointment.update
- scheduling_appointment.cancel
- scheduling_appointment.reschedule
- scheduling_appointment.assign

If permission filtering is already implemented, apply it.
If not fully implemented, prepare structure and do not overbuild.

Design:
- Trust Teal + Navy
- shadcn/ui
- clean healthcare enterprise UI
- no overdesign
- no heavy gradients
- no random colors
- no fake patient photos
- no childish illustrations
- consistent spacing
- consistent form inputs
- consistent status badges

Status badges:
Use existing StatusBadge.
Support appointment statuses:
- pending
- confirmed
- checked_in
- queued
- in_service
- completed
- cancelled
- no_show
- rescheduled

Performance:
- Use TanStack Query caching.
- Debounce search.
- Do not overfetch.
- Use enabled queries for dependent dropdowns.
- Use staleTime where reasonable.
- Use optimistic UI only if safe.
- Avoid unnecessary re-renders.
- Use useMemo/useCallback only where useful.

Run:
npm run lint
npm run build

Use current package manager if not npm.

Return:
- real appointment endpoints used
- files created/changed
- pages created
- reusable responsive components created
- query hooks created
- mutation hooks created
- forms created
- error handling implemented
- mobile behavior implemented
- command results