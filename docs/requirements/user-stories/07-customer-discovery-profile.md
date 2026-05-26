# Module 07 — Customer Discovery & Profile

| Field | Value |
| --- | --- |
| **Portal** | Customer |
| **Phase** | P4 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/customer/discovery-profile.md` |

---

## Overview

End-customer finds nearby salons, browses services, manages profile and loyalty/reputation flags. Most reads are **customer-scoped**; discovery may need **platform-level** tenant search (see Q1 in BRD).

---

## Dependencies

- Module 01 (tenant metadata), 04 (catalog), 05 (booking)
- Geo search: lat/lng on tenant or salon address (extend `tenant.config` or `tenant_location` table)

---

## User stories

### US-DISC-001 — Nearby salons

**Acceptance criteria**

- [ ] `GET /tenants/nearby?lat=&lng=&radiusKm=3&serviceCategory=&stylistId=`
- [ ] Returns distance, hours snippet, availability tag (`accepting_bookings`).
- [ ] Default radius 3 km; max 50 results.
- [ ] **Tenant header:** TBD — options: (A) no header platform search, (B) market tenant id.

---

### US-DISC-002 — Service detail

- [ ] `GET /services/:id` — description, images, staff, price, duration (tenant from header or embedded in public catalog).

---

### US-PROF-001 — Get profile

- [ ] `GET /customers/profile` — JWT customer user; returns phone, email, WhatsApp, loyalty flags.

---

### US-PROF-002 — Update profile with OTP

- [ ] `PUT /customers/profile` — requires prior `POST /customers/verify` success token or OTP in body.
- [ ] Sensitive field changes invalidate old contact on notifications.

---

### US-PROF-003 — Reputation markers (read)

- [ ] Flags: `vip`, `advance_pay_required`, `risk` — set by salon (Module 05/10), read-only for customer self-view unless admin.

---

### US-BOOK-QUICK-001 — Quick rebook

- [ ] Client uses last `serviceIds` + `staffId` from history (Module 08) + `POST /bookings`.

---

## API contract

| Method | Path | Auth | Tenant header |
| --- | --- | --- | --- |
| GET | `/tenants/nearby` | Optional JWT | **TBD** |
| GET | `/services/:id` | Optional | Yes (salon context) |
| GET | `/customers/profile` | JWT | Yes |
| PUT | `/customers/profile` | JWT | Yes |
| POST | `/customers/verify` | JWT | Yes |

---

## Database

### `customer` (tenant-scoped guest)

| Column | Notes |
| --- | --- |
| `tenant_id` | salon that owns relationship |
| `phone` | UK (tenant_id, phone) |
| `email`, `whatsapp` | |
| `loyalty_meta` | jsonb |
| `user_id` | optional link to auth user |

**Decision:** Same person at two salons = two `customer` rows (two tenants).

---

## Definition of Done

- [ ] PII not leaked across tenants in nearby search.
- [ ] OTP rate limiting on verify endpoint.
- [ ] Swagger documents discovery tenant-header rule once Q1 closed.
