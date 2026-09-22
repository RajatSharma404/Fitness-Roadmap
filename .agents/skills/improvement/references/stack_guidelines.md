# Full-Stack Audit Checklists & Stack Guidelines Reference

This reference documents exhaustive architectural checks, performance benchmarks, and high-leverage patterns across Frontend, Backend, and Database tiers.

---

## 1. 🎨 Frontend Tier Audit Checklist

### React 19 & Next.js 15 App Router
- [ ] **Async Params**: Are `params` and `searchParams` properly handled as async Promises (`await params`) in layouts, pages, and route handlers?
- [ ] **Modern Hooks**: Are legacy hooks (`useFormState`, `useFormStatus` from wrong packages) migrated to React 19 `useActionState` (from `'react'`) and `useFormStatus` (from `'react-dom'`)?
- [ ] **Component Ref Pattern**: Is `forwardRef` removed in favor of direct `ref` prop passing (React 19 standard)?
- [ ] **Client Boundary Discipline**: Are components marked `'use client'` strictly restricted to interactive leaf nodes? Are server-only libraries or secrets leaked?
- [ ] **Hydration Safety**: Are there mismatched browser/server states (e.g. `window.localStorage`, `new Date()`, random IDs) rendered directly without `useEffect` or `useSyncExternalStore`?

### UI/UX, Styling & Accessibility
- [ ] **Tailwind CSS v4 Standards**: Are styling rules using CSS-first `@theme` and `@import "tailwindcss";` rather than legacy JS configs? Are custom colors defined via theme tokens?
- [ ] **Visual Hierarchy & Aesthetics**: Does the UI feel cohesive and premium (consistent border-radii, balanced spacing, curated HSL color palettes, dark-mode support, subtle micro-animations)?
- [ ] **Layout Shifts & Skeletons**: Are dynamic data sections wrapped in `<Suspense>` with skeleton fallbacks to prevent Cumulative Layout Shift (CLS)?
- [ ] **Accessibility (a11y)**: Do interactive controls have `aria-label`, keyboard navigation focus rings (`focus-visible:ring-2`), and appropriate semantic roles (`<button>`, `<nav>`, `<main>`)?
- [ ] **Mobile Responsiveness**: Do grids and flexboxes scale down gracefully to 360px without horizontal scrollbars? Are touch targets at least 44x44px?

---

## 2. ⚙️ Backend Tier Audit Checklist

### API Routes & Server Actions
- [ ] **Input Validation**: Is every incoming request body, query parameter, and route parameter strictly validated using a schema validator like Zod?
- [ ] **Authentication & Authorization**: Is user identity verified before executing data mutations or fetching private resources? Is tenant isolation enforced (e.g. `where: { userId: session.userId }`)?
- [ ] **Error Handling & Status Codes**: Do endpoints catch and log unexpected exceptions while returning structured, sanitized error payloads with appropriate HTTP status codes (400, 401, 403, 404, 429, 500)?
- [ ] **Rate Limiting & Abuse Prevention**: Are public or expensive endpoints protected against brute-force or denial-of-service?
- [ ] **Safe Secret Isolation**: Are environment variables accessed safely? Are private keys never prefixed with `NEXT_PUBLIC_`?

---

## 3. 🗄️ Database & Data Layer Audit Checklist

### Prisma 6 & PostgreSQL
- [ ] **N+1 Query Elimination**: Are queries leveraging `include` or explicit `select` to retrieve relations in a single query rather than iterating with sequential `findUnique` or `findMany`?
- [ ] **Indexing Strategy**:
  - Are foreign keys (`userId`, `workoutSessionId`, `routineId`) indexed with `@@index`?
  - Are search/filter combinations indexed with compound indexes (e.g., `@@index([userId, createdAt])`)?
  - Are unique constraints enforced at the DB level (`@unique` / `@@unique`)?
- [ ] **Prisma Client Singleton**: Is the Prisma client initialized once on `globalThis` to prevent connection leaks during development hot-reloading?
- [ ] **Connection Pooling**: Is the connection string configured with connection pooling (e.g., PgBouncer / Supabase / Neon pooler) to avoid exhausting PostgreSQL connection pools under serverless spikes?
- [ ] **Transactional Integrity**: Are multi-step dependent writes wrapped in `prisma.$transaction([ ... ])` or interactive transactions `prisma.$transaction(async (tx) => { ... })` to prevent orphaned records?
- [ ] **Cascade Deletes**: Are relations configured with `onDelete: Cascade` where appropriate to avoid foreign key violation crashes on deletions?

---

## 4. ⚡ Codebase Optimization & Modernization

### Algorithmic & Memory Efficiency
- [ ] **Over-fetching**: Are database queries selecting only the required columns (`select: { id: true, title: true }`) instead of returning full records with heavy JSON fields?
- [ ] **Memoization & Rerenders**: Are expensive client computations memoized using `useMemo`? Are callback references stabilized with `useCallback` when passed to optimized memoized children?
- [ ] **Bundle Size & Dynamic Imports**: Are heavy non-critical modules (e.g., charting libraries, canvas renderers, audio synthesis) lazy-loaded via `next/dynamic`?
- [ ] **Dead Code & Redundancies**: Are unused imports, obsolete components, and duplicate utility functions pruned?

---

## 5. 🔄 Feature Merging & Consolidation Audit

- [ ] **Duplicate State Stores**: Are multiple stores or contexts managing overlapping data that can be unified?
- [ ] **Component Redundancies**: Are there similar cards, modal dialogs, or inputs that should be refactored into a single versatile, generic component?
- [ ] **Route Consolidation**: Can multiple fragmented API endpoints (e.g., separate endpoints for toggling 3 related flags) be consolidated into a unified resource handler?

---

## 6. Self-Evolution / Dynamic Learning Log
*This section is automatically appended when the agent audits new frameworks, libraries, or architectural patterns.*
