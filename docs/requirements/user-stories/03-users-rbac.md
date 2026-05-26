# Module 03 — Users & RBAC (Roles)

| Field | Value |
| --- | --- |
| **Portal** | Salon Admin |
| **Phase** | P0 |
| **Status** | ✅ Implemented |
| **Controllers** | `src/modules/user/user.controller.ts`, `src/modules/role/role.controller.ts` |
| **Services** | `user.service.ts`, `role.service.ts` |
| **Entities** | `user.entity.ts`, `role.entity.ts` |

---

## Overview

Tenant-scoped staff/admin users and dynamic roles with JSON permission matrix. **All routes require `x-tenant` + JWT** (users) or **RoleGuard** (roles).

---

## Dependencies

- Module 00, 02
- `AppPermissionService`, `MODULE_CONSTANTS`, `DEFAULT_PERMISSIONS`
- Permission cache invalidation on role update

---

# Part A — Users

## US-USER-001 — List users

**Acceptance criteria**

- [x] `GET /users` — pagination, search, filters (`ListUserRequestDto`).
- [x] `JwtAuthGuard` at controller level.
- [x] Only users for current `tenant_id`.
- [ ] Add `@RequirePermissions` if module should be permission-gated (currently JWT only).

---

## US-USER-002 — CRUD user

| Action | Method | Acceptance |
| --- | --- | --- |
| Get one | `GET /users/:id` | UUID pipe; 404 if wrong tenant |
| Create | `POST /users` | `CreateUserRequestDto`; unique email per tenant+userType |
| Update | `PUT /users/:id` | `UpdateUserRequestDto` |
| Delete | `DELETE /users/:id` | Soft delete |

**Business rules**

- Password hashed on insert (`@BeforeInsert` on entity).
- Never return `password` / `salt` in `UserResponseDto`.

---

## US-USER-003 — User dropdown

- [x] `GET /users/dropdown` — `UserDropdownRequestDto` for booking assignment UIs.

---

# Part B — Roles

## US-ROLE-001 — Role CRUD

**Acceptance criteria**

- [x] `POST /roles/roles` — create with `permissions: RolePermission[]` JSON.
- [x] `GET /roles/roles` — list without permissions (performance).
- [x] `GET /roles/roles/:id` — detail with permissions.
- [x] `PUT /roles/roles/:id` — update permissions; invalidate cache.
- [x] `DELETE /roles/roles/:id` — soft delete; system roles protected in service.

**Note:** Route prefix is `/roles/roles` (consider refactor to `/roles` in v2).

---

## US-ROLE-002 — Assign role to users

- [x] `POST /roles/users/assign-role` — batch `userIds` + `roleId`.
- [x] `DELETE /roles/users/:userId/role`
- [x] `GET /roles/users/:userId/role`

---

## US-ROLE-003 — Dropdown & default permissions

- [x] `GET /roles/dropdown` — hides `SUPER_ADMIN` unless caller is super-admin.
- [x] `GET /roles/permissions/default` — UI matrix template.

---

## API contract

### Users (`/users`)

| Method | Path | Guard | Tenant |
| --- | --- | --- | --- |
| GET | `/users` | JwtAuthGuard | Yes |
| GET | `/users/dropdown` | JwtAuthGuard | Yes |
| GET | `/users/:id` | JwtAuthGuard | Yes |
| POST | `/users` | JwtAuthGuard | Yes |
| PUT | `/users/:id` | JwtAuthGuard | Yes |
| DELETE | `/users/:id` | JwtAuthGuard | Yes |

### Roles (`/roles`)

| Method | Path | Permission |
| --- | --- | --- |
| POST | `/roles/roles` | ROLE:WRITE |
| GET | `/roles/roles` | ROLE:READ |
| GET | `/roles/roles/:id` | — |
| PUT | `/roles/roles/:id` | — |
| DELETE | `/roles/roles/:id` | — |
| GET | `/roles/dropdown` | — |
| POST | `/roles/users/assign-role` | ROLE:EDIT |
| DELETE | `/roles/users/:userId/role` | — |
| GET | `/roles/users/:userId/role` | — |
| GET | `/roles/permissions/default` | ROLE:READ |

---

## Database

### `user`

| Column | Notes |
| --- | --- |
| `tenant_id` | FK logical to tenant |
| `email`, `user_type` | Unique with `deleted_at` |
| `role_id` | nullable FK to role |

### `role`

| Column | Notes |
| --- | --- |
| `tenant_id` | required |
| `permissions` | jsonb `RolePermission[]` |
| `system_role_type` | optional seed marker |

**Indexes:** `(tenant_id, email)`, `(tenant_id, name)` on role.

---

## New module checklist (when extending)

```text
src/modules/{module}/{module}.module.ts
libs/@anvix/business-core/modules/{module}/
  ├── dto/request|response
  ├── {module}.service.ts
  ├── {module}.repository.ts  → TenantAwareRepository
libs/@anvix/server-core/database/entities/{module}.entity.ts
migrations/YYYYMMDDHHMMSS-{module}.ts
MODULE_CONSTANTS + DEFAULT_PERMISSIONS
```

---

## Definition of Done

- [x] TenantAwareRepository on user + role.
- [ ] Permission decorators on **all** user endpoints (if product requires).
- [ ] Integration tests: cross-tenant read/write denied.
- [ ] Audit log on role permission change (FR-RBAC audit).
