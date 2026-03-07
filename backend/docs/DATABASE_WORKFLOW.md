# WorkzUp Database Team Workflow

Welcome to the WorkzUp engineering team! This document outlines strictly enforced best practices for managing our Supabase PostgreSQL database via Prisma ORM.

## 1. Branching Strategy for DB Changes

Database changes can be destructive and cause merge conflicts. Therefore, we follow a strict branching model:
1. **Never build schema changes on `main`**. Checkout a feature branch: `git checkout -b feature/user-profile-enhancements`.
2. Do not use `npx prisma db push` inside your local dev environment for changes that are intended to be checked into source control (unless you are purely prototyping).
3. Always finalize your `schema.prisma` changes, then run `npx prisma migrate dev --name <describe_your_change>`. This will generate a SQL trace inside `backend/prisma/migrations/`.
4. Commit both the `schema.prisma` and the `migrations/` folder into your PR.

## 2. Preventing Migration Conflicts

In an agile team, two members might generate migrations simultaneously on different branches. 

**Rule: Always rebase before generating a migration.**
- *If* you pull `main` into your feature branch and see someone else added a migration folder:
  - DO NOT run `migrate dev` immediately. 
  - Instead, run `npx prisma migrate resolve --applied <their_migration_folder_name>`.
  - Then run your own `npx prisma migrate dev` to append your changes cleanly to the top of the SQL chain.

## 3. Production vs Development Architecture

We operate with isolated database environments defined in your `.env`:
*   **Production**: Pointed to by `DATABASE_URL` during Vercel/CI builds. Uses transaction pooling.
*   **Local Dev**: Optionally a local Postgres Docker container, or a distinct Supabase project.

**Never run `npx prisma migrate dev` against the Production Database.** 
During deployment scenarios, the CI/CD pipeline runs `npx prisma migrate deploy`, which safely executes pending SQL files against Production without risking the "Reset Database" prompt.

## 4. Prisma Shadow Databases

When creating migrations, Prisma spins up a temporary "Shadow Database" to diff the state. Supabase handles this natively, but if you run into shadow errors, verify that the active database user in your `DIRECT_URL` string contains full sweeping admin table creation privileges.

---
**Recap:**
✅ **DO**: `npx prisma migrate dev --name <change>` on local feature branches.
❌ **DONT**: `npx prisma db push` bypassing migration history tracking for team deployments.
✅ **DO**: `npx prisma migrate deploy` exclusively inside CI/CD scripts.
