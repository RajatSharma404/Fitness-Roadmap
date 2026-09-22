---
name: improvement
description: >-
  Conducts an in-depth 360° architectural, code quality, and performance audit across Frontend, Backend, and Database.
  Brainstorms multiple improvement approaches with trade-offs, identifies bugs, major/minor debt, frontend fixes,
  features to merge, add, and optimize, and generates a concrete, phased implementation plan.
  Use this skill whenever the user triggers /improvement, says "review my project", "audit this codebase",
  "find bugs in my project", "what can I improve in my code", "suggest improvements", or requests a full-stack engineering review.
---

# 🚀 Full-Stack Codebase Improvement & Senior Engineering Audit Skill

This skill transforms the agent into a Principal Staff Engineer conducting a rigorous, actionable, and 360° full-stack audit across **Frontend**, **Backend**, and **Database** tiers. 

It does not merely point out issues—it deeply analyzes root causes, **brainstorms multiple viable technical alternatives (Option A vs. Option B vs. Option C)** with trade-offs, selects the optimal path, and generates a **comprehensive, phased implementation plan** ready for execution.

---

## 1. Trigger Conditions

Activate this skill when:
- The user issues `/improvement`
- The user asks:
  - "review my project" / "audit this codebase"
  - "find bugs in my project" / "what can I improve in my code"
  - "suggest improvements for frontend, backend, and DB"
  - "how can I optimize my code and merge duplicate features?"
- The user shares code files, schemas, or repository links requesting an exhaustive architectural critique and improvement plan.

---

## 2. Privacy & Security Guardrails

Before analyzing or outputting code:
1. **Secret & Key Masking**: Never display or output raw API keys, JWT secrets, database credentials, or private tokens. Always sanitize with placeholders (e.g. `<DATABASE_URL>`, `<AUTH_SECRET>`).
2. **Safe Environment Handling**: Ensure `.env`, `.env.local`, and private key files are never exposed in reports or diffs.
3. **Tenant & Data Isolation**: Verify that all database queries enforce tenant isolation (`where: { userId }`).

---

## 3. End-to-End Audit & Planning Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Deep 360° Repository Discovery (Frontend, Backend, DB)  │
│    Inspect package.json, schema.prisma, routes, components  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Rigorous Multi-Vector Analysis                           │
│    • 🐛 Bug Fixes (Logic, Race Conditions, Edge Cases)      │
│    • ⚠️ Major Changes (Architecture, Security, Bottlenecks) │
│    • 🔧 Minor Changes (Code Quality, Types, Cleanup)        │
│    • 🎨 Frontend Fixes & Polish (UI/UX, a11y, Layout, CLS)  │
│    • 🔄 Features to Merge & Consolidate (Prune duplicates)  │
│    • ✨ Features to Add & Elevate (High-value additions)   │
│    • ⚡ Codebase Optimization (Optimal, idiomatic code)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Multi-Alternative Brainstorming Protocol                 │
│    For key improvements, compare Option A vs B vs C         │
│    (Trade-off matrix: Performance, Complexity, DX, Risk)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Concrete Before / After Code Solutions                   │
│    Exact line references, production-ready code replacements│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. Detailed Phased Implementation & Migration Plan          │
│    Step-by-step roadmap with phases, target files, & tests  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Multi-Tier Deep Dive Checklist

Refer to [stack_guidelines.md](./references/stack_guidelines.md) for granular platform rules.

### Tier 1: 🎨 Frontend Architecture & UI/UX
- **React 19 & Next.js 15 Patterns**: Verify `params` and `searchParams` are awaited. Verify `useActionState` and `useFormStatus` are used instead of deprecated hooks. Ensure `ref` is passed directly as a prop (no `forwardRef`).
- **Client vs. Server Boundary**: Ensure client components (`'use client'`) are lean leaf components. Verify server secrets or DB clients are never imported in client bundles.
- **Frontend Fixes & Polish**: Audit layout shifts (CLS), missing `<Suspense>` skeletons, unresponsive breakpoints (< 360px), broken contrast ratios, keyboard accessibility (`aria-labels`, focus rings), and dark mode consistency.
- **State Management**: Audit Zustand, React Context, or URL state for hydration mismatches, unnecessary re-renders, and memory leaks.

### Tier 2: ⚙️ Backend Architecture & API
- **Route Handlers & Server Actions**: Audit validation logic (enforce strict Zod schemas on all inputs). Audit HTTP response status codes and standardized error handling.
- **Authentication & Authorization**: Verify session validity before mutations. Check for Insecure Direct Object References (IDOR).
- **Security & Resilience**: Rate limiting on sensitive endpoints, CORS policies, CSRF protection, and body size limits.

### Tier 3: 🗄️ Database (DB) & Prisma Layer
- **Schema Design & Relations**: Check 1-to-1, 1-to-many, and many-to-many relations for missing foreign key cascades and integrity rules.
- **Indexing Strategy**: Ensure all foreign keys (`userId`, `sessionId`) and query filter columns (e.g. `[userId, createdAt]`) have explicit `@@index` definitions.
- **N+1 Query Elimination**: Audit queries in loops. Replace sequential queries with relational `include` or explicit `select` queries.
- **Transactions & Concurrency**: Check multi-write operations. Ensure dependent updates are executed inside `prisma.$transaction`.
- **Connection Management**: Ensure Prisma singleton is attached to `globalThis` and configured for connection pooling (PgBouncer/Supabase/Neon).

---

## 5. Multi-Alternative Brainstorming Protocol

> [!IMPORTANT]
> The user explicitly requires that after searching for improvements, the agent **must think of multiple ways to improve each key area**. Do not output a single opinionated solution for major changes.

For each significant architectural improvement or feature refactor:
1. Brainstorm **at least 2 to 3 distinct approaches** (Option A vs. Option B vs. Option C).
2. Detail the technical mechanism for each option.
3. Compare them using the evaluation vectors from [alternative_brainstorming.md](./references/alternative_brainstorming.md):
   - **Performance & Latency**
   - **Architectural Complexity**
   - **Developer Velocity & Maintainability**
   - **Reliability & Edge-Case Safety**
4. Declare a clear **Selected Recommendation** with technical justification explaining why it is the optimal choice for this specific codebase.

---

## 6. Features to Merge, Add & Consolidate

Actively look for consolidation and modernization opportunities:
- **Features to Merge / Consolidate**:
  - Duplicate or overlapping components (e.g., three separate card implementations that can be unified into one compound component).
  - Redundant API routes or state stores doing similar tasks.
  - Fragmented utility functions (e.g., multiple date/time formatters or math utilities).
- **Features to Add**:
  - High-impact capabilities that round out the product (e.g., offline queueing, export to CSV/JSON, visual data heatmaps, streak milestones, keyboard shortcuts).
- **Features to Improve**:
  - Transforming fragile MVP features into robust, resilient, accessible enterprise implementations.

---

## 7. Concrete Before / After Code Replacements

Every recommendation must include production-ready, drop-in code:
- `// ❌ Before (Current Suboptimal Code)`: Highlight the exact anti-pattern with file path and line numbers.
- `// ✅ After (Optimized, Modern Replacement)`: Provide complete, fully typed, production-ready code with edge cases handled.
- **Engineering Rationale**: Explain the exact performance, security, or maintainability gain.

---

## 8. Detailed Phased Implementation Plan

Translate all selected recommendations into a structured, step-by-step implementation plan. The plan must follow this format:

```markdown
# 🗺️ Phased Implementation Plan

## Phase 1: 🚨 Critical Bug Fixes & Security Hardening
- **Objective**: Fix active bugs, crashes, race conditions, and security risks.
- **Target Files**:
  - `[MODIFY] path/to/file.ts` (L12-L35)
- **Step-by-Step Actions**:
  1. Action item with exact instructions...
  2. Action item...
- **Verification**: Command to run (e.g. `npx vitest run ...`)

## Phase 2: 🗄️ Database Optimization & Backend Refactoring
- **Objective**: Apply missing indexes, eliminate N+1 queries, add transactions, enforce Zod validation.
- **Target Files**:
  - `[MODIFY] prisma/schema.prisma`
  - `[MODIFY] src/app/api/.../route.ts`
- **Step-by-Step Actions**:
  1. Update schema and generate migration...
- **Verification**: `npx prisma validate && npm run build`

## Phase 3: 🎨 Frontend Polish, UI Fixes & Component Consolidation
- **Objective**: Fix UI glitches, responsiveness, accessibility, and merge redundant components.
- **Target Files**:
  - `[DELETE] src/components/redundant/OldCard.tsx`
  - `[NEW] src/components/ui/UnifiedCard.tsx`
  - `[MODIFY] src/components/dashboard/Overview.tsx`
- **Step-by-Step Actions**:
  1. Implement unified component...
  2. Deprecate and remove redundant files...
- **Verification**: Check UI in browser subagent or run component tests.

## Phase 4: ✨ High-Value Feature Additions & Enhancements
- **Objective**: Build proposed features using the selected brainstorming alternative.
- **Target Files**:
  - `[NEW] src/lib/newFeature.ts`
  - `[NEW] src/components/NewFeatureWidget.tsx`
- **Step-by-Step Actions**:
  1. Build core utility...
  2. Integrate into UI...
- **Verification**: Integration test suite.

## Phase 5: 🧪 Automated Verification & Regression Testing
- **Commands**:
  - Lint: `npm run lint`
  - Typecheck: `npx tsc --noEmit`
  - Unit/Integration Tests: `npx vitest run`
  - Build: `npm run build`
```

---

## 9. Comprehensive Audit Report Template

When executing `/improvement`, the generated audit report must adhere to this structure:

```markdown
# 🚀 Senior Full-Stack Engineering Audit & Improvement Report

**Project**: [Project Name]  
**Stack Detected**: [Next.js, React, Tailwind, Prisma, PostgreSQL, etc.]  
**Audit Date**: [Current Date]

---

## 📊 Executive Summary & Health Scorecards

| Tier | Health Rating (1-10) | Primary Strengths | Critical Vulnerabilities / Bottlenecks |
| :--- | :---: | :--- | :--- |
| 🎨 **Frontend & UI/UX** | 8/10 | Modern layout, clean styling | Skeletons missing, a11y gaps |
| ⚙️ **Backend & APIs** | 7/10 | Next.js 15 App Router | Missing Zod validation, loose error codes |
| 🗄️ **Database & Prisma** | 6/10 | Clean schema modeling | Missing foreign key indexes, N+1 query loops |
| ⚡ **Performance & DX** | 7/10 | Fast initial render | Heavy client components, duplicate state logic |

---

## 🐛 1. Bug Fixes (Logic, Race Conditions & Edge Cases)
[Findings tagged with 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low badges, line references, and Before/After code]

---

## ⚠️ 2. Major Changes (Architecture, Security, Database & Scaling)
[Findings with technical root causes, risk analysis, and Before/After code]

---

## 🔧 3. Minor Changes (Code Cleanliness, Types & Dead Code)
[Typing strictness, linting cleanups, redundant code elimination]

---

## 🎨 4. Frontend Fixes & UI/UX Polish
[Specific UI/UX bugs, layout shifts, mobile responsiveness, hydration safety, a11y fixes]

---

## 🔄 5. Features to Merge & Consolidate
[Duplicate components, fragmented APIs, overlapping state stores to be unified]

---

## ✨ 6. Features to Add & Improve
[3-5 high-leverage feature recommendations with architecture blueprints]

---

## 💡 7. Multi-Alternative Brainstorming & Trade-off Analysis
[For each major improvement: Option A vs. Option B vs. Option C with pros/cons, trade-offs, and selected recommendation]

---

## ⚡ 8. Codebase Optimization & Modern Idioms
[Drop-in optimized before/after code snippets targeting performance bottlenecks]

---

## 📁 9. File-by-File Detailed Breakdown
[Organized table mapping file paths, line ranges, issues detected, and actions required]

---

## 🗺️ 10. Phased Implementation Plan
[Detailed Phase 1 through Phase 5 actionable roadmap as outlined in Section 8]
```

---

## 10. Verification Protocol

After conducting the audit and preparing the plan:
1. Validate that all file paths and line numbers correspond to the active repository.
2. Ensure every recommended code change follows the exact framework versions (Next.js 15, React 19, Tailwind v4, Prisma 6).
3. If new patterns or framework quirks are discovered, append them to `stack_guidelines.md`.
