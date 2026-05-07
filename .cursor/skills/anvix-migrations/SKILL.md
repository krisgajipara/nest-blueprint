---
name: anvix-migrations
description: Apply Anvix TypeORM migration workflow for schema and seeder changes, including folder conventions, script usage, and safety checks. Use when the user asks to create, generate, run, revert, or troubleshoot migrations.
---

# Anvix Migrations

## Use This Skill When

- Creating schema migrations.
- Creating seeder migrations.
- Running, reverting, or checking migration status.
- Troubleshooting TypeORM migration issues.

## Source of Truth

Read and follow:

- `libs/@anvix/documents/migrations.md`

## Folder Rules

- Schema changes: `libs/@anvix/server-core/database/migrations/database-changes/`
- Seed data: `libs/@anvix/server-core/database/migrations/seeders/`

## Command Rules

- Generate schema migration:
  - `npm run migration:generate --name=database-changes/<Name>`
- Generate seeder migration:
  - `npm run migration:generate --name=seeders/<Name>`
- Create manual schema migration:
  - `npm run typeorm -- migration:create libs/@anvix/server-core/database/migrations/database-changes/<Name>`
- Create manual seeder migration:
  - `npm run typeorm -- migration:create libs/@anvix/server-core/database/migrations/seeders/<Name>`
- Run pending migrations:
  - `npm run migration:run`
- Revert last migration:
  - `npm run migration:revert`
- Show status:
  - `npm run migration:show`

## Safety Requirements

- Review generated migrations before running.
- Do not modify already applied migrations in shared/prod environments.
- Use descriptive migration names.
- Keep migration logic DB-safe (`QueryRunner`), not service-layer dependent.
- Use relative imports inside migration files when needed.
- Treat `npm run build` as migration-applying in this repo; run only intentionally.

## Troubleshooting Flow

1. Confirm migration file path and folder naming.
2. Confirm data source wiring and script usage.
3. Validate imports from migration file location.
4. Check environment config for DB connection.

## Required Output

After migration tasks, report:

- migration files created/updated
- commands run
- pending risks (data loss, rollback gaps, seeding assumptions)
