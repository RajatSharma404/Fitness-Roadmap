# Stack Guidelines & Pitfalls Reference

This reference documents common architectural pitfalls, breaking changes, and high-leverage patterns for modern full-stack web applications.

---

## 1. Next.js 15/16 & React 19

### Async Route & Page Parameters
In Next.js 15+, dynamic route parameters and search parameters are asynchronous Promises:
- **Incorrect (legacy):**
  ```typescript
  export default function Page({ params }: { params: { id: string } }) {
    const { id } = params; // Error in Next.js 15+
  }
  ```
- **Correct (Next.js 15+):**
  ```typescript
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  ```

### React 19 Server Actions & Form State
- Deprecated `useFormState` replaced with `useActionState` from `'react'`.
- Deprecated `useFormStatus` moved to `react-dom`.
- Form actions can be passed directly to `<form action={action}>` and `<button formAction={action}>`.
- Avoid passing raw server action promises without pending state handlers.

### React 19 Component Ref Pattern
- `forwardRef` is deprecated. Pass `ref` directly as a regular prop:
  ```typescript
  // React 19 pattern
  export function CustomInput({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> } & React.InputHTMLAttributes<HTMLInputElement>) {
    return <input ref={ref} {...props} />;
  }
  ```

### Server vs. Client Boundary & Secret Leaking
- Never import server-only modules (`@prisma/client`, database connectors, private API secrets) inside files marked with `'use client'`.
- Ensure all public environment variables use `NEXT_PUBLIC_` prefix. Never expose raw API secret keys to client components.

---

## 2. Tailwind CSS v4

- Tailwind CSS v4 is CSS-first. Configuration is handled in CSS using `@theme` and `@import "tailwindcss";` rather than `tailwind.config.js`.
- Class names with arbitrary values should align with CSS variables: `bg-(--color-primary)`.
- Avoid conflicting utility classes (use `clsx` and `tailwind-merge` properly).

---

## 3. Prisma & PostgreSQL

- **N+1 Query Elimination**: Always leverage `include` or `select` relations instead of nested loops of `prisma.<model>.findMany` or `findUnique`.
- **Global Prisma Instance**: Next.js hot-reloading instantiates multiple client connections if not attached to `globalThis`:
  ```typescript
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  ```
- **Transaction Safety**: Wrap multi-step dependent writes in `prisma.$transaction([ ... ])` or interactive transactions `prisma.$transaction(async (tx) => { ... })`.
- **Database Connection Pooling**: Ensure `DATABASE_URL` uses PgBouncer or pooling parameters (`?pgbouncer=true&connection_limit=10`) when deployed in serverless environments.

---

## 4. Node.js & Express.js 5

- **Native Async Error Handling**: Express 5 automatically handles rejected promises from async route handlers without needing `express-async-errors` or manual `next(err)` blocks.
- **Request Body Parsing**: Ensure strict body limits (`express.json({ limit: '1mb' })`) to avoid denial of service via oversized payloads.
- **Graceful Shutdown**: Always attach `SIGINT` / `SIGTERM` listeners to close HTTP and database connections cleanly.

---

## 5. Python & Flask

- **Application Factory Pattern**: Use `create_app()` instead of global module-level app instances for testability and isolation.
- **Type Hinting**: Use PEP 484 type annotations (`typing` / built-in generics in Python 3.10+) and Pydantic v2 for payload validation.
- **WSGI / ASGI Safety**: Never run `app.run(debug=True)` in production; use Gunicorn or Uvicorn with proper worker configurations.

---

## 6. Self-Evolution / Dynamic Learning Log
*This section is automatically appended when the agent audits new frameworks, libraries, or architectural patterns.*
