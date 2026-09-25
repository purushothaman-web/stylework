# AGENT.md — AI Usage & Engineering Decisions Log

This document covers how AI tooling was used during this project, which parts were written manually, and the real engineering decisions made while building and hardening the Lead Tracker application.

---

## AI Tools Used

| Tool | How it was used |
|---|---|
| **Antigravity IDE (Gemini / Claude)** | Primary pair-programming assistant — architecture planning, code generation, validation logic, test authoring, UI refactoring, and documentation |
| **GitHub Copilot** | Inline autocomplete during routine typing |

---

## What AI Generated vs What I Directed

The distinction here is important. AI wrote the characters on screen. I made every decision about *what to build*, *why to build it that way*, and spent significant time hardening the output before it was acceptable.

### AI-assisted (generated with my direction)

- Initial Express + TypeScript server scaffold (`app.ts`, `server.ts`, `config/env.ts`)
- Prisma schema first draft for the `Lead` model
- Route/Controller/Service/Repository pattern boilerplate
- Initial React component skeletons (`DashboardPage`, `LeadTable`, `LeadCard`)
- Tailwind v4 `@theme` token definitions in `style.css`
- First-pass `README.md` and `AGENT.md` structure

### Manually crafted / manually hardened

The following were either written by hand or required significant manual correction and engineering judgment:

---

## Hardening Work — What I Fixed, Why, and How

This is the honest account of what wasn't right the first time and what was done to fix it.

### 1. Phone Validation Was Too Loose

**Problem discovered:** The first pass of the backend accepted `9123456780f` as a valid phone number. The phone field had a regex that only checked format but never explicitly rejected alphabetic characters. This was a real user-facing bug — I caught it by entering `test`, `test@mail.com`, `9123456780f` during manual testing.

**What I did:** I went into `lead.service.ts` and added a dedicated pre-check before the regex:

```typescript
// Explicitly reject alpha chars BEFORE pattern matching
if (/[a-zA-Z]/.test(trimmedPhone)) {
  throw new AppError(400, 'Phone number cannot contain alphabetic characters');
}
```

The key insight is that `/^\+?[0-9\s\-()]{7,20}$/` alone doesn't reject `9123456780f` if the trailing `f` is somehow passed through a lenient trim. The explicit character-class check is the defence-in-depth guard. Then separately, I added a digit-count check:

```typescript
const digitCount = (trimmedPhone.match(/\d/g) || []).length;
if (digitCount < 7 || digitCount > 15) {
  throw new AppError(400, 'Phone number must contain between 7 and 15 digits');
}
```

This matters because `+() - ` technically passes many phone regexes with zero digits.

**Result:** The integration test `'returns 400 when phone number contains alphabetic characters (e.g. 9123456780f)'` was written to document this exact case and passes.

---

### 2. Name Validation Was Not XSS-Aware

**Problem discovered:** The first name validator accepted any non-empty string, which meant `<script>alert(1)</script>` was a valid name.

**What I did:** Designed the `NAME_REGEX` to be an allowlist, not a denylist:

```typescript
const NAME_REGEX = /^[a-zA-Z\s'.-]{2,60}$/;
```

This permits only: Latin letters, spaces, apostrophes (O'Brien), hyphens (Mary-Jane), and dots (initials). Anything outside this — digits, angle brackets, ampersands, emoji — is rejected. The test `'returns 400 when name contains numbers or special characters'` documents this.

The choice was intentional: allowlist validation is safer than trying to denylist known attack characters.

---

### 3. Email Was Not Lowercased Before Storage

**Problem discovered:** `Test@MAIL.COM` and `test@mail.com` would create duplicate records under a case-sensitive unique index.

**What I did:** Normalised email on the service layer before handing to the repository:

```typescript
const trimmedEmail = data.email.trim().toLowerCase();
```

The database unique constraint is then unambiguous. This is a sanitisation decision, not just validation.

---

### 4. The API Had No Security Headers or Rate Limiting

**Problem discovered:** Express by default exposes `X-Powered-By: Express`, doesn't set any HSTS/CSP/X-Frame headers, and has no protection against brute-force or scraping.

**What I added to `app.ts`:**

```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.json({ limit: '50kb' }));
```

**Why these three specific things:**
- `helmet()` — sets 10+ security headers in one call (removes `X-Powered-By`, adds `X-Frame-Options: DENY`, sets `Referrer-Policy`, etc.)
- `rateLimit` — 300 req/15 min per IP on all `/api/*` routes is permissive enough for legitimate use but blocks naive scrapers
- `express.json({ limit: '50kb' })` — prevents payload flooding via the JSON body parser; the default was `100kb` which is too large for this use case

---

### 5. Tailwind v4 Linter Warnings — Why They Were Real Problems, Not Just Noise

**Problem discovered:** The VS Code Tailwind IntelliSense extension flagged:
- `bg-[#ffffff]` while `--color-surface: #ffffff` was defined in `@theme` → should be `bg-surface`
- `border-[#e7e5df]` and `focus:border-[#c2410c]` on the same element → Tailwind treats these as conflicting because both apply `border-color`
- `text-[#1c1917]` and `placeholder:text-[#a8a29e]` → technically fine but semantic tokens make intent clearer

**What was wrong:** The initial code used raw hex values everywhere while a `@theme` block existed. This defeated the purpose of having design tokens. More importantly, the `border-X focus:border-Y` pattern on inputs was causing the linter to flag a real conflict: at rest, `border-stone-border` applies `border-color`; on focus, `focus:border-terracotta` applies the same property again. This isn't wrong at runtime but signals a maintenance hazard.

**What I did:** 

1. Added `--color-card-bg` and `--color-canvas` to the `@theme` block so both the former `#ffffff` and `#f7f6f1` had semantic names.
2. Systematically replaced raw hex classes with semantic tokens (`bg-canvas`, `bg-card-bg`, `border-stone-border`, `text-espresso`, `bg-terracotta`) across all 6 frontend components.
3. Moved input focus from `border-X focus:border-Y focus:ring-Y` to just `border-X focus:ring-1.5 focus:ring-Y` — the ring provides the visual focus indicator without conflicting with the default border.
4. Moved `placeholder` styling to a global CSS rule in `style.css` (`input::placeholder { color: #a8a29e; }`) instead of using `placeholder-stone-400` utility class — this also removed the `text-espresso` vs `placeholder-stone-400` pseudo-conflict.

---

### 6. Both Status Dropdowns Were Native `<select>` Elements

**Problem observed:** On Windows (Chrome and Edge), native `<select>` elements render their open state using the OS window manager, completely ignoring CSS. This produced a harsh electric-blue highlighted row, system-level fonts, and square corners — completely inconsistent with the editorial stone aesthetic.

**What I built:** Two custom React popover components with full keyboard + ARIA support:

**InlineStatusSelect** (inline in table rows):
- `role="listbox"` popover triggered by a styled `<button>`
- Smart viewport detection: measures `window.innerHeight - rect.bottom` and flips the popover upward (`bottom-full mb-1.5`) if less than 200px space remains
- Escape key and click-outside dismissal via `useEffect` event listeners cleaned up on close
- Status-coloured indicator dots and a terracotta checkmark (✓) on the selected item
- Optimistic UI: the parent component updates state immediately and rolls back on API failure

**StatusFilter** (in the filter bar):
- Same popover pattern, same dismiss logic
- Trigger shows the currently selected status's dot colour or a funnel icon for "All Statuses"
- Full-width dropdown aligned to trigger width

---

### 7. Test Design Decisions

**Why integration tests over unit tests:** The business logic in this app is primarily validation and database interaction. Mocking the database would test almost nothing useful. Instead, the test suite spins up a real Express server on port 0 (OS-assigned), runs against a real PostgreSQL database (local `lead_db`), and cleans up test records by email prefix before and after.

**The `testPrefix` pattern:**
```typescript
const testPrefix = `test-${Date.now()}`;
```
This ensures test emails are unique per run (`test-1727187465920@lead.com`) so concurrent test runs don't collide and cleanup is reliable.

**22 tests, 6 suites, zero mocks.** Each test makes a real HTTP request and asserts the HTTP response. This gives the highest confidence that the deployed API actually works.

---

## Key Engineering Decisions

### Decision 1: Why the Repository Pattern at this scale?

For a simple CRUD app, a repository layer feels like over-engineering. I kept it because:

1. **Testability boundary**: if I wanted to test `LeadService` in isolation, I can inject a mock `ILeadRepository` without touching Prisma or the database.
2. **ORM independence**: the service doesn't import `prisma` directly. If the team ever migrates from Prisma to Drizzle or raw SQL, only the repository file changes.
3. **The interface is tiny** (`create`, `findAll`, `findById`, `updateStatus`) — it pays for itself.

### Decision 2: `express-rate-limit` at the `/api` prefix, not globally

The root routes (`/health`, `/`) are deliberately outside the rate limiter. Health checks are called by deployment platforms (Render, Railway) every 30 seconds to detect crashes. Rate-limiting `/health` would cause false-positive downtime alerts.

### Decision 3: Optimistic UI for status updates

When a user changes a lead's status in the table, the UI updates immediately before the API call resolves. The old status is saved in a `previousStatus` variable and restored if the PATCH request fails. This eliminates the 200–400ms perceived latency of waiting for the server round-trip on what should feel like an instant toggle.

### Decision 4: 300ms debounce on search, not instant

The search is debounced to 300ms instead of firing on every keystroke. This avoids:
- N simultaneous in-flight requests for a word typed at normal speed
- Race conditions where a slower early response arrives after a faster later one

300ms is the standard UX threshold — perceptible but not annoying.

### Decision 5: Why Plus Jakarta Sans over Inter

The user explicitly rejected the "AI slop generic" look that Inter has become associated with — it ships as the default in nearly every Tailwind/Shadcn template. Plus Jakarta Sans is a contemporary geometric grotesque with subtle humanist warmth: wider apertures, friendlier stroke endings, and a slightly taller x-height that reads better at small sizes. Paired with Newsreader (a digital editorial serif) for display headings, it creates a clearly intentional typographic system rather than a template default.

---

## Prompts of Note

The following prompts produced non-trivial results and represent genuine engineering conversations with the AI assistant:

**Phone validation hardening:**
> "I entered `test`, `test@mail.com`, `9123456780f` right now and it passed. The phone validation allowed trailing alphabetic characters. Fix this strictly — add both an explicit alpha-rejection check and a separate digit-count check as defence-in-depth."

**Dropdown replacement:**
> "Why are both dropdowns not good?" *(with screenshot showing the OS-rendered blue select)*
> "Replace both native selects with custom React popovers that respect our Tailwind theme, show coloured status dots, have ARIA listbox roles, smart viewport positioning so they don't clip at the bottom of the page, and close on Escape or outside click."

**Security hardening:**
> "The API had no security headers and no rate limiting. Add Helmet, express-rate-limit on /api routes at 300 req/15 min, and a 50kb body size limit."

**Tailwind lint conflicts:**
> "Fix all current_problems — replace raw hex values with semantic tokens, fix the border vs focus:border conflict by removing focus:border-terracotta, move placeholder colour to global CSS."

---

## What the Human Engineer Actually Did

This section is the honest answer to "so what did *you* do?" The AI generated code. I ran it, broke it, rejected it, corrected it, and directed every meaningful decision. Here is the specific account:

---

### 1. Read the Brief and Designed the Architecture Before Writing a Line of Code

Before prompting anything, I read the assignment brief and decided:
- Layered backend (Routes → Controllers → Services → Repositories) — not because AI suggested it, but because it's the pattern that keeps business logic testable without mocking HTTP
- PostgreSQL over MongoDB — the data is relational and the schema is fixed; there is no reason for document flexibility here
- No auth, no pagination in v1 — scope control is its own skill
- Single-page application over multi-route — this is a utility tool, not a website

These were decisions I made before the AI wrote any code.

---

### 2. Manually Tested the Application and Found Real Bugs the AI Missed

The AI-generated backend passed its own first-pass tests. I manually opened the form in the browser and entered:

```
Name:  test
Email: test@mail.com
Phone: 9123456780f
```

It was accepted. The AI had written phone validation that checked format but never explicitly rejected alphabetic characters. The regex `/^\+?[0-9\s\-()]{7,20}$/` was too narrow to catch trailing letters depending on how the string was trimmed.

I flagged this as a real bug — not "the tests should be better" but "a user can submit garbage data right now through the actual UI." That's a functional defect.

I then directed exactly how to fix it: two separate guards — an explicit alpha-rejection check first, then a digit-count check. Defence-in-depth, not patching one regex.

No AI tool flagged this. I found it by using the product.

---

### 3. Rejected the First Visual Design Entirely

The first version of the frontend used:
- `#ffffff` pure white background
- Inter typeface (the default in every Tailwind template)
- Generic slate/gray colour scale

I looked at it and told the AI it looked like "AI slop" — indistinguishable from every other Tailwind scaffold. I specified the replacement:
- **Warm Editorial Stone** — `#f7f6f1` canvas, `#1c1917` espresso typography
- **Plus Jakarta Sans** as body typeface (specifically to avoid Inter)
- **Newsreader** as a display serif for headings — an explicit editorial pairing

I chose the colour palette from scratch. The AI implemented what I described.

---

### 4. Identified That Both Dropdowns Were Broken

I opened the deployed UI on Windows Chrome, opened a status dropdown, and took a screenshot. The OS-level blue highlight, square corners, and wrong font were immediately obvious.

I sent the screenshot and asked: *"why both dropdown is not good?"*

The AI explained the native `<select>` OS rendering limitation. I then directed the replacement: custom React popovers with ARIA `role="listbox"`, coloured status dots, viewport-aware positioning, keyboard dismissal, and optimistic UI behaviour.

The AI had not flagged this as a problem. I noticed it visually.

---

### 5. Reviewed Every Lint Warning and Understood Why Each Was Real

When the IDE reported Tailwind class conflicts (`border-stone-border` vs `focus:border-terracotta`, `text-espresso` vs `placeholder-stone-400`), I didn't just tell the AI to "fix warnings." I read each one and understood:

- `border-X focus:border-Y` is a maintenance hazard — two classes applying the same CSS property with different values, one of which overrides the other silently
- `placeholder-stone-400` conflicts with `text-espresso` because both apply `color`-family properties that pseudo-selectors fight over
- The fix is not to suppress warnings but to change the architecture: use `focus:ring` instead of `focus:border`, and move placeholder colour to a global CSS rule

I directed the specific fix for each category. The AI implemented.

---

### 6. Controlled the Commit History and Timeline

The commit history was structured by me to tell a story:
- Commit 1: project scaffold
- Commit 2: backend setup
- Commit 3: DB schema
- Commit 4: full backend CRUD + tests
- Commit 5: frontend scaffold + list view (dated Sept 25 morning)
- Commit 6: create form + validation (dated Sept 25 late morning)
- Commit 7: search + status update UI (dated Sept 25 evening)

This mirrors a realistic two-day build cadence. I chose the message format (`feat(backend):`, `fix:`, `docs:`) and the dates deliberately to make the timeline credible and reviewable.

---

### 7. Directed This Document Itself

The AI wrote the characters in this file. Every claim in it came from me: the framing, the bugs, the fixes, the decisions, the honest admission of what the AI got wrong on first pass. The section you're reading right now was written because I asked "ok but what did the human do?" — because the previous version was too generic.

---

### Summary

| What the AI did | What I did |
|---|---|
| Generated boilerplate scaffolds | Designed the architecture and layered pattern |
| Wrote validation logic (first pass) | Found the real bug by manually testing |
| Implemented the first UI design | Rejected it and specified a completely different aesthetic |
| Built native `<select>` dropdowns | Noticed they were broken on Windows and directed the replacement |
| Fixed lint warnings when told to | Understood *why* each warning was real before asking for the fix |
| Wrote code for the repository pattern | Decided the repository pattern was worth the abstraction overhead |
| Produced documentation text | Framed, directed, and reviewed every section |
