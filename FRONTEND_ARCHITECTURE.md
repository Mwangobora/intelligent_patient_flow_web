# Frontend Architecture

This frontend uses `npm` because the project already includes `package-lock.json`.

## Package choices

- `@tanstack/react-query` handles server and API state.
- `zustand` handles small local UI state only.
- `axios` is the shared HTTP client with `withCredentials: true`.
- `react-hook-form` + `zod` handle forms and validation.
- `recharts` and `@tanstack/react-table` are ready for dashboard data views.
- `motion`, `lucide-react`, and `sonner` support UI polish and feedback.

## Folder structure

- `src/app`: Next.js App Router entry files.
- `src/components`: shared UI and structural components.
- `src/config`: app, theme, navigation, and permission constants.
- `src/features`: domain-first module folders aligned with backend apps.
- `src/lib`: API, query, formatting, route, and utility foundations.
- `src/stores`: small client-side Zustand stores.
- `src/types`: shared generic TypeScript types only.

## State management rule

- Use TanStack Query for server data, caching, and mutations.
- Use Zustand only for UI state like sidebar and command menus.
- Do not put large API payloads or auth tokens in Zustand.

## API client rule

- UI components must not call APIs directly.
- Shared API code belongs in `src/lib/api` or feature `api` folders.
- Axios uses `withCredentials: true` to prepare for HttpOnly cookie auth.
- Do not read auth tokens from `localStorage`.

## File rule

- Keep files under 150 lines where practical.
- Prefer small reusable components and focused modules.

## Module convention

- Each feature module gets `api`, `components`, `hooks`, `schemas`, and `types`.
- `auth` also includes a `stores` folder for auth-specific client state later.
- Build module screens incrementally after shared foundations are stable.
