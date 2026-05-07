# Cold start — onboarding checklist (Anvix backend)

Use these prompts/tasks to learn the repo or prime an AI session.

1. Review layout: `libs/@anvix/documents/folder-architecture.md`
2. Standards: `libs/@anvix/documents/dev-guidelines/coding-standards-v2.md` and `architecture-validation-rule-v2.md`
3. Multi-tenancy: `libs/@anvix/documents/TENANT_GUIDE.md` — middleware order, **`TenantAwareRepository`**, **`AsyncContextService`** (`@core-generic-services`), subscribers
4. Migrations: `libs/@anvix/documents/migrations.md`
5. `libs/@anvix/server-core/utilities/translation.utility.ts`
6. `libs/@anvix/server-core/filters/all-exceptions.filter.ts`
7. Common DTOs: `libs/@anvix/business-core/dto/common-dto/` — `AppResponse`, search wrappers, error DTOs
8. `AppResponse` + `SuccessConstant` in existing `libs/@anvix/business-core/modules/*` services
9. `libs/@anvix/server-core/custom-validators/`
10. `libs/@anvix/server-core/database/` — entities, **`tenant-aware.repository.ts`**, migrations folders
11. `libs/@anvix/server-core/custom-decorators/` — `ApiResponseStatus`, `RequirePermissions`, `GetUser`, etc.
12. `libs/@anvix/server-core/custom-guards/` — `JwtAuthGuard`, `RoleGuard`, `AuthRoleGuard`
13. `libs/@anvix/business-core/modules/*` for domain patterns
14. `libs/@anvix/server-core/generic-service/async-context.service.ts` — request context used by tenant filtering

---

Last verified for prompts: 2026-05-07
