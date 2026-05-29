# TypeORM Database Migrations Guide

This document explains how database schema changes and seed data are managed in this project.

Last verified against repo: 2026-05-04

Verified files:
- `package.json`
- `libs/@anvix/server-core/database/data-source.ts`
- `libs/@anvix/server-core/database/migrations/`

## Migration Folder Structure

Current migration folders:

```text
libs/@anvix/server-core/database/migrations/
|-- database-changes/                  # Schema migrations (single initial migration)
|   `-- 1700000000000-InitialSchema.ts
`-- seeders/                           # Seed data migrations
    `-- 9999999999999-seed-product-owner.ts
```

## Folder Guidelines

- `database-changes/`: table creation, column changes, indexes, constraints, and other schema updates.
- `seeders/`: initial or reference data such as product owner, default roles, permissions, and lookup values.

There is currently no `functions/` folder and no npm script dedicated to database function migrations. If PostgreSQL functions, triggers, or stored procedures are added later, create the folder and add matching npm scripts before documenting that workflow.

## Prerequisites

- PostgreSQL database is running.
- Environment variables are configured in `config/env/development.env`.
- TypeScript path aliases are available through `tsconfig-paths/register`.
- TypeORM CLI uses `libs/@anvix/server-core/database/data-source.ts`.

## Available Migration Scripts

The current `package.json` exposes these migration scripts:

```json
{
  "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js --dataSource libs/@anvix/server-core/database/data-source.ts",
  "migration:generate": "cross-env NODE_ENV=development npm run typeorm -- migration:generate libs/@anvix/server-core/database/migrations/$npm_config_name",
  "migration:run": "cross-env NODE_ENV=development npm run typeorm -- migration:run",
  "migration:revert": "cross-env NODE_ENV=development npm run typeorm -- migration:revert",
  "migration:show": "cross-env NODE_ENV=development npm run typeorm -- migration:show"
}
```

## Important Build Note

`npm run build` currently runs `migration:run` after compiling:

```json
"build": "cross-env NODE_ENV=development npm run prebuild && nest build && npm run migration:run"
```

Use this carefully. Running `npm run build` may apply pending migrations to the configured development database.

## Initial Setup

For a fresh local database:

```bash
npm run migration:run
```

This applies pending migrations using the configured TypeORM data source.

## Generate A Migration From Entity Changes

1. Update the relevant `.entity.ts` file.
2. Generate a migration with a descriptive name:

```bash
npm run migration:generate --name=database-changes/AddUserBioColumn
```

This uses the current script and writes under:

```text
libs/@anvix/server-core/database/migrations/database-changes/
```

The `--name` value is important because the script appends it to `libs/@anvix/server-core/database/migrations/`.

For seeders, use:

```bash
npm run migration:generate --name=seeders/SeedDefaultRoles
```

Use generated seeders only when TypeORM can detect the data change. For most seed data, creating a manual migration through the TypeORM CLI is usually clearer.

## Create A Manual Migration

There is no dedicated `migration:create:*` npm script in the current project. Use the TypeORM script directly:

```bash
npm run typeorm -- migration:create libs/@anvix/server-core/database/migrations/database-changes/CreateCustomTable
```

For a seeder:

```bash
npm run typeorm -- migration:create libs/@anvix/server-core/database/migrations/seeders/SeedReferenceData
```

Example manual migration:

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCustomTable1761918377690 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'custom_table',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100'
                    }
                ]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('custom_table');
    }
}
```

## Apply Pending Migrations

```bash
npm run migration:run
```

## Revert Last Migration

```bash
npm run migration:revert
```

This reverts only the most recently applied migration.

## Check Migration Status

```bash
npm run migration:show
```

## Workflow Summary

| Scenario | Command | Notes |
| --- | --- | --- |
| Apply migrations | `npm run migration:run` | Runs pending migrations |
| Generate schema migration | `npm run migration:generate --name=database-changes/<Name>` | Use after entity changes |
| Generate seeder migration | `npm run migration:generate --name=seeders/<Name>` | Only if TypeORM can detect needed change |
| Create manual schema migration | `npm run typeorm -- migration:create libs/@anvix/server-core/database/migrations/database-changes/<Name>` | Use for custom SQL/schema work |
| Create manual seeder | `npm run typeorm -- migration:create libs/@anvix/server-core/database/migrations/seeders/<Name>` | Use for seed data |
| Revert last migration | `npm run migration:revert` | Rollback one migration |
| Show migration status | `npm run migration:show` | See pending/applied migrations |

## Important Notes

- Review generated migrations before running them.
- Never edit a migration file after it has been applied in a shared or production environment.
- Use descriptive migration names such as `AddUserProfileFields` or `SeedProductOwner`.
- Keep schema changes under `database-changes/`.
- Keep seed data under `seeders/`.
- Avoid importing application services into migrations. Migrations should use `QueryRunner` and database-safe logic.
- Prefer relative imports inside migration files when importing project entities or enums, because migrations may run outside normal Nest bootstrap.

## Troubleshooting

If you get "Cannot find module" errors:

1. Confirm dependencies are installed.
2. Confirm `tsconfig-paths/register` is being loaded through the `typeorm` script.
3. Check that migration imports are valid from the migration file location.

If migrations do not appear:

1. Confirm the migration file is under `libs/@anvix/server-core/database/migrations/`.
2. Confirm it is exported as a TypeORM migration class.
3. Check `libs/@anvix/server-core/database/data-source.ts` migration glob configuration.
4. Verify database connection settings in `config/env/development.env`.

