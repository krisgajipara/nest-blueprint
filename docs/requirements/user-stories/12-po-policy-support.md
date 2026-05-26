# Module 12 — Product Owner: Policy & Support

| Field | Value |
| --- | --- |
| **Portal** | Product Owner |
| **Phase** | P7 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/product-owner/policy-support.md` |
| **Consumed by** | Modules 05, 08 |

---

## Overview

Regional policy templates (cancellation, buffers, fees) with versioning and tenant overrides. Support escalation queue for salon/customer issues.

---

## User stories

### US-POL-001 — Policy library CRUD

**Acceptance criteria**

- [ ] `GET /policies` — list templates (region, version, active flag).
- [ ] `POST /policies` — create bundle: `{ regionCode, cancellationNoticeHours, cancellationFeePercent, bufferDefaults, loyaltyRules }`.
- [ ] `PUT /policies/:id` — new version; old version retained for audit.

---

### US-POL-002 — Tenant override

- [ ] `tenant_policy_override` links tenant + policy version + optional field overrides.
- [ ] Booking stores `policy_snapshot` at create time (Module 05).

---

### US-SUP-001 — Escalation queue

- [ ] `GET /support/escalations?severity=&status=&tenantId=`
- [ ] `POST /support/escalations` — create from salon/customer portal with context JSON.
- [ ] SLA: `due_at` computed from severity; list sorted by overdue first.

---

### US-SUP-002 — Resend admin credentials

- [ ] `POST /support/credentials/resend` — `{ tenantId, adminUserId }`.
- [ ] Triggers email + audit entry; uses auth mailer.

---

## API contract

| Method | Path | Decorator |
| --- | --- | --- |
| GET | `/policies` | `@TenantApi()` |
| POST | `/policies` | `@TenantApi()` |
| PUT | `/policies/:id` | `@TenantApi()` |
| GET | `/support/escalations` | `@TenantApi()` |
| POST | `/support/escalations` | `@TenantApi()` |
| POST | `/support/credentials/resend` | `@TenantApi()` |

---

## Database

### `policy_template`

System-level or with optional `tenant_id` null for global templates.

| Column | Notes |
| --- | --- |
| `region_code` | e.g. `IN-MH` |
| `version` | int |
| `rules` | jsonb |
| `effective_from` | date |

### `tenant_policy_override`

| Column | Notes |
| --- | --- |
| `tenant_id` | |
| `policy_template_id` | |
| `overrides` | jsonb |

### `support_escalation`

| Column | Notes |
| --- | --- |
| `tenant_id` | nullable for cross-tenant |
| `severity` | low, medium, high |
| `status` | open, assigned, resolved |
| `context` | jsonb |

---

## Definition of Done

- [ ] Reschedule/cancel in Module 08 reads policy engine.
- [ ] PO can rollback tenant to previous policy version.
- [ ] All support actions audited.
