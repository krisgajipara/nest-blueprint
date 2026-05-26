# Module 11 — Product Owner: Tenant Onboarding (Extended)

| Field | Value |
| --- | --- |
| **Portal** | Product Owner |
| **Phase** | P7 |
| **Status** | 🟡 Partial (CRUD ✅, wizard/docs ⬜) |
| **Base module** | [01-tenant.md](./01-tenant.md) |
| **Portal spec** | `docs/portals/product-owner/tenant-onboarding.md` |

---

## Overview

Extends Module 01 with **compliance workflow**, document storage, bootstrap seeds, and onboarding status tracking. Developers implement incremental migrations and APIs without breaking existing tenant CRUD.

---

## User stories

### US-ONB-001 — Onboarding wizard state

**Acceptance criteria**

- [ ] Tenant has `onboarding_status`: `draft`, `documents_pending`, `review`, `active`, `rejected`.
- [ ] `GET /tenants/:id/onboarding` — step completion checklist for UI wizard.

**Steps (suggested)**

| Step | Data |
| --- | --- |
| 1 Profile | name, address, timezone, currency |
| 2 Branding | logo, colors, subdomain |
| 3 Documents | GST, PAN, bank proof |
| 4 Package | plan id |
| 5 Review | PO approval |

---

### US-ONB-002 — Document upload

- [ ] `POST /tenants/:id/documents` — multipart; type enum `registration`, `gst`, `pan`, `bank`.
- [ ] Store in S3; metadata in `tenant_document` table.
- [ ] Status: `uploaded`, `verified`, `rejected`.

---

### US-ONB-003 — Compliance review

- [ ] `PUT /tenants/:id/onboarding/review` — PO approves/rejects with comment.
- [ ] Approve → calls existing `activate`; reject → `deactivate` or `rejected` status.

---

### US-ONB-004 — Bootstrap on activation

**Acceptance criteria**

- [ ] On first activation: seed roles (Admin, Staff), default `slot_config`, 3 sample services from template.
- [ ] Idempotent — re-run safe if already seeded.

---

### US-ONB-005 — Policy template selection

- [ ] On onboarding complete, assign `policy_template_id` by region (city/state in tenant config).
- [ ] Copy into `tenant_policy_override` or snapshot table (Module 12).

---

## API contract (new)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/tenants/:id/onboarding` | Wizard state |
| POST | `/tenants/:id/documents` | Upload |
| GET | `/tenants/:id/documents` | List |
| PUT | `/tenants/:id/documents/:docId/verify` | PO only |
| PUT | `/tenants/:id/onboarding/review` | PO approve/reject |

All use `@TenantApi()` (no tenant header) + PO permissions.

---

## Database (new)

### `tenant_document`

| Column | Type |
| --- | --- |
| `id` | UUID |
| `tenant_id` | UUID FK |
| `document_type` | enum |
| `file_url` | varchar |
| `status` | enum |
| `reviewed_by` | UUID nullable |

Extend `tenant` with `onboarding_status`, `package_id`, `address` jsonb.

---

## Definition of Done

- [ ] Cannot activate without required documents (configurable per package).
- [ ] Health dashboard (Module 13) shows onboarding pendings.
- [ ] Migration reversible; no orphan S3 files on tenant delete (soft policy).
