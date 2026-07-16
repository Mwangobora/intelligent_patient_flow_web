Continue the frontend for the Intelligent Patient Flow and Appointment Scheduling System.

Clean folder structure is already created.
Packages are installed.
Design system is Trust Teal + Navy.

Now do PART 1C ONLY:
Build the enterprise hospital App Shell:
- collapsible sidebar
- topbar
- navigation UI
- page container
- reusable tabs
- placeholder dashboard shell

Do not build real module pages yet.
Do not connect backend APIs yet.
Do not build auth yet.
Do not build charts yet.
Do not add business logic.

Critical rules:
- Maximum 150 lines per file where practical.
- If file becomes large, split it.
- Use reusable components.
- Use TypeScript properly.
- Avoid any.
- No random colors.
- Use theme tokens only.
- Use shadcn/ui where useful.
- Use lucide-react icons.
- Icons must be relevant to hospital/workflow context.
- UI must look clean, serious, hospital-friendly, and enterprise-ready.
- No childish colors.
- No heavy gradients.
- No glassmorphism.
- No unnecessary animation.
- Use Motion only for subtle sidebar/open-close transitions if already installed.
- Accessibility matters: buttons need aria-label where appropriate.

Selected color system:
- Primary teal: #088395
- Dark navy: #102A43
- Soft cyan: #E6F7F9
- Background: #F8FAFC
- Card: #FFFFFF
- Border: #D9E2EC
- Success: #16A34A
- Warning: #F59E0B
- Danger: #DC2626
- Info: #0284C7

Tasks:

1. Create App Shell components.

Create or update:

src/components/layout/app-shell.tsx
src/components/layout/sidebar.tsx
src/components/layout/sidebar-nav-item.tsx
src/components/layout/topbar.tsx
src/components/layout/page-container.tsx
src/components/layout/page-header.tsx

Rules:
- app-shell.tsx should compose Sidebar + Topbar + main content.
- sidebar.tsx should support collapsed and expanded state from Zustand UI store.
- sidebar-nav-item.tsx should handle active route style.
- topbar.tsx should contain:
  - sidebar toggle button
  - page title area placeholder
  - search placeholder
  - notification icon placeholder
  - user menu placeholder
- page-container.tsx should apply consistent width, padding, and spacing.
- page-header.tsx should support title, description, and optional actions.

2. Sidebar behavior.

Sidebar must:
- Open/close smoothly.
- Use sidebarCollapsed from use-ui-store.
- Have a visible collapse/expand button.
- Use relevant icons:
  Dashboard -> LayoutDashboard
  Appointments -> CalendarClock
  Queue -> ListOrdered
  Check-ins -> QrCode or ScanLine
  Patients -> Users
  Practitioners -> Stethoscope or UserRoundCheck
  Facilities -> Hospital
  Intelligence -> BrainCircuit
  Notifications -> Bell
  Reports -> FileBarChart or FileText
  Audit Logs -> ShieldCheck
  Settings -> Settings
- Use PanelLeftClose and PanelLeftOpen for collapse/expand.
- In collapsed mode, show only icons.
- In expanded mode, show icon + label.
- Active item should use primary teal styling.
- Hover state should be soft cyan.
- Sidebar background should use dark navy.
- Text should remain readable.

3. Navigation config.

Update:

src/config/navigation.config.ts

Each nav item should include:
- label
- href
- icon
- requiredPermission

Use backend permission style:
- reporting_analytics.view
- scheduling_appointment.view
- queueing_entry.view
- checkins_checkin.view
- patients_patient.view
- practitioners_practitioner.view
- facilities_facility.view
- intelligence_prediction.view
- notifications_notification.view
- reporting_report.view
- audit_log.view

Do not implement real permission filtering yet.
Just keep the config ready.

4. Create reusable tabs component.

Create:

src/components/navigation/page-tabs.tsx

Rules:
- Used later for module pages.
- Supports:
  - tabs array
  - active tab
  - href
  - optional badge count
  - optional disabled
- Clean hospital enterprise style.
- Must not exceed 150 lines.
- Do not use business logic.
- Use shadcn/ui or simple Tailwind.

5. Create reusable UI helpers if missing.

Create or update:

src/components/common/metric-card.tsx
src/components/common/status-badge.tsx
src/components/common/empty-state.tsx
src/components/common/loading-state.tsx
src/components/common/error-state.tsx
src/components/common/section-card.tsx

Rules:
- Each file under 150 lines.
- No API calls.
- No random colors.
- StatusBadge must use status color config.
- MetricCard should support:
  - title
  - value
  - description
  - icon
  - trend optional
- SectionCard should be reusable for dashboard panels.

6. Create placeholder dashboard page.

Update app/page.tsx or create dashboard route based on existing project structure.

Show:
- AppShell
- PageHeader title: Hospital Operations Dashboard
- Four MetricCard placeholders:
  - Patients Waiting
  - Appointments Today
  - Active Queues
  - Average Wait Time
- Two SectionCard placeholders:
  - Queue Activity
  - Appointment Utilization
- A sample PageTabs preview if appropriate.

Important:
- This page is visual only.
- Do not fetch backend data yet.
- Use realistic placeholder values only.
- Keep it clean.

7. Mobile responsiveness.

Sidebar should:
- Work well on desktop.
- Be prepared for mobile.
- If mobile sidebar is not fully implemented now, keep structure ready.
- Do not overcomplicate.

8. File-size discipline.

Before finishing:
- Check newly created files.
- If any file is over 150 lines, split it.
- Prefer small focused components.

9. Run checks.

Use current package manager.

Run:
npm run lint
npm run build

or pnpm/yarn/bun equivalent.

Stop after Part 1C only and show:
- files created/changed
- components added
- sidebar behavior added
- icons used
- command results
- any file that is near or above 150 lines