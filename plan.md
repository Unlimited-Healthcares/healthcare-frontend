## Healthcare Frontend – Rebuild Plan (From Scratch to Production)

This plan guides you to rebuild the app end-to-end, matching the current feature set, architecture, and behavior. It covers project scaffolding, dependencies, configs, backend API integration, routing, core/advanced features, QA, and deployment.

## Scope and Goals

- Recreate the React + TypeScript + Vite app with Tailwind and the existing UI system
- Implement backend API authentication and profiles, protected routes, and feature modules (dashboard, patients, appointments, medical records, referrals, chat, notifications, AI tools, DICOM viewer, files, admin)
- Ensure environment parity, predictable builds, and a deployable artifact

## Prerequisites

- Node.js 18+
- npm 9+ (or yarn/pnpm)
- Backend API endpoint (api.unlimtedhealth.com)
- GitHub/Vercel (or Netlify/AWS) for deployment

## Phase 1 — Project Foundation

1) Initialize Vite + React + TypeScript

```bash
npm create vite@latest healthcare-frontend -- --template react-swc-ts
cd healthcare-frontend
```

2) Copy or recreate essential project files

- Copy the following from the reference repo (or create equivalent):
  - `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
  - `tailwind.config.ts`, `postcss.config.js`, `index.html`, `public/`
  - Directory structure under `src/` (see Phase 4)

3) Install dependencies

- Preferred: copy `package.json` from this repository, then run:

```bash
npm install
```

4) Configure Vite

- Ensure alias `@` → `./src` is set in `vite.config.ts`
- Ensure dev server ports and React plugin are present

5) Configure TypeScript

- Ensure `paths` mapping `@/*` → `./src/*` appears in `tsconfig.json` and `tsconfig.app.json`

6) Add Tailwind CSS

```bash
npx tailwindcss init -p
```

- Use `tailwind.config.ts` content sources: `./src/**/*.{ts,tsx}` (and any UI folders used)
- Include `@tailwind base; @tailwind components; @tailwind utilities;` in `src/index.css`

7) Verify index.html bootstrap

- Ensure there is a `#root` element and the Vite entry script (`/src/main.tsx`)

## Phase 2 — Environment and Backend API

1) Create `.env` and `.env.example`

```env
# Backend API Configuration
VITE_API_URL=https://api.unlimtedhealth.com/api
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true

# Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

2) Load env in code

- Use `import.meta.env.VITE_API_URL` for API endpoints
- File: `src/lib/api-client.ts`:

```ts
export const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
);
```

## Phase 3 — Backend API Integration

1) Create API client service

- Implement `src/lib/api-client.ts` with authentication and CRUD methods
- Handle JWT tokens and API requests
- Implement error handling and retry logic

2) Update authentication system

- Replace Supabase auth with backend API auth
- Implement token-based authentication
- Handle session management and refresh

3) Update all services

- Convert Supabase calls to API client calls
- Implement proper error handling
- Add loading states and retry logic

## Phase 4 — Codebase Layout

- `src/`
  - `components/` (feature and UI components)
  - `components/ui/` (button, dialog, dropdown, form, input, toast, theme-provider, etc.)
  - `components/dashboard/` (CenterProfile, PatientList, Records, ChatInterface, DicomViewer, ReferralSystem, AppointmentScheduler, AdminDashboard, Report generators, etc.)
  - `components/ProtectedRoute.tsx`
  - `pages/` (Index, Home, Auth, Dashboard, CenterRegistration, NotFound)
  - `hooks/` (`useAuth`, `useAnalytics`, `use-notifications`, `useEmergencyTracking`, `use-mobile`)
  - `services/` (appointments, centers, medical records, referrals, notifications, analytics)
  - `integrations/supabase/` (`client.ts`, `types.ts`)
  - `context/` (e.g., NotificationsContext)
  - `lib/`, `types/`, `assets/`, `styles/`

## Phase 5 — App Shell, Routing, Providers

1) Entry

- `src/main.tsx` mounts `<App />`

2) App providers

- In `src/App.tsx`, wrap with:
  - `QueryClientProvider` (@tanstack/react-query)
  - `ThemeProvider`
  - `NotificationsProvider`/Toaster
  - `BrowserRouter`
  - `AuthProvider`

3) Routes

- Public: `/`, `/home`, `/auth/*`
- Protected: `/dashboard/*`, `/center-registration`
- Use `components/ProtectedRoute` to guard protected routes

## Phase 6 — Authentication

1) `useAuth` context

- Implements:
  - session bootstrap (`supabase.auth.getSession()` and listener)
  - `signIn`, `signUp` (create `profiles` row + generate `display_id`), `signOut`
  - `refreshSession`, `refreshProfile` with retry/backoff
  - `isAuthenticated`, `profile`, `authError`

2) `ProtectedRoute`

- Handles loading, network offline/online, refresh retries, error UX, and redirect to `/auth/login`

3) Auth pages and forms

- `/auth/login` → `LoginForm`
- `/auth/register` → `RegisterForm`
- Redirect authenticated users to stored return path or `/dashboard`

## Phase 7 — UI System

- Install/use the existing `components/ui/*` primitives (Radix-based)
- Ensure Tailwind tokens and animations in `tailwind.config.ts` are present
- Add `Toaster` and `use-toast` where needed

## Phase 8 — Feature Modules

Implement routes under `/dashboard/*` inside `pages/Dashboard.tsx` using components from `components/dashboard/`:

- Center profile and services: `CenterProfile`, `ServiceManagement`
- Patients and records: `PatientList`, `PatientRecords`, `MedicalRecords`, `SharedMedicalRecordsViewer`
- Appointments: `AppointmentScheduler`
- Referrals: `ReferralSystem`, `ReferralDetails`, `ReferralTimeline`, `ReferralDocuments`, `ReferralAnalytics`, `FacilityReferralForm/Details`
- Files: `FileUploader`, `FilesManagement`, `MedicalReportFiles`
- AI & reports: `AIChatbot`, `EnhancedAIDashboard`, `MedicalReportGenerator`, `EnhancedMedicalReportGenerator`, `ReportPdfGenerator`, `EnhancedReportPdfGenerator`
- DICOM viewer: `DicomViewer`
- Chat: `ChatInterface`
- Admin: `AdminDashboard` (conditionally shown for `role === 'admin'`)

## Phase 9 — Services Layer

- Implement API calls in `src/services/` (appointments, centers, medical records, referrals, notifications, analytics)
- Prefer Supabase (RPC, tables, storage) for persistence; keep requests typed
- Use React Query for caching and mutations

## Phase 10 — Notifications, Analytics, Misc

- Notifications: `components/ui/notifications-system`, `sonner` toaster
- Analytics hooks: `useAnalytics` and `services/analyticsService.ts`
- Mobile/responsive helpers: `use-mobile`, responsive layouts in Tailwind

## Phase 11 — QA and Validation

- Auth flows: sign up, email confirm, login, refresh, logout
- Profile lifecycle: `display_id` generation, role-based access
- Protected routes: redirect behavior, network offline handling
- Dashboard nav: all routes render and data fetch works
- File upload, report generation, and PDF/print flows
- DICOM viewer loads sample data
- Referrals end-to-end: create → share → view → timeline
- Accessibility pass (focus, labels, color contrast)

## Phase 12 — Build and Deploy

1) Local build

```bash
npm run build
npm run preview
```

2) Vercel (recommended)

- Add project, set env vars (`VITE_*`), and deploy
- Ensure `vercel.json` uses Vite static build output (`dist/`)

3) Netlify

- Build command: `npm run build`, Publish directory: `dist`

4) AWS S3 + CloudFront

- Sync `dist/` to S3 and invalidate CloudFront

## Phase 13 — Runbook

- Install: `npm install`
- Env: copy `.env.example` → `.env` and fill Supabase values
- Dev: `npm run dev` → open `http://localhost:8080`
- Build: `npm run build`; Preview: `npm run preview`
- Lint: `npm run lint`

## Appendix A — Minimal Files to Recreate

- Config: `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig*.json`
- HTML entry: `index.html`
- Env: `.env`, `.env.example`
- Directories: `src/components/*`, `src/pages/*`, `src/hooks/*`, `src/services/*`, `src/integrations/supabase/*`, `src/context/*`, `src/lib/*`, `src/types/*`

## Appendix B — Troubleshooting

- Blank page in production: verify base path in Vite (if deploying under subpath) and correct env vars
- Auth refresh loops: check `supabase.auth.onAuthStateChange` listener and localStorage token state
- 401/403 on profile fetch: confirm RLS policies and `auth.uid()` matches `profiles.id`
- CORS/API failures: ensure you are calling Supabase correctly (no custom API URL unless needed)

## Completion Criteria

- All routes render and are navigable
- Auth + profiles functional with RLS
- Role-based dashboard features visible/hidden appropriately
- Files, reports, chat, notifications, DICOM viewer work as in reference
- Production build deployed and loads without console errors


