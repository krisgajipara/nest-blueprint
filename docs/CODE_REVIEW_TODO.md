# Code review follow-ups (module-by-module)

Generated from a pass using **`anvix-code-review`** and **`anvix-tenant-safety`** skills against the canonical standards (`coding-standards-v2.md`, `architecture-validation-rule-v2.md`, `TENANT_GUIDE.md`).

Use this as a backlog; priorities are suggested, not strict.

**Focused backlog (User + Role + Tenant only):** `docs/MODULE_TODO_USER_ROLE_TENANT.md`  
**API flow docs:** `docs/user-api-flow-diagram.md`, `docs/role-api-flow-diagram.md`, `docs/tenant-api-flow-diagram.md`

---

## Global / cross-cutting

| Priority | Item | Notes |
|----------|------|--------|
| Medium | **`DEFAULT_PERMISSIONS` / `DEFAULT_MODULE_CONSTANTS` omit Tenant** | `permissions.constant.ts` lists `MODULE_CONSTANTS.TENANT` but `DEFAULT_PERMISSIONS` and `getAvailableModules()` only include User and Role. Tenant admin flows use `@RequirePermissions(TENANT)` — confirm seed/bootstrap assigns Tenant permissions to roles that need them; consider adding Tenant to defaults for consistency. |
| Low | **`Permission` / `RolePermission` typed as `any`** | Same file — weak typing; replace with real interfaces when safe. |

---

## Auth (`src/modules/auth`, `business-core/modules/auth`)

| Priority | Item | Notes |
|----------|------|--------|
| Low | **Duplicate `@ApiBearerAuth()`** on `getProfile` | `auth.controller.ts` — remove duplicate decorator. |
| Low | **`getProfile` builds `AppResponse` in the controller** | Mapping/`AppResponse` construction lives in controller vs service pattern used elsewhere — consider moving to `AuthService.getProfile()` for consistency with thin-controller rule. |
| Low | **`change-password` missing `@ApiBearerAuth()`** | JWT guard is applied; Swagger may not show security for this route — add `@ApiBearerAuth()` for parity with `profile`. |
| Low | **OTP / login branching** | Behavior depends on `app.otp.enabled`; ensure env docs and integration tests cover both paths. |

**Tenant safety:** Public routes are intentional; JWT routes rely on `JwtAuthGuard` and `AsyncContextService` from guards/middleware — no extra tenant header required for auth endpoints themselves (expected).

---

## User (`src/modules/user`, `business-core/modules/user`)

| Priority | Item | Notes |
|----------|------|--------|
| Medium | **No `@RequirePermissions` on User CRUD** | Controller uses only `JwtAuthGuard` + `@ApiBearerAuth`. Any authenticated user in the tenant may hit user management APIs if they obtain a token — align with product intent: if only admins should manage users, add `RoleGuard` + `@RequirePermissions` per module constants. |
| Low | **Regression / permission matrix tests** | Add tests for “who can create/update/delete users” once RBAC is clarified. |

**Tenant safety:** `User` uses tenant base entity; `UserRepository` extends `TenantAwareRepository` + `AsyncContextService` — consistent with `TENANT_GUIDE.md`.

---

## Role (`src/modules/role`, `business-core/modules/role`)

| Priority | Item | Notes |
|----------|------|--------|
| High | **Several endpoints lack `@RequirePermissions`** | `RoleGuard` is class-level, but **`getRoleById`**, **`updateRole`**, **`deleteRole`**, **`getDropdown`**, **`removeRoleFromUser`**, **`getUserWithRole`** have no `@RequirePermissions`. If `RoleGuard` only validates JWT + loads user, sensitive operations may be under-protected — add explicit permissions (READ/EDIT/DELETE as appropriate). |
| Medium | **Route path duplication** | `@Controller("roles")` combined with `@Get("roles")` / `@Post("roles")` yields URLs like **`/v1/roles/roles`** — unusual vs REST norms and other modules; consider flattening to `@Get()` / `@Post()` on controller `"roles"` or renaming controller prefix. |
| Medium | **Missing `ParseUUIDPipe` on UUID params** | `@Param("id")` and `@Param("userId")` on multiple handlers — standards expect `ParseUUIDPipe` for UUID path params (as in `user.controller` / `tenant.controller`). |
| Low | **`@GetUser() user: any` in `getDropdown`** | Type as `User` (or shared auth type) for safety and docs. |

**Tenant safety:** `Role` is tenant-scoped; repository uses `TenantAwareRepository` — OK. Re-check role assignment endpoints after permission decorators are fixed so cross-tenant assignment cannot occur via missing checks (service layer should still enforce tenant).

---

## Tenant (`src/modules/tenant`, `business-core/modules/tenant`)

| Priority | Item | Notes |
|----------|------|--------|
| Low | **`TenantRepository` extends `TenantAwareRepository<Tenant>`** | `Tenant` has **no** `tenantId` (system entity); filtering by tenant id is effectively a no-op for this metadata. Works but is **misaligned conceptually** — consider extending TypeORM `Repository<Tenant>` + request scope only if needed, for clarity. |
| Low | **Public `GET /tenants/by-subdomain`** | Intentional for branding; ensure rate limiting / abuse considerations match product (Throttler is global). |

**Tenant safety:** Protected routes use `RoleGuard` + `@RequirePermissions` — good. Public subdomain lookup must not leak private fields; confirm `TenantPublicResponseDto` exposure.

---

## Profiler (`src/modules/profiler`)

| Priority | Item | Notes |
|----------|------|--------|
| High (prod) | **No authentication on profiler HTTP API** | `ProfilerController` exposes metrics and **`POST .../clear`** without guards — acceptable for local/dev only; **lock behind auth or disable in production** per security baseline. |
| Medium | **Response shape vs API standards** | Returns raw JSON objects, not `AppResponse` — inconsistent with rest of API; document as internal tool or align if clients must consume uniformly. |
| Low | **`require("fs")` / `require("path")` inside methods** | Prefer top-level imports (per profiler maintenance doc / style). |

**Tenant safety:** Profiler is global/in-memory — not tenant-scoped; ensure it never logs or returns PII in profile payloads.

---

## Summary counts (by severity)

- **High:** 2 (Role permission gaps; Profiler exposure in prod)
- **Medium:** 5 (User RBAC; Role URL shape + ParseUUIDPipe; permissions seed alignment; Tenant repository pattern; Profiler `AppResponse` consistency)
- **Low:** 8+ (Auth Swagger/DTO placement; typings; tests; minor cleanups)

---

## Quality checklist (from review skills)

- [ ] Role module: add missing `@RequirePermissions` and `ParseUUIDPipe` where applicable.
- [ ] User module: decide JWT-only vs permission-based access; implement accordingly.
- [ ] Auth module: Swagger cleanup (`ApiBearerAuth`, duplicate removal).
- [ ] Tenant module: optionally refactor `TenantRepository` base class for clarity.
- [ ] Profiler: production hardening and/or env-gated registration.
- [ ] Permissions constants: Tenant (and Auth if needed) in defaults/seeds if required by product.
- [ ] Add integration tests for tenant isolation on Role/User assignment flows after RBAC fixes.

---

*Last updated from static review (no runtime tests executed).*
