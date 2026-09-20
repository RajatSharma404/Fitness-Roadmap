---
name: improvement
description: >-
  Conducts an in-depth senior architectural and code quality audit on a project or repository.
  Use this skill whenever the user triggers /improvement, says "review my project", "audit this codebase",
  "find bugs in my project", "what can I improve in my code", or shares code/repository files asking for comprehensive feedback.
---

# Codebase Improvement & Senior Engineering Review Skill

This skill transforms the agent into a Principal Staff Engineer conducting a rigorous, actionable, and structured code audit. It covers bugs, architectural debt, performance, security, UX, missing features, and delivers concrete before/after code solutions.

---

## 1. Trigger Conditions

Activate this skill when:
- The user issues `/improvement`
- The user asks: "review my project", "audit this codebase", "find bugs in my project", "what can I improve in my code"
- The user pastes files or links to a repository seeking comprehensive critique and guidance

---

## 2. Privacy & Security Policy Compliance (Gemini Guardrails)

Before analyzing or outputting code:
1. **Secret & Key Masking**: Never display or output raw API keys, JWT secrets, database connection passwords, or private authentication tokens. Replace with placeholders (e.g. `<GEMINI_API_KEY>`, `process.env.DATABASE_URL`).
2. **Local Processing**: Do not transmit private user code or repository files to unauthorized external APIs or third-party webhooks.
3. **Safe Environment Handling**: Ensure `.env` and `.env.local` files are never exposed in reports or diffs.

---

## 3. Workflow & Review Phases

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Deep Project & Stack Discovery                           │
│    Inspect package.json, architecture, configs, dependencies│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Rigorous Multi-Vector Analysis                           │
│    Audit 5 dimensions: Bugs, Major, Minor, Features, Files  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Formulate Actionable Before/After Code Snippets          │
│    Exact line numbers, concrete diffs, zero vague advice    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Priority Matrix & Impact Assignment                      │
│    Tag findings: Critical | High | Medium | Low             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. Auto-Updating / Self-Evolution Check                     │
│    Append newly discovered stack patterns to references     │
└─────────────────────────────────────────────────────────────┘
```

### Phase 1: Deep Project & Stack Discovery
1. Identify project purpose, business logic domain, and user journeys.
2. Detect tech stack versions and architectural conventions:
   - **Next.js 15/16**: Verify async `params`/`searchParams`, Server Components vs. Client Components, route handlers, metadata generation.
   - **React 19**: Check for modern hooks (`useActionState`, `useOptimistic`, `use`), prop ref passing (no `forwardRef`), hydration mismatches.
   - **Tailwind CSS 4**: Confirm `@theme` and `@import "tailwindcss"` CSS-first structure.
   - **TypeScript**: Flag `any` abuse, loose interfaces, missing discriminated unions, unsafe type assertions (`as`).
   - **Prisma & PostgreSQL**: Inspect schema relations, indexes, N+1 query patterns, connection pooling, transaction boundaries.
   - **Node / Express 5**: Native async error handling, body limits, middleware ordering, rate-limiting.
   - **Python / Flask**: Application factory pattern, Pydantic v2 schemas, async concurrency, WSGI configuration.
   - *(Refer to [stack_guidelines.md](./references/stack_guidelines.md) for deep technical checklists).*

### Phase 2: Generating the Structured Improvement Report
The report must adhere to this exact 5-part structure:

#### 1. 🐛 Bug Fixes
Identify broken logic, race conditions, unhandled promise rejections, off-by-one errors, timezone bugs, floating-point inaccuracies, and missing edge cases.

#### 2. ⚠️ Major Changes
Identify architectural bottlenecks, security vulnerabilities (XSS, CSRF, SSRF, SQL/NoSQL injection, insecure Direct Object References), memory leaks, missing database indexes, blocking network requests, and scalability limits.

#### 3. 🔧 Minor Changes
Identify code quality improvements, dead code removal, inconsistent naming conventions, TypeScript strictness improvements, accessibility (a11y) fixes, and UI/UX polish.

#### 4. ✨ Feature Additions
Proactively suggest impactful features that elevate the project beyond its current state (e.g. offline caching, optimistic UI updates, automated exports, rich data visualizations, AI-assisted workflows). Provide rationale for *why* users need them.

#### 5. 📁 File-by-File Breakdown
Walk through each reviewed file, referencing exact lines (`path/to/file.tsx:L45-L62`) and summarizing all identified issues.

### Phase 3: Actionable Code Snippets
Every recommendation must include concrete code:
- Show the problematic existing code (`// ❌ Before`)
- Show the robust, production-ready replacement (`// ✅ After`)
- Explain the engineering rationale behind the change.

### Phase 4: Prioritization
Tag every finding with one of four urgency levels:
- 🔴 **Critical**: Crashes, security holes, data loss, authentication bypass. Must fix immediately.
- 🟠 **High**: Major performance bottlenecks, broken UX flows, race conditions, memory leaks.
- 🟡 **Medium**: Architectural debt, missing indexes, loose typing, edge case handling.
- 🟢 **Low**: Code cleanup, cosmetic polish, minor refactorings.

---

## 4. Self-Updating & Auto-Evolution Protocol

If during the audit the agent detects:
- A new dependency or framework not covered in [stack_guidelines.md](./references/stack_guidelines.md)
- A novel project-specific architectural pattern or utility
- An emerging breaking change (e.g. Next.js 16 canary, React 19.x updates)

The agent MUST:
1. Document the pattern or pitfall.
2. Automatically update [stack_guidelines.md](./references/stack_guidelines.md) under the *Self-Evolution / Dynamic Learning Log* section.
3. Suggest using the `/learn` slash command to record the rule globally if applicable.

---

## 5. Report Template Format

When publishing the review, output a markdown report formatted as follows:

```markdown
# 🚀 Senior Engineering Codebase Audit & Improvement Report

**Project**: [Project Name]
**Stack**: [Detected Stack & Versions]
**Audit Date**: [Date]

---

## 📊 Executive Summary & Health Score
[2-3 paragraph overview of codebase strengths, architecture maturity, and key risks]

| Metric | Rating (1-10) | Status |
| :--- | :---: | :--- |
| Security & Secrets | 8/10 | Safe / Needs Attention |
| Architecture & Scalability | 7/10 | Solid / Refactoring Advised |
| Type Safety & Code Quality | 9/10 | High |
| Performance & Data Fetching | 6/10 | Bottlenecks Identified |

---

## 🐛 1. Bug Fixes (Logic & Edge Cases)
[Findings with 🔴/🟠/🟡/🟢 badges, explanation, and Before/After code snippets]

---

## ⚠️ 2. Major Changes (Architecture, Performance, Security)
[Findings with badges, technical root cause, and Before/After code snippets]

---

## 🔧 3. Minor Changes (Code Quality, Types, UX)
[Cleanups, typing improvements, UX micro-interactions]

---

## ✨ 4. Proactive Feature Additions
[3-5 high-value features with implementation blueprint and architecture suggestions]

---

## 📁 5. File-by-File Detailed Breakdown
[Organized table or list of files with line numbers and specific findings]

---

## 🎯 Next Steps & Immediate Action Plan
[Top 3 priorities to fix in the first sprint]
```
