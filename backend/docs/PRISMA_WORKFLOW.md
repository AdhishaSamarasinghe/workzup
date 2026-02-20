# Prisma DB Migration & Team Workflow Strategy

In a 6-member team, database schema changes can quickly cause conflicts and break environments if multiple developers apply migrations concurrently. This strategy ensures seamless database management using Prisma ORM with PostgreSQL.

---

## 1. Environment & Database Strategy

To prevent development friction, the core principle is **Isolation**.

> [!IMPORTANT]
> **Never** share a single development database among developers.

*   **Local Databases (Development)**
    *   Every developer **must** have their own local PostgreSQL instance (via Docker, Postgres.app, or a personal neon/supabase free tier).
    *   The `DATABASE_URL` in their local `.env` should point to their *personal* DB instance.
*   **Staging Database (Testing)**
    *   A shared cloud database mirroring the structure of the production database.
    *   Used solely for testing the merged main branch before triggering production deployments.
*   **Production Database (Live)**
    *   The live user data. Highly restricted.

---

## 2. Feature Branch Workflow (The Golden Path)

When a developer needs to alter the database schema (e.g., adding a new model or column):

### Step 1: Branch Creation
Create a standard feature branch from the latest `main`.
```bash
git checkout main
git pull origin main
git checkout -b feature/add-user-avatar
```

### Step 2: Modify the Schema
Edit `backend/prisma/schema.prisma` locally.

### Step 3: Generate Local Migration
Run a development migration naming the change descriptively. 
> [!CAUTION]
> Do NOT use `npx prisma db push` when working in a team. Always use migrations so changes are tracked in git via SQL files.

```bash
npx prisma migrate dev --name add_user_avatar
```
*This generates a new `.sql` file inside `prisma/migrations/` and updates your local database.*

### Step 4: Commit & Push
Commit both the updated `schema.prisma` and the newly generated `prisma/migrations/` folder.
```bash
git add prisma/
git commit -m "feat: db migration for user avatars"
git push origin feature/add-user-avatar
```

---

## 3. Pull Request & Code Review Rules

When the PR is opened, reviewers must adhere to the following checklist for schema changes:

1.  **Migration File Present**: Ensure there is a corresponding `migration.sql` file alongside the `schema.prisma` changes.
2.  **No Direct Data Destruction**: Refuse migrations that blindly drop columns in production (e.g., dropping a `salary` column without a multi-release phase).
3.  **Default Values on New Required Fields**: If a developer adds a new *required* field to an existing model, the migration must include a default value, otherwise applying the migration will fail on environments where rows already exist.
4.  **Indexes**: Ensure foreign keys or frequently queried fields have `@@index()`.

---

## 4. Resolving Migration Conflicts (CRITICAL)

With 6 developers, two people will inevitably create separate migrations simultaneously on different branches. 

**Scenario**: 
*   Developer A merges Migration `2026_01_A` into `main`.
*   Developer B is working on branch `feature-B` and generated Migration `2026_01_B`.
*   Developer B pulls `main` into their branch, causing a Prisma migration history conflict.

### The Fix (Developer B's responsibility):
Developer B must **reset** their local migration and regenerate it on top of Developer A's merged code.

1. Wipe the conflicting local migration folder they just created:
   ```bash
   rm -rf prisma/migrations/2026_01_B
   ```
2. Reset the local database (WIPES LOCAL DB, applies Developer A's migration cleanly):
   ```bash
   npx prisma migrate reset
   ```
3. Re-generate Developer B's migration on top of the clean slate:
   ```bash
   npx prisma migrate dev --name developer_b_feature
   ```

---

## 5. CI/CD & Production Deployment Strategy

Never run migrations manually from your laptop against the Production database. Rely on an automated CI/CD pipeline (e.g., GitHub Actions).

> [!WARNING]
> Use `npx prisma migrate deploy` in CI/CD, **never** `npx prisma migrate dev`.

### Example Deployment Steps (CI/CD Pipeline)

```yaml
# 1. Install dependencies
- run: npm ci

# 2. Generate Prisma Client (builds JS types from schema)
- run: npx prisma generate

# 3. Apply missing migrations to Production safely
- run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}

# 4. Start the server
- run: npm run start
```

### Why `migrate deploy`?
*   It does **not** reset the database if it detects drift.
*   It does **not** ask interactive prompts.
*   It only runs `.sql` files that haven't been applied yet.

---

## Summary Cheat Sheet 

| Action | Command to Use | When to use it? |
| :--- | :--- | :--- |
| **Local Schema Edit** | `npx prisma migrate dev --name <desc>` | creating new schema changes |
| **Pulling teammates code**| `npx prisma migrate dev` | applying teammates merged migrations |
| **Fixing local DB drift** | `npx prisma migrate reset` | resolving conflicts or resetting local test data |
| **Deploying to Prod** | `npx prisma migrate deploy` | Inside CI/CD pipeline only |
| **Updating App Types** | `npx prisma generate` | Whenever you pull code, before starting the server |
