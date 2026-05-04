# TypeORM Database Migrations Guide

This document outlines the process for managing database schema changes using TypeORM migrations in this project.

## Migration Folder Structure

Migrations are organized into subfolders for better maintainability:

```
libs/@oc/server-core/database/migrations/
├── database-changes/  # Data Definition Language (schema changes, table alterations)
├── functions/         # Database functions and procedures
└── seeds/             # Data seeding migrations
```

### Folder Guidelines

- **`database-changes/`** - Table creation, column additions/removals, index creation, constraints
- **`functions/`** - PostgreSQL functions, triggers, stored procedures
- **`seeds/`** - Initial data population, reference data, system configuration

## Prerequisites

- Ensure your PostgreSQL database is running
- Environment variables are configured in `config/env/development.env`
- Project is built: `npm run build`

## Migration Commands

### Initial Setup (One-time)

```bash
npm run build
npm run migration:run
```

This creates all tables and initial schema.

### When You Modify Entities

1. **Make changes to your `.entity.ts` files** (add/remove columns, change types, etc.)

2. **Generate migration from changes:**

```bash
npm run migration:generate <MigrationName>
```

Example: `npm run migration:generate --name=add-user-email-index`

3. **Review the generated migration file** in the appropriate subfolder under `libs/@oc/server-core/database/migrations/`

4. **Run the migration:**

```bash
npm run migration:run
```

### Other Useful Commands

- **Check migration status:**

```bash
npm run migration:show
```

- **Revert last migration (if needed):**

```bash
npm run migration:revert
```

## Workflow Summary

| Scenario             | Command                                    | Description                    |
| -------------------- | ------------------------------------------ | ------------------------------ |
| First time setup     | `npm run build && npm run migration:run`   | Create initial database schema |
| After entity changes | `npm run migration:generate --name=<Name>` | Generate migration file        |
| Apply migrations     | `npm run migration:run`                    | Execute pending migrations     |
| Check status         | `npm run migration:show`                   | See which migrations ran       |
| Undo last change     | `npm run migration:revert`                 | Rollback last migration        |

## Examples

### 1. `migration:create:*` - Create Empty Migration

Use this when you need to write custom migration logic manually. Use the appropriate script for your migration type:

```bash
# Database changes migration
npm run migration:create:db-changes --name=CreateCustomTable

# Function migration
npm run migration:create:functions --name=CreateCustomFunction

# Seed migration
npm run migration:create:seeds --name=SeedReferenceData
```

This creates an empty migration file:

```typescript
export class CreateCustomTable1761918377690 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Your custom migration logic here
        await queryRunner.createTable(
            new Table({
                name: "custom_table",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100"
                    }
                ]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("custom_table");
    }
}
```

### 2. `migration:generate` - Generate from Entity Changes

Use this when you've modified entity files:

```typescript
// Add to user.entity.ts
@Column("text", { name: "bio", nullable: true })
bio: string | null;
```

```bash
npm run migration:generate --name=add-user-bio-column
# OR for older npm versions:
npm run migration:generate -- --name=add-user-bio-column
```

Generated migration:

```typescript
export class AddUserBioColumn1761918377690 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "bio" text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN "bio"
        `);
    }
}
```

### 3. `migration:run` - Apply Pending Migrations

Use this to execute all pending migrations:

```bash
npm run migration:run
```

Output example:

```
1 migrations are new migrations must be executed.
Migration AddUserBioColumn1761918377690 has been executed successfully.
```

### 4. `migration:revert` - Undo Last Migration

Use this to rollback the most recent migration:

```bash
npm run migration:revert
```

Output example:

```
Migration AddUserBioColumn1761918377690 has been reverted successfully.
```

### 5. `migration:show` - Check Migration Status

Use this to see which migrations have been applied:

```bash
npm run migration:show
```

Output example:

```
[ ] 1761918377690-InitialSetup
[X] 1761918377691-AddUserBioColumn
```

## Important Notes

- Always build the project (`npm run build`) before running migration commands
- Review generated migration files before running them
- Never modify migration files manually after they've been run in production
- Use descriptive migration names (e.g., `AddUserProfileFields`, `CreateAuditLogTable`)
- Migration files are stored in organized subfolders under `libs/@oc/server-core/database/migrations/`
- The data source is configured to recursively scan all subfolders for migration files

## Troubleshooting

If you get "Cannot find module" errors:

1. Run `npm run build` first
2. Ensure entity imports use relative paths (not `@core-enums` aliases)
3. Check that your database connection is working

If migrations don't appear in database:

1. Ensure migration files are in the correct subfolder under `libs/@oc/server-core/database/migrations/`
2. Check that the data source configuration includes the `**` glob pattern for subfolders
3. Verify database connection settings in `config/env/development.env`
