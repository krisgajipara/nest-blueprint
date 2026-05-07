# Role module — API flow diagram

**Base path:** **`/v1/roles`** (global prefix `v1`).  
**Controller:** `RoleController` — `@Controller("roles")`, `@UseGuards(RoleGuard)`, `@ApiBearerAuth()`.

**Important:** Several handlers use paths like `@Post("roles")` and `@Get("roles")`, so full URLs are **`/v1/roles/roles`**, **`/v1/roles/roles/:id`**, etc. (duplicate segment). See TODO for normalization.

---

## Frontend handoff (automation & UI)

### Contracts

| Item | Value |
|------|--------|
| Base | `/v1/roles/...` — **note duplicated segment** `/v1/roles/roles` for CRUD |
| Content-Type | `application/json` (except if future uploads add multipart) |
| Auth | `Authorization: Bearer` + **`RoleGuard`** on every route; **`@RequirePermissions`** is only on **some** handlers (create, list, assign, default permissions). **Detail / update / delete / dropdown / user-role** routes rely on `RoleGuard` only today — confirm with `role.controller.ts` before hiding UI by permission. |
| Tenant | `x-tenant` or `x-tenant-id` for tenant-scoped role data. |

**Success / error** bodies match global `AppResponse` and exception filter (same as `auth-api-flow-diagram.md` §Frontend handoff).

### Screen → API journey (summary)

| Screen | HTTP | Notes |
|--------|------|--------|
| Role builder | `POST /v1/roles/roles` | Create; handle 409 duplicate name |
| Role list | `GET /v1/roles/roles?...` | Paginated search |
| Role picker | `GET /v1/roles/dropdown?...` | Confirm permission guard behavior |
| Role detail | `GET /v1/roles/roles/:id` | Prefer UUID validation (TODO: `ParseUUIDPipe`) |
| Edit role | `PUT /v1/roles/roles/:id` | Permissions payload |
| Delete | `DELETE /v1/roles/roles/:id` | Soft delete |
| Assign roles | `POST /v1/roles/users/assign-role` | Body: user ids + role id |
| Remove role | `DELETE /v1/roles/users/:userId/role` | |
| User’s role | `GET /v1/roles/users/:userId/role` | |
| Default matrix | `GET /v1/roles/permissions/default` | Seed permission UI |

### Endpoint index (JSON)

```json
[
  { "method": "POST", "path": "/v1/roles/roles", "auth": "Bearer+RoleGuard", "permissions": "ROLE WRITE", "body": "CreateRoleRequestDto" },
  { "method": "GET", "path": "/v1/roles/roles", "auth": "Bearer+RoleGuard", "permissions": "ROLE READ", "query": "ListRoleRequestDto" },
  { "method": "GET", "path": "/v1/roles/dropdown", "auth": "Bearer+RoleGuard", "permissions": "none on method" },
  { "method": "GET", "path": "/v1/roles/roles/:id", "auth": "Bearer+RoleGuard", "permissions": "none on method" },
  { "method": "PUT", "path": "/v1/roles/roles/:id", "auth": "Bearer+RoleGuard", "permissions": "none on method", "body": "UpdateRoleRequestDto" },
  { "method": "DELETE", "path": "/v1/roles/roles/:id", "auth": "Bearer+RoleGuard", "permissions": "none on method" },
  { "method": "POST", "path": "/v1/roles/users/assign-role", "auth": "Bearer+RoleGuard", "permissions": "ROLE EDIT", "body": "AssignRoleToUserRequestDto" },
  { "method": "DELETE", "path": "/v1/roles/users/:userId/role", "auth": "Bearer+RoleGuard", "permissions": "none on method" },
  { "method": "GET", "path": "/v1/roles/users/:userId/role", "auth": "Bearer+RoleGuard", "permissions": "none on method" },
  { "method": "GET", "path": "/v1/roles/permissions/default", "auth": "Bearer+RoleGuard", "permissions": "ROLE READ" }
]
```

*`permissions` reflects `@RequirePermissions` only; `RoleGuard` still runs on all of the above.*

---

## 1. Complete API flow visualization

### 1.1 Create role (permission: WRITE on Role module)

```
┌──────────────────────────┐
│  UI: Role builder        │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  POST /v1/roles/roles                        │
│  Body: CreateRoleRequestDto                  │
│  Bearer + RoleGuard + @RequirePermissions     │
└────────────┬─────────────────────────────────┘
             ├─► 400 / 409
             └─► 201 → success payload from service
```

### 1.2 List roles

```
┌──────────────────────────┐
│  UI: Role list           │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  GET /v1/roles/roles?...                     │
│  Query: ListRoleRequestDto                   │
│  @RequirePermissions READ                    │
└────────────┬─────────────────────────────────┘
             └─► 200 → CommonSearchResponseDto<RoleListResponseDto>
```

### 1.3 Role dropdown

```
┌──────────────────────────┐
│  UI: Role picker         │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  GET /v1/roles/dropdown?...                 │
│  No @RequirePermissions on method (see TODO) │
└────────────┬─────────────────────────────────┘
             └─► 200 → dropdown DTOs
```

### 1.4 Role detail / update / delete

```
GET    /v1/roles/roles/:id   → RoleDetailResponseDto
PUT    /v1/roles/roles/:id   → update permissions
DELETE /v1/roles/roles/:id   → soft delete
```

### 1.5 User ↔ role operations

```
POST   /v1/roles/users/assign-role     → body: userIds + roleId
DELETE /v1/roles/users/:userId/role     → remove role from user
GET    /v1/roles/users/:userId/role     → user + role info
```

### 1.6 Default permission matrix (for UI)

```
GET /v1/roles/permissions/default
@RequirePermissions READ
```

---

## 2. Feature-to-API mapping

| Feature | API | UI | State | Validation |
|--------|-----|-----|-------|------------|
| Create role | `POST .../roles/roles` | Name, description, JSON permissions | Form | `CreateRoleRequestDto` |
| List roles | `GET .../roles/roles` | Table | Query | `ListRoleRequestDto` |
| Dropdown | `GET .../roles/dropdown` | Select | Query | `CommonDropdownRequestDto` |
| Detail | `GET .../roles/roles/:id` | Detail panel | id | **TODO: ParseUUIDPipe** |
| Update | `PUT .../roles/roles/:id` | Permission editor | id + body | `UpdateRoleRequestDto` |
| Delete | `DELETE .../roles/roles/:id` | Confirm | id | **TODO: ParseUUIDPipe** |
| Assign | `POST .../users/assign-role` | Bulk assign | body | `AssignRoleToUserRequestDto` |
| Unassign | `DELETE .../users/:userId/role` | — | **TODO: ParseUUIDPipe** | |
| User role | `GET .../users/:userId/role` | — | **TODO: ParseUUIDPipe** | |
| Defaults | `GET .../permissions/default` | Role form seed | — | — |

---

## 3. API integration priority

| Phase | Endpoints | Depends on |
|-------|-----------|------------|
| Core | `GET .../permissions/default`, `POST .../roles/roles`, `GET .../roles/roles` | Auth + Tenant header for tenant-scoped roles |
| Core | `GET .../roles/dropdown` | List/create flows |
| Enhancement | Detail, update, delete | Core list |
| Enhancement | Assign / remove / get user role | User ids from User module |

---

## 4. Templates

### ASCII stub

```
┌──────────────────────────┐
│  UI: RBAC …              │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  <METHOD> /v1/roles/...                      │
│  RoleGuard + (RequirePermissions?)           │
└──────────────────────────────────────────────┘
```

### Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | — | Documented actual path duplication |

---

## 5. Error handling

- **401/403:** JWT invalid or permission denied by `RoleGuard` / missing permission payload.
- **400:** Validation on DTOs.
- **404:** Role or user not found **within tenant** (verify service layer enforces tenant on user/role ids).
- **409:** Duplicate role name (create).

---

## Quality checklist

- [x] Major RBAC journeys represented.
- [x] Path duplication called out.
- [ ] Add `ParseUUIDPipe` and missing `@RequirePermissions` per TODO.
- [ ] Integration tests: assign role cannot cross tenants.

---

*Flow: `anvix-api-flow-diagram`. Review: `anvix-code-review`, `anvix-tenant-safety`.*
