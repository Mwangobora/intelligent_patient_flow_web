Continue the frontend for the Intelligent Patient Flow and Appointment Scheduling System.

App shell, sidebar, topbar, navigation UI, and clean folder structure are already created.

Now do PART 1D ONLY:
Auth frontend foundation + consistent form system.

Do not build patient pages yet.
Do not build appointments yet.
Do not build queue pages yet.
Do not build dashboard API cards yet.
Do not build all modules yet.

Important UI rule:
All forms in the system must look consistent.
Forms must be clean, simple, serious, and hospital-friendly.
No overdesign.
No unnecessary gradients.
No noisy borders.
No childish colors.
No random spacing.
No random input styles.

Critical code rules:
- Maximum 150 lines per file where practical.
- If file becomes large, split it.
- Use reusable components.
- Use TypeScript properly.
- Avoid any.
- No API calls directly inside UI components.
- Use TanStack Query for server/API state.
- Use Zustand only for local UI state.
- Do not store access tokens in localStorage.
- Do not store refresh tokens in localStorage.
- Backend uses HttpOnly cookie flow, so Axios must use withCredentials: true.
- Keep auth flow prepared for cookie-based authentication.
- Use existing Trust Teal + Navy theme tokens.

Professional API naming convention:
Use class-based API services.

For every backend module later, we will use this pattern:

features/{module}/
  api/
    {module}-api.service.ts
  hooks/
    use-{module}-queries.ts
    use-{module}-mutations.ts
  schemas/
    {module}.schemas.ts
  types/
    {module}.types.ts
  components/

For Auth specifically create:

features/auth/
  api/
    auth-api.service.ts
  hooks/
    use-auth-queries.ts
    use-auth-mutations.ts
  schemas/
    auth.schemas.ts
  types/
    auth.types.ts
  components/
    login-form.tsx
    auth-card.tsx
    auth-guard.tsx

Do not use names like AuthApis or authApis.
Use professional naming:
- AuthApiService
- authApiService
- useLoginMutation
- useLogoutMutation
- useCurrentUserQuery

PART 1D TASKS

1. Inspect backend Swagger/OpenAPI or existing endpoint constants.

Find the real auth endpoints from the backend.
Do not guess if the exact routes exist in Swagger/docs.

Expected auth actions may include:
- login
- logout
- refresh token
- current user / me
- password change if available
- password reset if available

Use actual backend endpoint paths.

If an endpoint does not exist, do not create fake frontend API for it yet.

2. Create shared form foundation.

Create reusable form components under:

src/components/forms/

Create small components:
- form-field-wrapper.tsx
- text-input-field.tsx
- password-input-field.tsx
- textarea-field.tsx
- select-field.tsx if shadcn select exists
- form-error-alert.tsx
- submit-button.tsx

Rules:
- Each file must stay under 150 lines.
- Use react-hook-form.
- Use zod schemas.
- Use shadcn/ui components.
- Keep input height consistent.
- Keep labels consistent.
- Keep error messages consistent.
- Required fields should look consistent.
- Disabled/loading states should be clear.
- Password field should support show/hide password with Eye/EyeOff icons.
- Icons must be relevant and not excessive.
- Do not make forms overdesigned.
- Do not add heavy animations.
- Use Motion only for subtle entry/fade if already pattern exists.

Form design rules:
- Labels above inputs.
- Helper/error text below input.
- Error border uses danger color.
- Focus ring uses primary teal.
- Buttons use primary teal.
- Destructive actions use danger red.
- Form spacing must be consistent.
- Use max-width for auth form.
- Do not stretch login form too wide.

3. Create auth types.

Create:

src/features/auth/types/auth.types.ts

Include only what is needed now:
- LoginRequest
- LoginResponse
- AuthUser
- AuthPermission
- CurrentUserResponse
- LogoutResponse if needed

AuthUser should support:
- id
- email
- first_name
- last_name
- full_name optional
- is_active
- is_staff optional
- permissions optional string[]
- memberships optional if backend returns them

Match backend response shape as closely as possible.
If backend uses snake_case, keep response types snake_case.
Do not randomly convert all fields yet unless there is a mapper.

4. Create auth schemas.

Create:

src/features/auth/schemas/auth.schemas.ts

Use Zod.

Login schema:
- email required and valid email
- password required
- password minimum based on backend if known, otherwise minimum 1 for login only

Do not overvalidate login password on frontend.
Login accepts existing password, so do not force complex password rules on login.

Export:
- loginSchema
- LoginFormValues

5. Create class-based auth API service.

Create:

src/features/auth/api/auth-api.service.ts

Use existing axios api client from:
src/lib/api/api-client.ts

Implement class:

class AuthApiService {
  login(payload: LoginRequest): Promise<LoginResponse>
  logout(): Promise<LogoutResponse>
  getCurrentUser(): Promise<CurrentUserResponse>
  refreshSession? only if backend endpoint exists
}

Export:
export const authApiService = new AuthApiService()

Rules:
- No React hooks in API service.
- No UI toast here.
- No routing here.
- No localStorage.
- No token storage.
- Only HTTP calls and response return.
- Keep file under 150 lines.

6. Create auth query hooks.

Create:

src/features/auth/hooks/use-auth-queries.ts

Implement:
- useCurrentUserQuery

Rules:
- Use TanStack Query.
- Use query keys from query-keys.ts.
- Current user query should be retry false or limited.
- Should not spam backend.
- Should be easy to use in AuthGuard and topbar later.

7. Create auth mutation hooks.

Create:

src/features/auth/hooks/use-auth-mutations.ts

Implement:
- useLoginMutation
- useLogoutMutation

Rules:
- Use TanStack Query useMutation.
- On successful login:
  - invalidate/refetch current user query
  - do not store token
- On logout:
  - clear current user query cache
  - redirect handling can be done by component or passed callback
- Normalize errors using existing API error utilities.
- Do not put UI layout inside hooks.
- Keep file under 150 lines.

8. Create AuthGuard.

Create:

src/features/auth/components/auth-guard.tsx

Purpose:
- Protect dashboard/app shell pages.
- Use useCurrentUserQuery.
- Show clean loading state while checking session.
- If unauthenticated, redirect to login.
- If authenticated, render children.

Rules:
- No token checks from localStorage.
- Do not rely only on Zustand for auth.
- Current user from backend is source of truth.
- Keep component small.

9. Create login form.

Create:

src/features/auth/components/login-form.tsx

Use:
- react-hook-form
- zod resolver
- loginSchema
- useLoginMutation
- shared form components
- sonner toast if already configured

UI requirements:
- Clean hospital login form.
- Title: Welcome back
- Subtitle: Sign in to manage hospital patient flow.
- Email input
- Password input
- Submit button
- Error alert
- Loading state
- No unnecessary illustrations yet.
- No heavy animation.
- No fake social login.
- No remember-me unless backend supports it.

On success:
- redirect to dashboard/home route.

10. Create auth card.

Create:

src/features/auth/components/auth-card.tsx

Reusable wrapper for auth forms:
- logo/app name area
- card layout
- clean spacing
- hospital-friendly look
- max width
- uses Trust Teal + Navy

11. Create login page.

Create route based on current Next.js app structure.

Preferred:
src/app/(auth)/login/page.tsx

If route groups are not currently used, adapt cleanly.

Login page:
- centered layout
- app name
- AuthCard
- LoginForm
- background using app background/soft cyan subtly
- no heavy design

12. Protect app shell layout if appropriate.

If dashboard layout exists:
- wrap protected dashboard area with AuthGuard

Preferred later structure:
src/app/(dashboard)/layout.tsx

But do not break current routes.
If restructuring routes is risky, keep current app page working and add AuthGuard where appropriate.

13. Update navigation/topbar only if needed.

Do not fully implement user menu yet.
But prepare topbar to accept user display name later.

14. Update environment example only if missing.

Ensure .env.example has:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

15. File-size discipline.

Before finishing:
- Check all new/changed files.
- If any file is above 150 lines, split it.
- Login form should not become huge.
- API service should stay small.
- Hooks should stay separate.

16. Run checks.

Use current package manager.

Run:
npm run lint
npm run build

or pnpm/yarn/bun equivalent.

Stop after PART 1D only and show:
- auth endpoints used
- files created/changed
- shared form components created
- API service created
- query hooks created
- mutation hooks created
- login page created
- command results
- any file close to or above 150 lines