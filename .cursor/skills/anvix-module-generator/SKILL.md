---
name: anvix-module-generator
description: Generate or update backend modules using Anvix architecture with full compliance to master architecture rules, composed prompt strategy, DTO/repository/service/controller layering, tenant-aware patterns, permission wiring, and migration workflow. Use when the user asks to create modules, scaffold CRUD APIs, or implement module changes end to end.
---

# Anvix Module Generator

## Use this skill when

- Creating a new backend module.
- Expanding an existing module with new endpoints or data model changes.
- Implementing module work from business requirements.

## Required first step (always)

Read these documents before editing:

1. `libs/@anvix/documents/dev-guidelines/developer-guideline/master-architecture-prompt.md`
2. `libs/@anvix/documents/dev-guidelines/developer-guideline/master-module-prompt.md`

Then read canonical standards referenced by master architecture:

3. `libs/@anvix/documents/folder-architecture.md`
4. `libs/@anvix/documents/TENANT_GUIDE.md`
5. `libs/@anvix/documents/migrations.md`
6. `libs/@anvix/documents/dev-guidelines/coding-standards-v2.md`
7. `libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md`
8. `libs/@anvix/documents/dev-guidelines/boilerplate-setup-guide.md`

## Prompt composition rule (from master-module-prompt)

When generating module work:

1. Always apply `master-architecture-prompt.md` as the base rule set.
2. Add only the relevant domain add-on prompt (for example `inventory-module-prompt.md`) when needed.
3. Do not duplicate or fork master rules in ad-hoc prompt text.
4. For edge cases, cite and follow `coding-standards-v2.md`.

## Mandatory architecture requirements (must satisfy)

- Use `libs/@anvix/` paths everywhere (never `libs/@oc/`).
- Follow folder split:
  - HTTP: `src/modules/{module}/`
  - Domain: `libs/@anvix/business-core/modules/{module}/`
  - Entities: `libs/@anvix/server-core/database/entities/`
  - Migrations: `libs/@anvix/server-core/database/migrations/`
- Prefer path aliases from root `tsconfig.json` for cross-package imports.
- Keep controller/service/repository boundaries strict:
  - controllers thin
  - services for business logic + `AppResponse`/`SuccessConstant`
  - repositories for data access and query concerns only

## Multi-tenancy requirements (must satisfy)

- Tenant-owned entities must use tenant base entities from `@core-database`.
- Tenant-owned repositories must:
  - extend `TenantAwareRepository<T>`
  - be `@Injectable({ scope: Scope.REQUEST })`
  - inject `AsyncContextService` from `@core-generic-services`
  - pass context into `super(...)`
- Raw SQL on tenant-owned data must include explicit tenant filters.
- Respect tenant headers and middleware/subscriber behavior from `TENANT_GUIDE.md`.

## DTO, validation, and API contract requirements

- Use request/response DTO split under `dto/request` and `dto/response`.
- Prefer custom validators from `@core-custom-validators`.
- Use `ValidateType` + `FieldTypeEnum` for field type validation where applicable.
- For `@Get` + `@Query()` DTO fields, validate incoming values as strings (`BooleanString`, `NumberString`, `String`).
- Do not use raw `@IsBoolean()` / `@IsNumber()` in query DTOs.
- Normalize query arrays so both single and repeated params become arrays before validation.
- Avoid raw `class-validator` usage where project custom validators are standard.
- Map responses via response DTO constructors in services.
- Do not return raw entities from controllers.
- Use `ApiResponseStatus` and proper Swagger metadata.
- For list endpoints, use `CommonSearchResponseDto` + item DTO.

## Guards, permissions, and errors

- Match sibling module guard pattern (`JwtAuthGuard`, `RoleGuard`, `AuthRoleGuard`).
- Use `@ApiBearerAuth()` on protected routes.
- Use `@RequirePermissions` for permission-gated endpoints.
- Update permission constants when needed:
  - `MODULE_CONSTANTS`
  - `DEFAULT_PERMISSIONS`
  - `PERMISSION_CONSTANTS`
- Use error keys from `libs/@anvix/server-core/utilities/i18n/en/error.json`.

## Schema and migration requirements

- Any schema change requires migration work under:
  - `database-changes/`
  - `seeders/` (when applicable)
- Follow `libs/@anvix/documents/migrations.md` workflow and safety checks.

## Implementation workflow

1. Inspect existing modules (`auth`, `role`, `tenant`, `user`) and mirror current patterns.
2. Classify module data type:
   - tenant-owned
   - system-wide
   - shared reference
3. Add/update entity under `libs/@anvix/server-core/database/entities` (if schema required).
4. Add request DTOs in `libs/@anvix/business-core/modules/{module}/dto/request`.
5. Add response DTOs in `libs/@anvix/business-core/modules/{module}/dto/response`.
6. Add/update repository in `libs/@anvix/business-core/modules/{module}`.
7. Add/update service in `libs/@anvix/business-core/modules/{module}`.
8. Add/update controller + module in `src/modules/{module}`.
9. Wire barrel exports and module imports/providers.
10. Add guards/decorators/permissions with module constants as needed.
11. Add migrations for schema changes.
12. Update module docs when tenant/migration/permission/API behavior changes: module README (**anvix-module-readme**) and matching API flow diagram (**anvix-api-flow-diagram** + [api-flow-diagram-map.md](./anvix-module-readme/api-flow-diagram-map.md)) when controllers or client-facing DTOs change.

## Critical violations (fix before finish)

1. Tenant-owned repository missing `TenantAwareRepository` / request scope / `AsyncContextService`.
2. Tenant-owned entity using wrong base class.
3. Raw SQL missing tenant filters.
4. DTOs using non-standard validation where custom validators are expected.
5. Controller contains business logic or returns raw entities.
6. Missing migration for schema changes.
7. Guard/permission pattern diverges from sibling module conventions.
8. New module paths/imports violate `libs/@anvix/` + alias conventions.

## Verification

Run when practical:

- `npm run lint`
- `npm run build`
- targeted tests for the changed module

## Completion checklist (must confirm)

- [ ] Folder placement matches master architecture.
- [ ] DTO/request/response split complete.
- [ ] Guards and permissions aligned with module behavior.
- [ ] Tenant safety rules applied where needed.
- [ ] Migration added for schema changes.
- [ ] Swagger/`ApiResponseStatus` coverage added.
- [ ] API flow diagram updated when HTTP contract changed (see anvix-module-readme).
- [ ] Exports and module wiring complete.
- [ ] Lint/build/test status recorded.

## Output format

After finishing, report:

- files changed
- commands run
- commands not run and reason
- any follow-up risks (tenant isolation, permissions, migrations, tests)
