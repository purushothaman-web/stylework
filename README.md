# Lead Tracker

A full-stack Lead Management application built as part of the Stylework Junior Full Stack Engineer assignment. Track prospects through a sales pipeline with Create, Search, Filter, and Status-Update capabilities — all with strict data validation and a refined editorial UI.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Setup Instructions](#setup-instructions)
4. [API Reference](#api-reference)
5. [Deployment](#deployment)
6. [Trade-offs](#trade-offs)
7. [Future Improvements](#future-improvements)

---

## Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
│            React 19 + TypeScript SPA (Vite + Tailwind v4)       │
└──────────────────────────┬───────────────────────────────────────┘
                           │  REST / JSON (HTTPS)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Backend Server                             │
│             Express 5 + TypeScript (Node.js 22)                 │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│   │   Routes    │  │ Controllers  │  │     Services       │     │
│   │             │→ │              │→ │  (business logic / │     │
│   │ /api/leads  │  │ parse req,   │  │   validation)      │     │
│   │             │  │ shape res    │  │                    │     │
│   └─────────────┘  └──────────────┘  └────────────────────┘     │
│                                              │                   │
│                                    ┌─────────────────┐          │
│                                    │  Repositories   │          │
│                                    │  (Prisma 6 ORM) │          │
│                                    └────────┬────────┘          │
└─────────────────────────────────────────────┼────────────────────┘
                                              │  SQL (pg)
                                              ▼
                               ┌──────────────────────────┐
                               │       PostgreSQL          │
                               │    Table: leads           │
                               │   (id, name, email,       │
                               │    phone, status,         │
                               │    createdAt)             │
                               └──────────────────────────┘
```

### Request Flow — Create Lead

```
User fills form → Client validation → POST /api/leads
    → Backend validates (name regex, RFC email, phone digit count)
    → Prisma INSERT (unique constraint on email)
    → 201 Created → Optimistic UI update → Toast notification
```

### Layered Backend Design

| Layer | Responsibility | Files |
|---|---|---|
| **Routes** | Map HTTP verbs/paths to controller handlers | `src/routes/lead.routes.ts` |
| **Controllers** | Parse request, call service, shape JSON response | `src/controllers/lead.controller.ts` |
| **Services** | All business rules and validation logic | `src/services/lead.service.ts` |
| **Repositories** | Only layer that touches PostgreSQL via Prisma | `src/repositories/lead.repository.ts` |
| **Models** | Shared TypeScript types (`Lead`, `CreateLeadDTO`) | `src/models/lead.ts` |
| **Middleware** | Error handling, `AppError` class | `src/middleware/errorHandler.ts` |

### Database Schema

```sql
CREATE TABLE leads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  phone      TEXT        NOT NULL,
  status     LeadStatus  NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
```

### Frontend Component Tree

```
App
└── DashboardPage
    ├── Toast (auto-dismiss notifications)
    ├── Header
    │   └── AddLeadButton → LeadFormModal
    │                           ├── FormField (Name, Email, Phone)
    │                           └── Field-level validation errors
    ├── Metrics Bar (Total Pipeline / Qualified / Won)
    ├── SearchBar (300ms debounced search)
    ├── StatusFilter (custom popover dropdown)
    └── LeadTable (desktop) / LeadCard (mobile)
            └── InlineStatusSelect (custom ARIA popover, optimistic UI)
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22+ | Runtime |
| Express | 5.2.1 | HTTP framework |
| TypeScript | 5.9 | Type safety |
| Prisma | 6.19 | ORM + schema management |
| PostgreSQL | 15+ | Database |
| Helmet | 8.3 | Security headers (X-Frame, HSTS, CSP, etc.) |
| express-rate-limit | 8.7 | API rate limiting (300 req/15 min) |
| tsx | 4.23 | Zero-config TypeScript runner (dev + tests) |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.3 | UI framework |
| TypeScript | 6.0 | Type safety |
| Vite | 8.3 | Build tool + dev server |
| Tailwind CSS | 4.3 | Utility-first styling |
| Plus Jakarta Sans | — | Body typeface (Google Fonts) |
| Newsreader | — | Display serif (Google Fonts) |

---

## Setup Instructions

### Prerequisites

- **Node.js 22+** (`node -v`)
- **PostgreSQL 15+** running locally or a hosted connection URL
- **npm 10+** (`npm -v`)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd stylework
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/lead_db"
CLIENT_ORIGIN="http://localhost:5173"
PORT=3000
NODE_ENV=development
```

```bash
# Push schema to database
npm run prisma:push

# Start development server
npm run dev
```

Backend will start at `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
# Start development server
npm run dev
```

Frontend will start at `http://localhost:5173`.

### 4. Run Backend Tests

```bash
cd backend
npm test
```

Expected output: **22/22 tests passing**.

---

## API Reference

Base URL: `http://localhost:3000`

### `GET /health`

Health check. Returns `200 { status: "ok", uptime, timestamp }`.

---

### `POST /api/leads`

Create a new lead.

**Request Body:**
```json
{
  "name": "Eleanor Vance",
  "email": "eleanor@example.com",
  "phone": "+91 98765 43210"
}
```

**Validation Rules:**
- `name`: 2–60 chars, letters/spaces/hyphens/apostrophes only (no digits, no HTML)
- `email`: RFC 5322 compliant, max 100 chars, lowercased on save
- `phone`: Digits only (plus optional `+`, spaces, `-`, `()`), 7–15 digit count — rejects alphabetic chars like `9123456780f`

**Responses:**
| Status | Meaning |
|---|---|
| `201 Created` | Lead created successfully |
| `400 Bad Request` | Validation failure — specific field message returned |
| `409 Conflict` | Email already exists in database |

---

### `GET /api/leads`

List all leads. Supports optional query parameters:

| Param | Type | Description |
|---|---|---|
| `search` | string | Case-insensitive substring match on `name`, `email`, or `phone` |
| `status` | string | Filter by exact status enum value (`NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`) |

**Response:** `200 { success: true, count: N, data: Lead[] }`

---

### `GET /api/leads/:id`

Get a single lead by UUID.

**Responses:** `200 { data: Lead }` or `404 Not Found`

---

### `PATCH /api/leads/:id/status`

Update a lead's status.

**Request Body:**
```json
{ "status": "CONTACTED" }
```

**Responses:** `200 { data: Lead }` or `400 Bad Request` (invalid enum) or `404 Not Found`

---

## Deployment

### Backend — Render.com

1. Create a new **Web Service** on Render, connecting to this repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `npm install && npm run prisma:generate && npm run build`
4. Set **Start Command**: `node dist/server.js`
5. Add environment variables in Render dashboard:
   - `DATABASE_URL` — your hosted PostgreSQL URL (e.g. Supabase)
   - `CLIENT_ORIGIN` — your deployed frontend URL (e.g. `https://yourapp.vercel.app`)
   - `PORT` — `3000`
   - `NODE_ENV` — `production`

### Database — Supabase

1. Create a new project on [Supabase](https://supabase.com).
2. Copy the **Connection String** (with `?pgbouncer=true` removed for Prisma Direct Connection).
3. Set it as `DATABASE_URL` in Render environment variables.
4. Run `prisma db push` locally pointing at the Supabase URL to apply the schema.

### Frontend — Vercel

1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://your-api.onrender.com`)

---

## Trade-offs

### What was chosen and why

**Prisma 6 over raw SQL / Knex**
Prisma's type-safe query builder eliminates an entire class of runtime errors by generating TypeScript types directly from the schema. The trade-off is a cold-start latency on Render's free tier while Prisma Client initialises, and the 50 MB binary weight. For a production-scale system I would benchmark Drizzle ORM which is lighter.

**Tailwind CSS v4 over component library (Shadcn, Radix, MUI)**
Using zero external UI components keeps the bundle minimal and forces intentional design decisions. The entire styled UI is ~26 KB CSS. The trade-off is that complex interactive patterns (date pickers, comboboxes) require implementing from scratch — as demonstrated by the custom status popover dropdowns built in this project.

**Custom dropdown popovers over native `<select>`**
Native HTML `<select>` elements render using OS-level UI on Windows (Chrome/Edge), ignoring all CSS for the open state. This produced the harsh electric-blue highlight and wrong fonts. Replacing them with custom ARIA `role="listbox"` popovers with status-colour indicator dots restores full design control at the cost of additional implementation.

**Flat single table over relational schema**
For this scope (one entity, no auth, no companies/tags), a single `leads` table is the right call. Adding a foreign-key companies table for multi-tenancy is a future concern.

**`tsx --test` over Jest/Vitest**
Node.js 22 ships a native test runner (`node:test`). Using `tsx` to run TypeScript tests directly eliminates the Babel/transform pipeline, removes a dependency, and produces clean output. The trade-off is a less mature ecosystem (no snapshot testing, no mocking library) — but for integration tests against a live DB it's more than sufficient.

**No client-side state library (Redux, Zustand, Jotai)**
The application has one page and one resource. Colocating state in `DashboardPage` with direct `fetch` calls is the simplest working solution. Adding a state library would be speculative complexity.

---

## Future Improvements

### Short Term
- [ ] **Authentication** — JWT-based auth so leads are scoped per user/team
- [ ] **Pagination** — server-side cursor pagination once lead count exceeds ~500
- [ ] **Edit Lead** — allow updating name, email, phone (not just status)
- [ ] **Delete Lead** — soft-delete with a `deletedAt` timestamp

### Medium Term
- [ ] **Pipeline view** — Kanban board layout grouped by status column (drag-and-drop via pointer events API)
- [ ] **Notes/Activity Log** — per-lead comments and timestamped status history
- [ ] **CSV Import/Export** — bulk import from spreadsheet and export to CSV for sales team handoff
- [ ] **Assigned To** — lead ownership, assignable to team members

### Infrastructure
- [ ] **OpenAPI spec** — auto-generate from route definitions and serve Swagger UI
- [ ] **Redis caching** — cache `GET /api/leads` response for heavy read traffic
- [ ] **Database indexing** — add GIN index on `name || email || phone` for full-text search at scale
- [ ] **CI pipeline** — GitHub Actions running `npm test` and `npm run build` on every PR
