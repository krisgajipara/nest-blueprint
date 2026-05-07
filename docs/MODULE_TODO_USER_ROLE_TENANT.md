# TODO — User, Role, Tenant modules

Backlog from **`anvix-code-review`** + **`anvix-tenant-safety`**, produced alongside API flow docs (`user-api-flow-diagram.md`, `role-api-flow-diagram.md`, `tenant-api-flow-diagram.md`).

---

## User module

| Priority | Item | Rule / risk |
|----------|------|-------------|
| **Medium** | **No `@RequirePermissions`** on `UserController` | Only `JwtAuthGuard`: any authenticated user in the tenant may manage users if standards require RBAC per resource. Add `RoleGuard` + `@RequirePermissions` if only admins may CRUD users. |
| **Low** | **Regression tests** | Cover list/create/update/delete with tenant context and JWT for different roles (after RBAC decision). |
| **Low** | **Align `user-api-flow-diagram.md` with service edge cases** | Diagram assumes conflict/validation; confirm exact error keys in `UserService` match client mapping. |

**Tenant safety:** `User` + `UserRepository` / `TenantAwareRepository` + `AsyncContextService` — **aligned** with tenant isolation for reads/writes.

---

## Role module

| Priority | Item | Rule / risk |
|----------|------|-------------|
| **High** | **Missing `@RequirePermissions`** on `getRoleById`, `updateRole`, `deleteRole`, `getDropdown`, `removeRoleFromUser`, `getUserWithRole` | `RoleGuard` alone may not enforce fine-grained checks; **permission bypass** risk vs `architecture-validation-rule-v2.md`. |
| **Medium** | **URL shape:** `@Controller("roles")` + `@Get("roles")` → **`/v1/roles/roles`** | Unusual REST layout; error-prone for clients; consider flattening routes. |
| **Medium** | **Missing `ParseUUIDPipe`** on `@Param("id")`, `@Param("userId")` | Standards expect UUID validation on path params (`anvix-code-review`). |
| **Low** | **`@GetUser() user: any` in `getDropdown`** | Replace with `User` (or typed payload) from `@core-database`. |
| **Low** | **Swagger:** some `ApiResponseStatus` calls omit explicit response DTO class | Align with `ApiResponseStatus` + DTO pattern for consistent OpenAPI. |

**Tenant safety:** `Role` entity is tenant-scoped; repository uses `TenantAwareRepository` — **aligned**. After fixing permissions, verify **assign/remove role** cannot target users outside current tenant (service layer).

---

## Tenant module

| Priority | Item | Rule / risk |
|----------|------|-------------|
| **Medium** | **`DEFAULT_PERMISSIONS` / `getAvailableModules()` omit `TENANT`** | Controllers use `MODULE_CONSTANTS.TENANT`; ensure seeds / role JSON grant Tenant permissions to platform admins. |
| **Low** | **`TenantRepository extends TenantAwareRepository<Tenant>`** | `Tenant` has **no** `tenantId`; no accidental tenant filter, but **pattern mismatch** with `TENANT_GUIDE` “system entity” story — consider plain `Repository<Tenant>` for clarity. |
| **Low** | **Public `GET .../by-subdomain`** | Confirm `TenantPublicResponseDto` exposes no secrets; consider throttling / caching policy. |

**Tenant safety:** Protected routes use **`RoleGuard` + `@RequirePermissions`** — **aligned**. Public subdomain lookup must not leak full `TenantResponseDto` fields.

---

## Cross-module

| Priority | Item |
|----------|------|
| **Medium** | Document for frontend: **User** APIs are JWT-only today; **Role/Tenant** admin APIs need **permission bits** including Tenant in JWT role payload. |
| **Low** | Add E2E or integration tests: tenant header + role permissions for Role/Tenant admin flows. |

---

## Checklist (resolve in order)

- [ ] Role: add `@RequirePermissions` to all mutating/sensitive handlers missing it.
- [ ] Role: add `ParseUUIDPipe` to UUID path params.
- [ ] Role: decide on route prefix refactor (`/v1/roles/...` vs `/v1/roles/roles/...`).
- [ ] User: decide JWT-only vs permission-based access; implement if needed.
- [ ] Tenant: verify seeds / default permissions for `TENANT` module.
- [ ] Tenant (optional): simplify `TenantRepository` base class.
- [ ] Update OpenAPI clients after route or guard changes.

---

*Related: `docs/CODE_REVIEW_TODO.md` (full-repo review including Auth, Profiler, global constants).*
