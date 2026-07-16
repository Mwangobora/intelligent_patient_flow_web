Build Objective 3 frontend: Doctor Schedule Management Module for staff side.

Before coding:
- Read backend Swagger/OpenAPI carefully.
- Use real backend endpoints.
- Do not guess API paths.
- Do not use fake data when API exists.
- Report unclear/missing endpoints instead of inventing.

Goal:
Create a clean, fast, responsive doctor schedule management UI for hospital staff.

This module manages:
- practitioners/doctors
- practitioner facility assignments
- practitioner department assignments
- practitioner specialty assignments
- practitioner availability
- practitioner shifts
- consultation room assignment
- leave requests
- schedule calendar

This is staff dashboard, not patient mobile app.

Do not build:
- appointment booking forms
- queue service desk
- full check-in module
- notification module
- reporting module

Use existing frontend architecture:

features/practitioners/
  api/
    practitioners-api.service.ts
  hooks/
    use-practitioner-queries.ts
    use-practitioner-mutations.ts
  schemas/
    practitioner.schemas.ts
  types/
    practitioner.types.ts
  components/

Use class-based API service:

PractitionersApiService

Read Swagger/OpenAPI and include only real backend endpoints such as:
- list practitioners
- get practitioner detail
- create practitioner
- update practitioner
- deactivate practitioner
- list practitioner types
- list facility assignments
- create/update facility assignment
- list department assignments
- create/update department assignment
- list specialty assignments
- create/update specialty assignment
- list availability periods
- create/update/deactivate availability
- list leave requests
- request leave
- approve leave
- reject leave
- cancel leave
- list practitioner shifts
- create/update/cancel/start/complete shift

Also read scheduling endpoints if practitioner shifts/availability are under scheduling app.

Do not put React hooks inside API service.
Do not put toast logic inside API service.
Do not put UI logic inside API service.

Queries:
Create hooks such as:
- usePractitionersQuery
- usePractitionerDetailQuery
- usePractitionerTypesQuery
- usePractitionerAssignmentsQuery
- usePractitionerAvailabilityQuery
- usePractitionerShiftsQuery
- usePractitionerLeaveRequestsQuery
- usePractitionerScheduleCalendarQuery if useful

Mutations:
Create hooks such as:
- useCreatePractitionerMutation
- useUpdatePractitionerMutation
- useDeactivatePractitionerMutation
- useCreatePractitionerAssignmentMutation
- useUpdatePractitionerAssignmentMutation
- useCreateAvailabilityMutation
- useUpdateAvailabilityMutation
- useDeactivateAvailabilityMutation
- useCreateShiftMutation
- useUpdateShiftMutation
- useCancelShiftMutation
- useStartShiftMutation
- useCompleteShiftMutation
- useRequestLeaveMutation
- useApproveLeaveMutation
- useRejectLeaveMutation
- useCancelLeaveMutation

Mutation behavior:
- use Sonner success/error feedback
- invalidate relevant queries
- do not reload the whole page
- show friendly custom errors
- keep UI responsive

Pages/routes:

/practitioners
/practitioners/[id]
/practitioners/[id]/schedule
/practitioners/shifts
/practitioners/availability
/practitioners/leave-requests
/practitioners/calendar

If current route structure differs, follow existing app structure cleanly.

Main practitioners page:
- PageHeader
- filters:
  - search
  - practitioner type
  - facility
  - department
  - specialty
  - active/inactive
- desktop table
- mobile cards
- actions:
  - view
  - edit
  - deactivate

Practitioner detail page:
Show:
- safe doctor profile summary
- practitioner type
- facility assignments
- department assignments
- specialty assignments
- current availability
- current shifts
- leave history
- upcoming appointments summary if backend endpoint exists
- action buttons based on permissions

Doctor schedule page:
Show:
- weekly availability
- shifts
- assigned consultation room
- leave periods
- schedule conflicts if backend returns them
- clean calendar/list view

Shift management page:
Staff should be able to:
- create shift
- assign facility
- assign department if needed
- assign service point
- assign consultation room
- select start/end time
- cancel shift
- start shift
- complete shift

Shift UI must show statuses:
- scheduled
- in_progress
- completed
- cancelled

Availability page:
Staff should be able to:
- create weekly availability
- choose day of week
- choose start/end time
- set valid_from and valid_until
- mark whether available for appointments
- deactivate availability

Leave requests page:
Staff/admin should be able to:
- view leave requests
- create leave request
- approve leave
- reject leave
- cancel leave

Leave UI must show statuses:
- pending
- approved
- rejected
- cancelled

Forms:
Use existing reusable form components.
Use react-hook-form + zod.
Create schemas for:
- practitioner create/update
- facility assignment
- department assignment
- specialty assignment
- availability period
- shift
- leave request
- leave decision

UX:
- fast loading
- skeleton loading states
- empty states
- retryable error states
- success toasts
- confirmation dialogs for destructive actions
- friendly backend error messages
- no silent failures

Custom friendly errors:
- overlapping shift → “This doctor already has a shift during this time.”
- room conflict → “This consultation room is already assigned during this time.”
- leave overlap → “This doctor has approved leave during this period.”
- invalid assignment → “Selected department or specialty does not match this doctor’s facility assignment.”
- permission denied → “You do not have permission to perform this action.”
- network error → “Could not connect to the server. Please try again.”

Responsive/mobile:
Use the reusable responsive components already created.
- tables become cards
- filters move into sheet/drawer
- forms stack cleanly
- action buttons remain easy to tap
- no horizontal scroll
- calendar/list must be readable on tablet/mobile

Icons:
Use relevant lucide icons:
- Stethoscope
- UserRoundCheck
- CalendarDays
- CalendarClock
- Clock
- Building2
- Hospital
- DoorOpen
- ClipboardList
- CheckCircle
- XCircle
- AlertTriangle
- RefreshCw
- Search
- Filter

Permissions:
Use backend permission names:
- practitioners_practitioner.view
- practitioners_practitioner.create
- practitioners_practitioner.update
- practitioners_practitioner.deactivate
- practitioners_assignment.manage
- practitioners_credential.manage
- scheduling_availability.manage
- scheduling_shift.manage
- scheduling_leave.manage

If permission filtering is already implemented, apply it.
If not fully implemented, prepare structure without overbuilding.

Important workflow rules:
- Doctor schedule module does not book appointments.
- It prepares availability/shifts that appointment module uses.
- It should not create queue entries.
- It should not create check-ins.
- It should not send notifications directly.
- Leave approval should make it clear that affected appointments may need rescheduling, but do not build appointment rescheduling inside this module unless backend already provides clean integration.

Design:
- Trust Teal + Navy
- shadcn/ui
- clean enterprise healthcare UI
- no overdesign
- no random colors
- no fake photos
- no childish illustrations
- consistent spacing
- consistent forms
- consistent status badges

Status badges:
Use existing StatusBadge for:
- active/inactive
- scheduled
- in_progress
- completed
- cancelled
- pending
- approved
- rejected

Performance:
- use TanStack Query caching
- use enabled queries for dependent selects
- debounce search
- avoid overfetching
- invalidate only relevant queries after mutations
- use useMemo/useCallback only where useful

Run:
npm run lint
npm run build

Use the current package manager if not npm.

Return:
- real endpoints used
- pages created
- API service created
- query hooks created
- mutation hooks created
- forms/dialogs created
- responsive behavior implemented
- command results