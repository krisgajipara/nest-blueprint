# Architecture Validation Rules

This is the canonical validation checklist for backend code review and AI-generated code.

Last verified against repo: 2026-05-04

Use this document with `coding-standards-v2.md`. Older duplicate validation files under `dev-guidelines/coding-standards-rule/` have been removed after their useful content was merged here.

## 1. Module Boundaries

- [ ] Controllers live in `src/modules/{module}`.
- [ ] Business services and repositories live in `libs/@anvix/business-core/modules/{module}`.
- [ ] Entities live in `libs/@anvix/server-core/database/entities`.
- [ ] Cross-module access happens through services, not repositories.
- [ ] Repositories are not exported from feature modules unless there is a deliberate framework-level reason.
- [ ] Repositories do not call services.
- [ ] Entities do not call services or repositories.
- [ ] Dependency direction remains:

```text
Controller -> Service -> Repository -> Entity
```

## 2. Circular Dependencies

- [ ] No `forwardRef()` is introduced without a documented reason.
- [ ] Repositories do not depend on each other cyclically.
- [ ] Services do not depend on each other cyclically.
- [ ] If module A and module B need each other, shared behavior is extracted into a third service/module.
- [ ] New code avoids circular import chains.

## 3. DTO Validation

- [ ] Request DTOs exist for request bodies and query params.
- [ ] Response DTOs exist for API responses.
- [ ] DTOs are separated into `request` and `response` folders.
- [ ] Custom validators from `@core-custom-validators` are used where available.
- [ ] `ValidateType()` with `FieldTypeEnum` is used for type validation where applicable.
- [ ] DTOs do not rely on raw inline object types for complex nested response structures.
- [ ] Response DTO constructors explicitly map fields.
- [ ] Response DTO constructors do not use `Object.assign(this, data)`.
- [ ] DTO constructor parameters are strongly typed where practical.
- [ ] Services do not return raw entities directly to controllers.

## 4. Swagger Validation

- [ ] Controllers use `@ApiTags`.
- [ ] Endpoints use `@ApiOperation` where useful.
- [ ] Protected endpoints use `@ApiBearerAuth()`.
- [ ] Endpoints use `ApiResponseStatus`.
- [ ] Response DTO class is passed to `ApiResponseStatus` when endpoint returns data.
- [ ] List endpoints use `CommonSearchResponseDto` where applicable.
- [ ] DTO properties have meaningful `@ApiProperty()` descriptions.
- [ ] DTO/object properties use `type` instead of oversized inline examples.

## 5. Entity And Database Validation

- [ ] Primary keys use UUIDs unless a custom key is required.
- [ ] Tenant-owned entities extend `BaseTenantModifiableEntity` or `BaseTenantModifiableEntityWithoutIdentity`.
- [ ] System-wide entities extend `BaseSystemModifiableEntity` or another non-tenant base entity.
- [ ] String column lengths use constants from `@core-constants` where a constant exists.
- [ ] Unique constraint names use shared constants such as `DatabaseUniqueKey`.
- [ ] Relationship join columns are explicit where needed.
- [ ] Soft-delete behavior is used for removable records.
- [ ] Migrations are added for schema changes.
- [ ] Seed data changes are added under `migrations/seeders`.

## 6. Repository Validation

- [ ] Tenant-owned repositories extend `TenantAwareRepository<T>`.
- [ ] Tenant-owned repositories use `@Injectable({ scope: Scope.REQUEST })`.
- [ ] Tenant-owned repositories inject `RequestContextService` from `@core-shared-modules`.
- [ ] Services do not inject TypeORM `Repository<T>` directly for tenant-owned entities.
- [ ] Repositories select only the fields needed by the use case.
- [ ] Repository methods expose semantic operations, such as `findActiveUsers()`.
- [ ] Raw SQL manually filters by `tenant_id`.
- [ ] Database views include `tenant_id` where tenant filtering is required.
- [ ] `createQueryBuilderUnfiltered()` is used only for intentional system-level queries.
- [ ] Sorting uses a whitelist map such as `SORT_MAP`, not raw client-provided column names.

## 7. Service Validation

- [ ] Services contain business logic.
- [ ] Services orchestrate repositories and shared services.
- [ ] Services do not perform HTTP/controller concerns.
- [ ] Services use typed return values.
- [ ] Public API service methods follow the module's `AppResponse` pattern.
- [ ] Internal service methods can return raw entities for other services when needed.
- [ ] Multi-step writes use transactions where data consistency requires it.
- [ ] Success messages use `SuccessConstant` where applicable.
- [ ] Error messages use standard error keys.

## 8. Controller Validation

- [ ] Controllers do not contain business rules.
- [ ] Controllers do not build database queries.
- [ ] Controllers do not perform complex data mapping.
- [ ] Controllers use dedicated DTOs for body/query input.
- [ ] UUID route params use `ParseUUIDPipe`.
- [ ] Protected routes use the correct guard.
- [ ] Permission-protected routes use `@RequirePermissions()`.
- [ ] Protected routes use `@ApiBearerAuth()`.
- [ ] REST endpoints use resource nouns and appropriate HTTP methods.

## 9. Permissions And Security

- [ ] New protected modules are added to `MODULE_CONSTANTS`.
- [ ] Default permissions are added to `DEFAULT_PERMISSIONS` when needed.
- [ ] Controllers use permission constants instead of hardcoded permission strings.
- [ ] Guards match the controller's security needs.
- [ ] Product-owner/super-admin bypass behavior is verified before relying on it.
- [ ] Tenant-owned routes require tenant context when appropriate.

## 10. Multi-Tenancy Validation

- [ ] `AsyncContextMiddleware` runs before `TenantContextMiddleware`.
- [ ] Tenant-owned routes receive `x-tenant` or `x-tenant-id` where required.
- [ ] Tenant-aware repositories are used for tenant-owned data.
- [ ] Raw SQL includes explicit tenant filtering.
- [ ] System-wide operations are clearly documented if they bypass tenant filters.
- [ ] Tenant mismatch behavior is tested for protected routes.
- [ ] See `libs/@anvix/documents/TENANT_GUIDE.md` for detailed rules.

## 11. Environment Variables

- [ ] New environment variables are added to `config/configuration.ts`.
- [ ] New environment variables are validated in `config/validation.ts`.
- [ ] New environment variables are documented in `example.env`.
- [ ] Application code uses `ConfigService` instead of direct `process.env` access.
- [ ] Direct `process.env` access is limited to configuration loading code.

## 12. Import And Alias Validation

- [ ] Cross-package imports use aliases from `tsconfig.json`.
- [ ] Hardcoded absolute source paths are not used in TypeScript imports.
- [ ] Long relative paths across package boundaries are avoided.
- [ ] Relative imports are acceptable for nearby implementation files that are not exported by alias barrels.
- [ ] New DTOs/services/repositories are exported through the expected `index.ts` files.

## 13. List Endpoint Validation

- [ ] List endpoints support pagination.
- [ ] Search/filter/sort are implemented where needed.
- [ ] Sort fields are whitelisted.
- [ ] Repository returns `[items, total]` when using pagination.
- [ ] Service maps results into response DTOs.
- [ ] Response uses `CommonSearchResponseDto`.

## 14. Critical Violations

Fix these before approving a change:

- [ ] Business logic in controllers.
- [ ] Raw entities returned directly from controllers.
- [ ] Missing DTOs for request/response.
- [ ] Direct TypeORM repository injection in services for tenant-owned data.
- [ ] Tenant-owned repository does not extend `TenantAwareRepository`.
- [ ] Tenant-owned entity does not use a tenant-aware base entity.
- [ ] Raw SQL without tenant filtering.
- [ ] Missing migration for schema change.
- [ ] Hardcoded user-facing error strings.
- [ ] Missing permission constants for new protected module.
- [ ] Missing guards on protected routes.
- [ ] UUID params without `ParseUUIDPipe`.
- [ ] Circular dependency introduced.
- [ ] Duplicate standards or architecture docs created instead of updating canonical docs.

## 15. Medium Violations

Fix these when practical before merging:

- [ ] Missing Swagger descriptions.
- [ ] Missing method/class comments for non-obvious behavior.
- [ ] Repository returns more fields than needed.
- [ ] Incomplete constant usage.
- [ ] Missing documentation update for changed architecture.
- [ ] Missing tests for high-risk behavior.

## 16. Validation Report Template

```markdown
# Code Validation Report

## Summary

- Total files reviewed:
- Critical issues:
- Medium issues:
- Status: APPROVED / REJECTED

## Critical Issues

1. File: `path/to/file.ts`
   Line:
   Issue:
   Rule violated:
   Required fix:

## Medium Issues

1. File: `path/to/file.ts`
   Line:
   Issue:
   Suggested fix:

## Notes

- Residual risk:
- Tests run:
- Tests not run:
```

