# Tenant module — API flow diagram

**Base path:** **`/v1/tenants`**.  
**Controller:** `TenantController` — mixed **public** and **protected** routes.

---

## Frontend handoff (automation & UI)

### Contracts

| Item | Value |
|------|--------|
| Paths | `/v1/tenants/...` |
| Content-Type | `application/json` for JSON bodies; **`multipart/form-data`** for create/update when uploading `logo` |
| Public | **`GET /v1/tenants/by-subdomain`** — no JWT; used for branded login / tenant resolution (Host/Origin per implementation). |
| Protected | All other routes: **`Authorization: Bearer`** + **`RoleGuard`** + **`@RequirePermissions`** on Tenant module (READ / WRITE / EDIT as per handler). |

**Success / error** envelopes: global `AppResponse` and `{ message, developerErrors }` on failure (see auth flow doc §Frontend handoff).

### Screen → API journey (summary)

| Screen | HTTP | Auth |
|--------|------|------|
| Login / landing branding | `GET /v1/tenants/by-subdomain` | Public |
| Tenant admin grid | `GET /v1/tenants?...` | JWT + TENANT READ |
| Tenant select | `GET /v1/tenants/dropdown?...` | JWT + TENANT READ |
| Tenant settings | `GET /v1/tenants/:id` | JWT + TENANT READ |
| Create tenant + logo | `POST /v1/tenants` (multipart) | JWT + TENANT WRITE |
| Edit tenant + logo | `PUT /v1/tenants/:id` (multipart) | JWT + TENANT EDIT |
| Deactivate | `PUT /v1/tenants/:id/deactivate` | JWT + TENANT EDIT |
| Activate | `PUT /v1/tenants/:id/activate` | JWT + TENANT EDIT |

### Endpoint index (JSON)

```json
[
  { "method": "GET", "path": "/v1/tenants/by-subdomain", "auth": false, "note": "public; subdomain resolution" },
  { "method": "GET", "path": "/v1/tenants", "auth": "Bearer+RoleGuard+TENANT_READ", "query": "list query DTO" },
  { "method": "GET", "path": "/v1/tenants/dropdown", "auth": "Bearer+RoleGuard+TENANT_READ" },
  { "method": "GET", "path": "/v1/tenants/:id", "auth": "Bearer+RoleGuard+TENANT_READ" },
  { "method": "POST", "path": "/v1/tenants", "auth": "Bearer+RoleGuard+TENANT_WRITE", "body": "multipart + fields" },
  { "method": "PUT", "path": "/v1/tenants/:id", "auth": "Bearer+RoleGuard+TENANT_EDIT", "body": "multipart + fields" },
  { "method": "PUT", "path": "/v1/tenants/:id/deactivate", "auth": "Bearer+RoleGuard+TENANT_EDIT" },
  { "method": "PUT", "path": "/v1/tenants/:id/activate", "auth": "Bearer+RoleGuard+TENANT_EDIT" }
]
```

---

## 1. Complete API flow visualization

### 1.1 Public: resolve tenant by subdomain (pre-login)

```
┌──────────────────────────┐
│  UI: Landing / login     │
│  Host: tenant.app.com    │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  GET /v1/tenants/by-subdomain               │
│  No JWT — uses Origin / Host header         │
└────────────┬─────────────────────────────────┘
             ├─► 404 → unknown subdomain
             └─► 200 → TenantPublicResponseDto (branding, safe fields only)
```

### 1.2 Admin: list tenants

```
┌──────────────────────────┐
│  UI: Platform admin      │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  GET /v1/tenants?...                        │
│  RoleGuard + @RequirePermissions TENANT READ │
│  Authorization: Bearer                       │
└────────────┬─────────────────────────────────┘
             └─► 200 → CommonSearchResponseDto<TenantResponseDto>
```

### 1.3 Admin: tenant dropdown

```
GET /v1/tenants/dropdown?...
RoleGuard + TENANT READ
```

### 1.4 Admin: get by ID

```
GET /v1/tenants/:id
ParseUUIDPipe
RoleGuard + TENANT READ
```

### 1.5 Admin: create tenant (multipart)

```
┌──────────────────────────┐
│  UI: Create tenant       │
│  Form + optional logo    │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  POST /v1/tenants                           │
│  multipart: fields + file "logo"            │
│  TENANT WRITE                               │
└────────────┬─────────────────────────────────┘
             ├─► 409 → subdomain conflict
             └─► 201 → TenantResponseDto
```

### 1.6 Admin: update tenant (multipart)

```
PUT /v1/tenants/:id
ParseUUIDPipe, TENANT EDIT, logo optional
```

### 1.7 Activate / deactivate

```
PUT /v1/tenants/:id/deactivate
PUT /v1/tenants/:id/activate
ParseUUIDPipe, TENANT EDIT
```

---

## 2. Feature-to-API mapping

| Feature | API | UI | Auth |
|--------|-----|-----|------|
| Branded login | `GET .../by-subdomain` | App shell before auth | Public |
| Tenant directory | `GET .../tenants` | Admin grid | JWT + permission |
| Dropdown | `GET .../dropdown` | Select tenant | JWT + permission |
| Detail | `GET .../:id` | Settings page | JWT + permission |
| Create | `POST .../tenants` | Wizard + upload | JWT + WRITE |
| Update | `PUT .../:id` | Edit + upload | JWT + EDIT |
| Deactivate | `PUT .../:id/deactivate` | Confirm | JWT + EDIT |
| Activate | `PUT .../:id/activate` | Confirm | JWT + EDIT |

---

## 3. API integration priority

| Phase | Endpoints | Notes |
|-------|-----------|--------|
| Core | `GET .../by-subdomain` | Required for multi-tenant front door |
| Core | `GET .../tenants`, `GET .../:id` | Admin operations |
| Enhancement | Create/update with logo | S3/storage dependency |
| Enhancement | Dropdown | Mass-admin UX |

---

## 4. Templates

```
┌──────────────────────────┐
│  UI: …                   │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  <METHOD> /v1/tenants/...                    │
│  Public OR RoleGuard + RequirePermissions    │
└──────────────────────────────────────────────┘
```

---

## 5. Error handling

- **Public route:** Rate limit abuse; do not expose internal errors; `TenantPublicResponseDto` must stay minimal.
- **403:** Missing `TENANT` permission in JWT payload (ensure roles seeded with Tenant module permissions).
- **404:** Tenant id or subdomain not found.
- **409:** Subdomain taken on create.

---

## Tenant safety notes

- **`Tenant` entity** is system-wide (no `tenantId` column); it **is** the tenant row.
- **`TenantRepository` extends `TenantAwareRepository<Tenant>`** — tenant filter is effectively inactive for this entity metadata; acceptable but conceptually odd (see TODO).
- **User/role data** under a tenant still requires `x-tenant` / `x-tenant-id` where product expects tenant context for admin flows.

---

## Quality checklist

- [x] Public vs protected flows separated.
- [x] Multipart create/update documented.
- [ ] Confirm `DEFAULT_PERMISSIONS` / seeds include Tenant module for admin roles (see TODO).

---

*Flow: `anvix-api-flow-diagram`. Review: `anvix-code-review`, `anvix-tenant-safety`.*
