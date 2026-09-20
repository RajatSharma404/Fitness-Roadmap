---
name: nextjs-react19
description: >-
  Specialized engineering standards and patterns for Next.js 15/16, React 19, and Tailwind CSS 4.
  Use this skill when developing App Router pages, server actions, client components, API routes,
  or modern UI layouts in this repository.
---

# Next.js 15/16 & React 19 Architecture Skill

This repository runs on **Next.js 15.5+**, **React 19.2+**, and **Tailwind CSS 4**. This stack introduces major breaking changes from older Next.js versions.

---

## 1. Critical Rules & Breaking Changes

### Rule 1: Async Route Parameters & SearchParams
In Next.js 15+, dynamic route parameters and search parameters are asynchronous `Promise` objects.
```typescript
// ❌ Deprecated (will cause runtime/type errors)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
}

// ✅ Correct Next.js 15+ App Router
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
}
```

### Rule 2: React 19 Server Actions & Action State
- Use `useActionState` from `'react'` instead of deprecated `useFormState`.
- Use `useFormStatus` from `'react-dom'`.
- Pass server actions directly to `<form action={...}>`.

### Rule 3: Client vs. Server Boundaries
- Files with `'use client'` are client boundaries. NEVER import server-only packages (`@prisma/client`, `fs`, database connections, secret keys) inside them.
- Pass server-fetched data as serializable props into client components.

### Rule 4: Tailwind CSS 4 Configuration
- Tailwind CSS v4 is configured via CSS files (`src/app/globals.css`), not `tailwind.config.js`.
- Use `@theme` for design tokens and `@import "tailwindcss";`.

---

## 2. Verification Protocol
After writing or updating Next.js code:
1. Run `npm run lint` or check TypeScript diagnostics with `npx tsc --noEmit`.
2. Verify that client/server imports do not leak secrets or cause bundle bloat.
