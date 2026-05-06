# AI Module Generation Guide

Use this checklist when asking AI to create or update a backend module.

Last verified against repo: 2026-05-04

## Recommended Prompt Shape

```text
Use the Anvix backend architecture.
Inspect existing modules before editing.
Create/update the <module> module end to end.

Requirements:
- <business requirement 1>
- <business requirement 2>
- <business requirement 3>

Follow:
- folder-architecture.md
- TENANT_GUIDE.md
- migrations.md
- coding-standards-v2.md
- architecture-validation-rule-v2.md
- boilerplate-setup-guide.md

After implementation:
- update docs
- run build/lint where practical
- report files changed and any commands not run
```

## AI Work Order

Ask AI to follow this order:

1. Inspect nearby existing modules such as `user`, `role`, `tenant`, and `auth`.
2. Identify entity ownership:
   - tenant-owned data
   - system-wide data
   - shared lookup/reference data
3. Create or update entity files.
4. Create or update database migrations.
5. Create request DTOs.
6. Create response DTOs.
7. Create repository.
8. Create service.
9. Create controller.
10. Wire Nest modules and exports.
11. Update permission constants when the module is protected.
12. Update docs.
13. Run verification commands.

## Required Context For AI

Before generating code, AI should read:

```text
README.md
libs/@anvix/documents/folder-architecture.md
libs/@anvix/documents/TENANT_GUIDE.md
libs/@anvix/documents/migrations.md
libs/@anvix/documents/dev-guidelines/coding-standards-v2.md
libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md
libs/@anvix/documents/dev-guidelines/boilerplate-setup-guide.md
```

For tenant-owned modules, AI should also inspect:

```text
libs/@anvix/server-core/database/base-entities/
libs/@anvix/server-core/database/repositories/tenant-aware.repository.ts
libs/@anvix/server-core/database/subscribers/tenant.subscriber.ts
libs/@anvix/server-core/middleware/tenant-context.middleware.ts
libs/@anvix/server-core/generic-service/async-context.service.ts
libs/@anvix/server-core/shared-modules/context/app-context.service.ts
```

## Entity Checklist

- [ ] Entity location is `libs/@anvix/server-core/database/entities`.
- [ ] Tenant-owned entity extends `BaseTenantModifiableEntity` or `BaseTenantModifiableEntityWithoutIdentity`.
- [ ] System-wide entity extends `BaseSystemModifiableEntity` or another non-tenant base.
- [ ] Field lengths use constants where available.
- [ ] Entity is exported if imported via `@core-database`.
- [ ] Migration is created for schema changes.

## DTO Checklist

- [ ] Request DTOs are under `dto/request`.
- [ ] Response DTOs are under `dto/response`.
- [ ] Request DTOs use custom validators.
- [ ] Response DTOs map fields explicitly.
- [ ] Sensitive fields are excluded.
- [ ] DTOs are exported through `index.ts`.

## Repository Checklist

- [ ] Tenant-owned repository extends `TenantAwareRepository<T>`.
- [ ] Repository is request-scoped.
- [ ] Repository injects `AsyncContextService`.
- [ ] Repository methods use selective fields.
- [ ] Sorting uses whitelisted fields.
- [ ] Raw SQL includes tenant filtering.

## Service Checklist

- [ ] Service contains business logic.
- [ ] Service returns typed `AppResponse` for API-facing methods.
- [ ] Service throws standard exceptions with standard error keys.
- [ ] Service does not build HTTP responses manually.
- [ ] Service does not contain controller-only logic.

## Controller Checklist

- [ ] Controller uses request DTOs.
- [ ] Controller delegates to service.
- [ ] Controller uses Swagger decorators.
- [ ] Protected endpoints use guards.
- [ ] Permission-protected endpoints use `@RequirePermissions`.
- [ ] UUID params use `ParseUUIDPipe`.

## Permission Checklist

- [ ] Add module to `MODULE_CONSTANTS` if protected.
- [ ] Add default permissions to `DEFAULT_PERMISSIONS` if required.
- [ ] Use constants in `@RequirePermissions`.
- [ ] Add guard and `@ApiBearerAuth` to protected routes.

## Documentation Checklist

- [ ] Update `folder-architecture.md` if structure changes.
- [ ] Update `migrations.md` if migration workflow changes.
- [ ] Update `TENANT_GUIDE.md` if tenant behavior changes.
- [ ] Update API flow docs if public API behavior changes.
- [ ] Update this guide if the AI workflow changes.

## Verification Checklist

- [ ] Run `npm run lint` when practical.
- [ ] Run `npm run build` only when database/migration execution is intended.
- [ ] Run targeted tests if available.
- [ ] Report commands run.
- [ ] Report commands not run and why.

## Review Prompt

After AI implements a module, use this review prompt:

```text
Review the module in code-review stance.
Prioritize bugs, tenant isolation risks, missing migrations, missing permission wiring, DTO/Swagger issues, and missing tests.
Give findings first with file/line references.
Do not summarize until after findings.
```


