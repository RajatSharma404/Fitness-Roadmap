---
name: prisma-ops
description: >-
  Manages Prisma 6 database schemas, migrations, relations, connection pooling, and seed execution.
  Use this skill when modifying prisma/schema.prisma, running migrations, optimizing database queries,
  or seeding PostgreSQL data.
---

# Prisma 6 & PostgreSQL Operations Skill

This skill governs database operations, migrations, and query performance in `Fitness-Roadmap`.

---

## 1. Safety & Privacy Guardrails
1. **Never Log Secrets**: Never echo `DATABASE_URL` with embedded passwords to logs or markdown.
2. **Non-Destructive Migrations**: Never run `prisma db push --force-reset` in environments containing real user data.
3. **Transaction Safety**: Always use transactions for multi-row dependent writes (e.g. creating workout sessions and updating user XP).

---

## 2. Standard Workflows

### Schema Updates & Migration
When modifying `prisma/schema.prisma`:
1. Edit the schema with appropriate indexes (`@@index([userId])`, `@unique`).
2. Run migration generator:
   ```bash
   npm run db:generate
   ```
3. Create dev migration:
   ```bash
   npm run db:migrate
   ```

### Seed Data Execution
To populate local dev environments:
```bash
npm run db:seed
```

### Query Performance Standards
- Avoid nested iterations calling `prisma.<model>.find...`.
- Use `include` or explicit `select` to fetch related records in a single query.
- Use pagination (`take`, `skip`, or cursor-based pagination) for large lists (e.g., leaderboard, food database, workout history).
