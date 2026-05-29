# User module — API flow diagram

**Base path:** `v1` global prefix → **`/v1/users`**  
**Controller:** `UserController` — `@UseGuards(JwtAuthGuard)`, `@ApiBearerAuth()` on all routes.  
**Tenant:** User data is tenant-scoped (`TenantAwareRepository`, tenant context from middleware/guards).

---

## Frontend handoff (automation & UI)

### Contracts

| Item | Value |
|------|--------|
| Paths | `/v1/users`, `/v1/users/dropdown`, `/v1/users/:id` |
| Content-Type | `application/json` for writes |
| **Auth** | **Every route:** `Authorization: Bearer <accessToken>` (401 → clear session, login) |
| **Tenant** | Send **`x-tenant`** or **`x-tenant-id`** (tenant UUID) for correct data isolation — see `TENANT_GUIDE.md`. |

**Success:** same `AppResponse` envelope as auth: `{ "message", "data" }`. List endpoints return `data` shaped as `CommonSearchResponseDto` (pagination + rows of `UserResponseDto` — confirm exact nesting in Swagger for your generator).

**Errors:** `{ "message", "developerErrors" }` via global filter; **400** for DTO validation, **404** if user not in tenant, **409** on duplicate email in tenant.

### Screen → API journey

| Screen | User action | HTTP | Persist / notes |
|--------|-------------|------|-----------------|
| User list | Load / filter / paginate | `GET /v1/users?...` (`ListUserRequestDto`) | Table binds to `data` search payload |
| Autocomplete | Typeahead | `GET /v1/users/dropdown?...` (`UserDropdownRequestDto`) | Debounce query |
| User detail | Open row | `GET /v1/users/:id` | `:id` is UUID (`ParseUUIDPipe`) |
| Create | Submit form | `POST /v1/users` (`CreateUserRequestDto`) | Refresh list |
| Edit | Save | `PUT /v1/users/:id` (`UpdateUserRequestDto`) | Invalidate detail cache |
| Delete | Confirm | `DELETE /v1/users/:id` | Remove from list |

**RBAC:** Controller does **not** use `@RequirePermissions` today — treat as “any authenticated user in tenant” until `docs/MODULE_TODO_USER_ROLE_TENANT.md` is resolved; product should not assume fine-grained UI gating from backend yet.

### Endpoint index (JSON)

```json
[
  { "method": "GET", "path": "/v1/users", "auth": "Bearer", "query": "ListUserRequestDto" },
  { "method": "GET", "path": "/v1/users/dropdown", "auth": "Bearer", "query": "UserDropdownRequestDto" },
  { "method": "GET", "path": "/v1/users/:id", "auth": "Bearer", "params": { "id": "uuid" } },
  { "method": "POST", "path": "/v1/users", "auth": "Bearer", "body": "CreateUserRequestDto" },
  { "method": "PUT", "path": "/v1/users/:id", "auth": "Bearer", "body": "UpdateUserRequestDto" },
  { "method": "DELETE", "path": "/v1/users/:id", "auth": "Bearer" }
]
```

---

## 1. Complete API flow visualization

### 1.1 List users (search / filter / pagination)

```
┌──────────────────────────┐
│  UI: User management     │
│  Apply filters, search   │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  GET /v1/users?...                          │
│  Query: ListUserRequestDto                  │
│  Authorization: Bearer <JWT>                │
└────────────┬─────────────────────────────────┘
             ├─► 401 → re-login
             ├─► 400 → validation
             └─► 200 → CommonSearchResponseDto<UserResponseDto>
```

### 1.2 User dropdown (lazy load)

```
┌──────────────────────────┐
│  UI: Select / autocomplete│
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  GET /v1/users/dropdown?...                   │
│  Query: UserDropdownRequestDto                │
└────────────┬─────────────────────────────────┘
             └─► 200 → CommonSearchResponseDto<CommonDropdownResponseDto>
```

### 1.3 Get user by ID

```
┌──────────────────────────┐
│  UI: User detail         │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  GET /v1/users/:id                          │
│  :id validated with ParseUUIDPipe             │
└────────────┬─────────────────────────────────┘
             ├─► 404 → not found (tenant-scoped)
             └─► 200 → UserResponseDto
```

### 1.4 Create user

```
┌──────────────────────────┐
│  UI: Create user form    │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  POST /v1/users                             │
│  Body: CreateUserRequestDto                  │
└────────────┬─────────────────────────────────┘
             ├─► 400 → validation
             ├─► 409 → conflict (e.g. duplicate email in tenant)
             └─► 201 → UserResponseDto
```

### 1.5 Update user

```
┌──────────────────────────┐
│  UI: Edit user           │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  PUT /v1/users/:id                          │
│  ParseUUIDPipe on :id                        │
└────────────┬─────────────────────────────────┘
             ├─► 400 / 404
             └─► 200 → UserResponseDto
```

### 1.6 Soft delete user

```
┌──────────────────────────┐
│  UI: Delete / deactivate │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  DELETE /v1/users/:id                       │
└────────────┬─────────────────────────────────┘
             ├─► 404
             └─► 200 → empty payload per AppResponse pattern
```

---

## 2. Feature-to-API mapping

| Feature | API | UI (examples) | State | Validation |
|--------|-----|---------------|-------|--------------|
| User list | `GET /v1/users` | Table, filters | List query model | `ListUserRequestDto` |
| Dropdown | `GET /v1/users/dropdown` | Autocomplete | Search debounce | `UserDropdownRequestDto` |
| Detail | `GET /v1/users/:id` | Profile admin view | Selected id | UUID pipe |
| Create | `POST /v1/users` | Modal / wizard | Form → DTO | `CreateUserRequestDto` |
| Update | `PUT /v1/users/:id` | Edit form | Form + id | `UpdateUserRequestDto` |
| Remove | `DELETE /v1/users/:id` | Confirm dialog | — | UUID pipe |

**Auth:** Valid JWT required for all routes; **no** `@RequirePermissions` on controller (see TODO doc).

---

## 3. API integration priority

| Phase | Endpoints | Notes |
|-------|-----------|--------|
| Core | `GET /v1/users`, `GET /v1/users/:id` | Admin user browsing |
| Core | `POST /v1/users`, `PUT /v1/users/:id`, `DELETE /v1/users/:id` | Lifecycle |
| Enhancement | `GET /v1/users/dropdown` | Dependent on list UX |

---

## 4. Templates for future changes

### Flow stub

```
┌──────────────────────────┐
│  UI: …                   │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  <METHOD> /v1/users/...                      │
└────────────┬─────────────────────────────────┘
             └─► 2xx / 4xx → …
```

### Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | — | Aligned to `UserController` |

---

## 5. Error handling

- **401:** Missing/invalid JWT — clear session, redirect to login.
- **400:** DTO validation — show field errors from API.
- **404:** User not in current tenant or deleted — `TenantAwareRepository` isolation.
- **409:** Create conflict — e.g. email already used in tenant.

---

## Quality checklist

- [x] Journeys: list, dropdown, get, create, update, delete.
- [x] Tenant isolation noted (repository layer).
- [x] `ParseUUIDPipe` on id routes documented.
- [ ] Confirm RBAC with product (see `docs/MODULE_TODO_USER_ROLE_TENANT.md`).

---

*Flow structure: `anvix-api-flow-diagram` + `api-flow-diagram-prompt.md`. Review lens: `anvix-code-review`, `anvix-tenant-safety`.*
