---
name: vitest-guard
description: >-
  Executes, writes, and debugs unit and integration tests using Vitest in this Next.js 15 repository.
  Use this skill when running tests, creating test suites for components or API routes,
  or resolving regressions.
---

# Vitest Testing & Quality Guard Skill

This skill governs test creation, execution, and mocking strategies using Vitest 3+ for React 19 components, custom hooks, and server utilities.

---

## 1. Quick Commands
- Run all tests:
  ```bash
  npm run test:run
  ```
- Run a specific test file:
  ```bash
  npx vitest run src/components/nutrition/DailyFoodDiary.test.tsx
  ```

---

## 2. Mocking Guidelines for Next.js & NextAuth
- **NextAuth Mocking**: Mock `useSession` with authenticated and unauthenticated states:
  ```typescript
  vi.mock('next-auth/react', () => ({
    useSession: vi.fn().mockReturnValue({
      data: { user: { id: 'user-1', name: 'Rajat', email: 'test@example.com' } },
      status: 'authenticated',
    }),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  }));
  ```
- **Next Navigation Mocking**:
  ```typescript
  vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
    usePathname: () => '/dashboard',
    useSearchParams: () => new URLSearchParams(),
  }));
  ```

---

## 3. Best Practices
1. Avoid fragile snapshot tests for dynamic dates or random IDs.
2. Verify edge cases (zero values, empty arrays, null session, network errors).
3. Ensure mock cleanup with `beforeEach(() => vi.clearAllMocks())`.
