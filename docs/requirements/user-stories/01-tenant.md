# Module 01 — Tenant Management

| Field | Value |
| --- | --- |
| **Portal** | Product Owner |
| **Phase** | P0 |
| **Status** | ✅ Implemented (onboarding wizard/docs ⬜) |
| **Controller** | `src/modules/tenant/tenant.controller.ts` |
| **Service** | `libs/@anvix/business-core/modules/tenant/tenant.service.ts` |
| **Entity** | `libs/@anvix/server-core/database/entities/tenant.entity.ts` |
| **Decorator** | `@TenantApi()` — **no tenant header** |

---

## Overview

System-level tenant records (salon businesses). Product Owner creates, activates, and configures branding/subdomain. This is the **only** domain where APIs intentionally work without `x-tenant`.

---

## Dependencies

- Module 00 (platform)
- S3/logo upload (`AppS3Module`) for `POST/PUT` with logo
- CORS: `main.ts` resolves tenant by subdomain for allowed origins

---

## User stories

### US-TEN-001 — Resolve tenant by subdomain (public)

**Story:** As a **visitor**, I want branding before login **so that** the correct salon UI loads.

**Acceptance criteria**

- [x] `GET /tenants/by-subdomain` is public (no JWT).
- [x] Subdomain extracted from `Origin` or `Host` header.
- [x] Returns logo, colors, name, status (via `TenantPublicResponseDto`).
- [x] Unknown/inactive subdomain → 404.

**Developer notes**

- Do not require tenant header (`@TenantApi` at controller level).
- Cache tenant validation separately from this read.

---

### US-TEN-002 — List tenants (PO)

**Story:** As **Ravi (PO)**, I want paginated tenant list **so that** I monitor onboarded salons.

**Acceptance criteria**

- [x] `GET /tenants` with `ListTenantRequestDto` (page, search, filters).
- [x] `RoleGuard` + `TENANT:READ`.
- [x] Response: `CommonSearchResponseDto<TenantResponseDto>`.

---

### US-TEN-003 — Create tenant

**Story:** As **PO**, I want to create a tenant with logo **so that** a new salon can go live.

**Acceptance criteria**

- [x] `POST /tenants` multipart (`logo` file + `CreateTenantRequestDto`).
- [x] Unique `subdomain` enforced.
- [ ] On create: seed default `role` rows + optional service template (see Module 11).
- [x] `TENANT:WRITE` permission.

**Request (multipart fields)**

| Field | Type | Required |
| --- | --- | --- |
| `name` | string | Yes |
| `subdomain` | string | Yes |
| `config` | JSON string | No |
| `logo` | file | No |

---

### US-TEN-004 — Update / activate / deactivate

**Acceptance criteria**

- [x] `PUT /tenants/:id` — update profile/branding/config.
- [x] `PUT /tenants/:id/activate` / `deactivate` — status transitions.
- [x] Deactivated tenant rejected by `TenantContextMiddleware` for tenant users.

---

## API contract summary

| Method | Path | Auth | Tenant header | Permission |
| --- | --- | --- | --- | --- |
| GET | `/tenants/by-subdomain` | No | No | — |
| GET | `/tenants` | Bearer | No | TENANT:READ |
| GET | `/tenants/dropdown` | Bearer | No | TENANT:READ |
| GET | `/tenants/:id` | Bearer | No | TENANT:READ |
| POST | `/tenants` | Bearer | No | TENANT:WRITE |
| PUT | `/tenants/:id` | Bearer | No | TENANT:EDIT |
| PUT | `/tenants/:id/activate` | Bearer | No | TENANT:EDIT |
| PUT | `/tenants/:id/deactivate` | Bearer | No | TENANT:EDIT |

---

## Database

**Table:** `tenant` (system entity — **no `tenant_id`**)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `name` | varchar(255) | |
| `subdomain` | varchar(255) UK | Indexed |
| `config` | jsonb | branding, timezone, currency |
| `logo` | varchar(500) | URL |
| `status` | enum | ACTIVE / INACTIVE |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | soft delete |

**Repository:** standard TypeORM (not `TenantAwareRepository`).

---

## Permissions

- Module: `MODULE_CONSTANTS.TENANT`
- Default: PO / super-admin only in UI; enforce via `RoleGuard` + permissions seed.

---

## Business rules

| ID | Rule |
| --- | --- |
| BR-TEN-01 | `subdomain` lowercase, unique among non-deleted tenants |
| BR-TEN-02 | Inactive tenant cannot be used in `x-tenant` header |
| BR-TEN-03 | Logo: image filter only (`imageFileFilter`) |

---

## Gaps / next dev work (Module 11 overlap)

- [ ] Onboarding wizard state machine (documents, compliance).
- [ ] Auto-seed roles/services on `POST /tenants`.
- [ ] `GET /tenants/nearby` for customer discovery (may move to Module 07).

---

## Definition of Done

- [x] Swagger on all endpoints with response DTOs.
- [ ] E2E: subdomain resolve + create tenant + activate.
- [ ] Migration if new columns (GST, address) added for onboarding.
