# Anvix Backend Documents

This folder contains architecture, workflow, and engineering standards for the backend.

Last verified against repo: 2026-05-04

## Start Here

- `folder-architecture.md`: current backend folder hierarchy and what each folder/file consumes.
- `DOCUMENTATION_TODO.md`: cleanup progress and future documentation work.
- `TENANT_GUIDE.md`: current tenant context, tenant-aware entity, repository, middleware, and guard behavior.
- `migrations.md`: current TypeORM migration workflow and migration folder structure.

## Developer Guidelines

- `dev-guidelines/boilerplate-setup-guide.md`: how to create or update backend modules.
- `dev-guidelines/ai-module-generation.md`: checklist for AI-assisted module generation.
- `dev-guidelines/coding-standards-v2.md`: canonical coding standards.
- `dev-guidelines/architecture-validation-rule-v2.md`: canonical architecture validation checklist.
- `dev-guidelines/coding-standards-rule/repository-standards.md`: repository and tenant-aware repository standards.
- `dev-guidelines/profiling-implementation-prompt.md`: profiler maintenance guide.

## Canonical Docs

The canonical standards files are:

```text
dev-guidelines/coding-standards-v2.md
dev-guidelines/architecture-validation-rule-v2.md
```

Older duplicate standards files were removed after their useful content was merged into the canonical docs.

## Product And Migration Docs

- `TENANT_GUIDE.md`: multi-tenant architecture and safe tenant-owned module patterns.
- `migrations.md`: TypeORM migration commands, folder structure, and troubleshooting.

## For AI-Assisted Development

Before asking AI to build a module, point it to:

```text
README.md
libs/@anvix/documents/README.md
libs/@anvix/documents/folder-architecture.md
libs/@anvix/documents/TENANT_GUIDE.md
libs/@anvix/documents/migrations.md
libs/@anvix/documents/dev-guidelines/ai-module-generation.md
libs/@anvix/documents/dev-guidelines/boilerplate-setup-guide.md
libs/@anvix/documents/dev-guidelines/coding-standards-v2.md
libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md
```

