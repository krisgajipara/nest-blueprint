# Module 00 — Platform: Tenant Context & Security

| Field | Value |
| --- | --- |
| **Module key** | `PLATFORM_TENANT` |
| **Phase** | P0 (blocking) |
| **Status** | 🟡 Partial |
| **Blocks** | All tenant-owned modules (03–13) |

---

## Overview

Every tenant-owned API must run with a validated `tenant_id` in request context. Tenant-module and explicit public routes are exempt via decorators—not by skipping middleware.

---

## Code locations (existing)

| Layer | Path |
| --- | --- |
| Middleware | `libs/@anvix/server-core/middleware/tenant-context.middleware.ts` |
| Global guard | `libs/@anvix/server-core/custom-guards/tenant.guard.ts` |
| Decorators | `libs/@anvix/server-core/custom-decorators/allow-without-tenant.decorator.ts` |
| Repository base | `libs/@anvix/server-core/database/repositories/tenant-aware.repository.ts` |
| Subscriber | `libs/@anvix/server-core/database/subscribers/tenant.subscriber.ts` |
| Registration | `src/app.module.ts` (`APP_GUARD` → `TenantGuard`) |

---

## US-PLAT-001 — Global tenant enforcement

**As a** platform architect **I want** tenant headers enforced globally **so that** developers cannot forget tenant scope on new controllers.

### Acceptance criteria

- [x] `TenantGuard` registered as `APP_GUARD`.
- [x] Missing `x-tenant` / `x-tenant-id` → `400` with clear message.
- [x] Invalid tenant ID → `400` from middleware (cached validation).
- [x] Valid header sets `AsyncContextService.setTenantId()`.
- [ ] Integration test: `GET /users` without header → 400.
- [ ] Integration test: valid header + tenant A cannot read tenant B user.

### Developer tasks

1. Add e2e tests under `tests/` for guard behavior.
2. Document exempt routes in Swagger (extension: `@ApiHeader` on tenant-required ops).
3. Decide Q3 from BRD: migrate protected routes to `AuthRoleGuard` for JWT/header tenant match.

---

## US-PLAT-002 — Route exemptions

**As a** developer **I want** `@TenantApi()` and `@AllowWithoutTenant()` **so that** I do not add second guards per route.

### Acceptance criteria

- [x] `@TenantApi()` on `TenantController`.
- [x] `@AllowWithoutTenant()` on public auth + health + profiler.
- [ ] New public routes MUST use decorator (code review rule).

### Exemption registry

| Controller | Decorator | Tenant header |
| --- | --- | --- |
| `TenantController` | `@TenantApi()` | No |
| `AuthController` (login, register, OTP, reset) | `@AllowWithoutTenant()` | No |
| `AuthController` (profile, change-password) | — | **Yes** |
| `UserController`, `RoleController` | — | **Yes** |
| `AppController` GET `/` | `@AllowWithoutTenant()` | No |
| `ProfilerController` | `@AllowWithoutTenant()` | No |

---

## US-PLAT-003 — Tenant-aware persistence

**As a** developer **I want** repositories to auto-filter by `tenant_id` **so that** queries are safe by default.

### Acceptance criteria

- [ ] All new tenant entities extend `BaseTenantModifiableEntity` (or `WithoutIdentity`).
- [ ] All new repositories extend `TenantAwareRepository<T>`, `@Injectable({ scope: Scope.REQUEST })`.
- [ ] Raw SQL includes `tenant_id = :tenantId` manually.
- [ ] No `createQueryBuilderUnfiltered()` without comment + PO-only approval.

### Entity checklist (new module)

```text
[ ] @Entity + tenant base class
[ ] Migration with tenant_id UUID NOT NULL + INDEX (tenant_id, ...)
[ ] Repository extends TenantAwareRepository
[ ] MODULE_CONSTANTS entry + DEFAULT_PERMISSIONS
[ ] Controller: RoleGuard + @RequirePermissions + @ApiBearerAuth
```

---

## API contract (headers)

| Header | Required | Value |
| --- | --- | --- |
| `x-tenant` | Yes* | Tenant UUID |
| `x-tenant-id` | Yes* | Alias of above |
| `Authorization` | Per route | `Bearer {jwt}` |

\*Except `@TenantApi` / `@AllowWithoutTenant` routes.

---

## Definition of Done

- [ ] Tenant isolation integration tests for at least `user` and `role` modules.
- [ ] `TENANT_GUIDE.md` matches production guard behavior.
- [ ] No tenant-owned controller merged without header documented in Swagger.
