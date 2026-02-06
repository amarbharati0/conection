# MonitorPro

## Overview

MonitorPro is a candidate monitoring and task management platform with two user roles: **Admin** and **Candidate**. Admins can manage candidates, assign tasks, view attendance records, and access reports. Candidates can view their assigned tasks, submit proof of completion (photo/video), and mark attendance using a live webcam photo with geolocation.

The app follows a monorepo structure with a React frontend, Express backend, and PostgreSQL database. It uses in-memory storage as a fallback but is configured for PostgreSQL via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Directory Structure
- **`client/`** — React frontend (Vite-based SPA)
- **`server/`** — Express backend (API server)
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server
- **`migrations/`** — Drizzle-generated database migrations
- **`script/`** — Build scripts

### Frontend Architecture
- **Framework:** React with TypeScript, bundled by Vite
- **Routing:** Wouter (lightweight client-side router)
- **State/Data Fetching:** TanStack React Query for server state; local state via React hooks
- **Auth:** Client-side auth state stored in localStorage via a custom `useAuth` hook. No session cookies or JWT tokens — just stores the user object returned from login.
- **UI Components:** shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS
- **Charts:** Recharts for admin dashboard visualizations
- **Webcam:** react-webcam for live attendance photo capture
- **Date Handling:** date-fns
- **Path aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework:** Express 5 on Node.js, written in TypeScript (run via `tsx`)
- **API Design:** RESTful JSON API under `/api/` prefix. Route definitions (paths, methods, Zod input/output schemas) are declared in `shared/routes.ts` and shared between client and server for type safety.
- **Storage Layer:** Abstracted behind an `IStorage` interface in `server/storage.ts`. Currently uses `MemStorage` (in-memory Map-based store with seed data). Designed to be swapped for a database-backed implementation.
- **Database:** PostgreSQL via Drizzle ORM. Config in `drizzle.config.ts` points to `DATABASE_URL` env var. Schema defined in `shared/schema.ts`. Use `npm run db:push` to push schema to database.
- **Auth:** Simple plaintext password comparison (no hashing). Admin has hardcoded credentials (`admin` / `admin@123`). No session management on server side.
- **Dev Server:** Vite dev server middleware is integrated into Express for HMR during development. In production, Express serves static files from `dist/public/`.

### Shared Layer (`shared/`)
- **`schema.ts`** — Zod schemas defining data shapes for User, Task, Submission, and Attendance. Also has Drizzle pgTable definitions. Types are exported and used across both client and server.
- **`routes.ts`** — Typed API route definitions including HTTP method, path, Zod input schema, and Zod response schemas. This acts as a contract between frontend and backend.

### Data Models
- **User** — id, username, password, role (admin/candidate), name, details (age, address, phone)
- **Task** — id, title, description, assignedTo (candidateId), status (pending/completed), createdAt
- **Submission** — id, taskId, candidateId, photoUrl, videoUrl, timestamp
- **Attendance** — id, candidateId, livePhotoUrl, timestamp, location

### Key API Endpoints
- `POST /api/auth/login` — Login with username/password
- `POST /api/auth/register` — Register new user
- `GET /api/tasks` — List tasks (optionally filtered by candidateId)
- `POST /api/tasks` — Create/assign a task
- `PATCH /api/tasks/:id` — Update task status
- `GET /api/submissions` — List submissions
- `POST /api/submissions` — Submit proof for a task
- `GET /api/attendance` — List attendance records
- `POST /api/attendance` — Mark attendance with live photo

### Build Process
- **Dev:** `npm run dev` — runs Express + Vite dev server via tsx
- **Build:** `npm run build` — Vite builds frontend to `dist/public/`, esbuild bundles server to `dist/index.cjs`
- **Start:** `npm start` — runs the production bundle

### Role-Based Routing
- Admin routes are under `/admin/*` (dashboard, candidates, candidate details, tasks, attendance, reports, notifications, settings)
- Candidate routes are under `/dashboard` and `/attendance`
- `ProtectedRoute` component handles role-based access control on the client

## External Dependencies

### Database
- **PostgreSQL** — Required. Connection string via `DATABASE_URL` environment variable. Drizzle ORM handles schema management and queries. The `db:push` script syncs schema to the database.

### Key NPM Packages
- **express** (v5) — HTTP server
- **drizzle-orm** + **drizzle-kit** — ORM and migration tooling for PostgreSQL
- **drizzle-zod** — Generate Zod schemas from Drizzle tables
- **zod** — Runtime validation for API inputs/outputs
- **@tanstack/react-query** — Client-side data fetching and caching
- **wouter** — Client-side routing
- **react-webcam** — Webcam capture for attendance
- **recharts** — Charts on admin dashboard
- **react-hook-form** + **@hookform/resolvers** — Form handling with Zod validation
- **date-fns** — Date formatting
- **shadcn/ui components** (Radix UI primitives) — Full suite of UI components
- **tailwindcss** — Utility-first CSS

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` — Error overlay in development
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` — Dev tooling (conditionally loaded)

### Fonts (External CDN)
- Google Fonts: Architects Daughter, DM Sans, Fira Code, Geist Mono, Outfit, Plus Jakarta Sans