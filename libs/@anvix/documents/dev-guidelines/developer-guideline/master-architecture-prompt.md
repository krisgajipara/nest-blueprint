# Master architecture prompt (Anvix backend)

Paste or attach this when asking an AI to generate or refactor backend code.

**Canonical standards (outside this folder — do not duplicate):**

- `libs/@anvix/documents/dev-guidelines/coding-standards-v2.md`
- `libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md`
- `libs/@anvix/documents/TENANT_GUIDE.md`
- `libs/@anvix/documents/migrations.md`
- `libs/@anvix/documents/folder-architecture.md`

**Library root:** `libs/@anvix/` (use this in all paths below — not `libs/@oc/`).

---

## 1. Folder structure

- **HTTP:** `src/modules/{module}/` — `{module}.controller.ts`, `{module}.module.ts`
- **Domain:** `libs/@anvix/business-core/modules/{module}/` — service, repository, `dto/request`, `dto/response`, barrel `index.ts` files
- **Shared infra:** `libs/@anvix/server-core/` — `database/`, `constants`, `enums`, `custom-validators`, `custom-decorators`, `custom-guards`, `generic-service` (`AsyncContextService`), `shared-modules`, `utilities`, etc.
- **Entities:** `libs/@anvix/server-core/database/entities/`
- **Migrations:** `libs/@anvix/server-core/database/migrations/` — `database-changes/`, `seeders/`
- **Aliases:** `@business-core-modules`, `@business-core-dto`, `@core-database`, `@core-constants`, `@core-enums`, `@core-custom-validators`, `@core-custom-decorators`, `@core-custom-guards`, `@core-generic-services`, `@core-shared-modules`, `@core-utilities` (see root `tsconfig.json`).

**Imports:** Prefer path aliases for cross-package imports. Relative imports are allowed inside the same package when symbols are not barrel-exported (e.g. entities → `../base-entities/...`), per `coding-standards-v2.md`.

---

## 2. Multi-tenancy and `TenantAwareRepository`

- Tenant-owned entities use `BaseTenantModifiableEntity` or `BaseTenantModifiableEntityWithoutIdentity` (see `TENANT_GUIDE.md`).
- **Tenant-owned repositories** must:
  - extend `TenantAwareRepository<T>` from `@core-database`
  - use `@Injectable({ scope: Scope.REQUEST })`
  - inject **`AsyncContextService`** from **`@core-generic-services`** and pass it to `super(...)` as the context argument expected by `TenantAwareRepository`.

**Example constructor pattern:**

```typescript
import { TenantAwareRepository, User } from '@core-database';
import { AsyncContextService } from '@core-generic-services';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class UserRepository extends TenantAwareRepository<User> {
    constructor(
        @InjectRepository(User)
        repository: Repository<User>,
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }
}
```

- Middleware order, headers (`x-tenant` / `x-tenant-id`), subscribers, and raw SQL tenant rules: **`TENANT_GUIDE.md`**.

---

## 3. Entities

- UUID PKs unless the entity uses a `*WithoutIdentity` base with an explicit `@PrimaryGeneratedColumn`.
- Field lengths and `@Unique` / `DatabaseUniqueKey` per existing entities and `coding-standards-v2.md`.
- New relations: follow patterns in `libs/@anvix/server-core/database/entities/`.

---

## 4. DTOs

- Request/response split; custom validators from `@core-custom-validators`; `ValidateType()` + `FieldTypeEnum` for type checks; no raw `class-validator` where the project standard is custom validators.
- Response DTOs: constructor mapping; `new XxxResponseDto(...)` in services.

---

## 5. Swagger / `ApiResponseStatus`

- Use `ApiResponseStatus` from `@core-custom-decorators`.
- List endpoints: `CommonSearchResponseDto` + item DTO where applicable.
- Module string: follow existing controllers (e.g. `MapToModuleName(ModuleNames.USER)`).

---

## 6. Controllers, services, repositories

- Controllers: thin; `ParseUUIDPipe` for UUID params; guards per module pattern (`JwtAuthGuard`, `RoleGuard`, `AuthRoleGuard` — see `TENANT_GUIDE.md`).
- Services: business logic; `AppResponse` + `SuccessConstant` patterns.
- Repositories: queries only; selective columns; whitelisted sort fields.

**Auth vs user (typical split):** auth flows under `src/modules/auth` + `business-core/modules/auth`; user CRUD under `src/modules/user` + `business-core/modules/user`. Match existing modules when adding features.

---

## 7. List, soft delete, errors

- Lists: search/filter/pagination/sorting as required; `CommonSearchRequestDto` / `CommonSearchResponseDto`; use enums from `@core-enums` (e.g. `SortDirection`) instead of magic strings.
- Soft delete: follow base entity and existing services.
- Errors: keys from `libs/@anvix/server-core/utilities/i18n/en/error.json`.

---

## 8. Permissions

- `libs/@anvix/server-core/constants/permissions.constant.ts` — `MODULE_CONSTANTS`, `DEFAULT_PERMISSIONS`, `PERMISSION_CONSTANTS`, `@RequirePermissions`, `@ApiBearerAuth()` on protected routes.

---

## 9. Migrations

- See `libs/@anvix/documents/migrations.md`.

---

## 10. Typical files for a new `{module}`

- `libs/@anvix/server-core/database/entities/{module}.entity.ts` (if needed)
- `libs/@anvix/business-core/modules/{module}/{module}.repository.ts`
- `libs/@anvix/business-core/modules/{module}/{module}.service.ts`
- `libs/@anvix/business-core/modules/{module}/dto/request/*.ts`, `dto/response/*.ts`
- `src/modules/{module}/{module}.controller.ts`, `{module}.module.ts`
- Migration when schema changes; permissions when routes are permission-gated.

---

## 11. Critical violations (fix before merge)

1. Tenant-owned repository not extending `TenantAwareRepository` or missing request scope / **`AsyncContextService`** injection.
2. Tenant-owned entity without correct tenant base class.
3. Raw SQL without tenant filtering where required.
4. `class-validator` on DTOs where custom validators are standard.
5. Raw entities from controllers; business logic in controllers.
6. Missing migration for schema change; wrong guard pattern vs sibling code.

---

Last aligned for prompts: **AsyncContextService** + **libs/@anvix/** paths (2026-05-07).
