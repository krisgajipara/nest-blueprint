# Module 04 — Service & Availability

| Field | Value |
| --- | --- |
| **Portal** | Salon Admin |
| **Phase** | P1 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/salon-admin/service-availability-management.md` |
| **Blocks** | Module 05 (bookings) |

---

## Overview

Salon Admin defines **what** can be booked (services) and **when** (slots, buffers, staff hours). Feeds the **availability engine** used by booking and customer flows.

---

## Dependencies

- Modules 00, 03 (staff = `user` with stylist role)
- Module 01 (tenant active)

---

## User stories

### US-SVC-001 — Service catalog list

**Story:** As **Priya**, I want to see all services **so that** I manage the menu.

**Acceptance criteria**

- [ ] `GET /services/catalog` returns categories + services + assigned staff IDs + `is_active`.
- [ ] Tenant-scoped; inactive hidden from customer catalog by default (query flag for admin: `includeInactive`).

---

### US-SVC-002 — Create / update service

**Acceptance criteria**

- [ ] `POST /services` — body below; HTML description sanitized.
- [ ] `PUT /services/:id` — partial update.
- [ ] Parent category: `parentId` nullable UUID (tree).
- [ ] Cannot reduce `duration_min` below longest existing booking using service (BR-AVL-04).

**POST `/services` body**

| Field | Type | Required |
| --- | --- | --- |
| `parentId` | UUID | No |
| `name` | string | Yes |
| `description` | string | No |
| `durationMin` | int | Yes |
| `completionBufferMin` | int | No |
| `basePrice` | decimal | Yes |
| `assignedStaffIds` | UUID[] | No |
| `imageUrl` | string | No |

---

### US-SVC-003 — Activate / deactivate service

- [ ] `PUT /services/:id/activate`
- [ ] `PUT /services/:id/deactivate`
- [ ] Deactivated service rejected on `POST /bookings` with `ERR_SERVICE_INACTIVE`.

---

### US-SVC-004 — Slot configuration

**Acceptance criteria**

- [ ] `GET /slots/config` — one row per tenant (create default on tenant seed).
- [ ] `PUT /slots/config` — update duration, buffers, working hours JSON, overrides.

**`working_hours` JSON shape (example)**

```json
{
  "monday": { "open": "09:00", "close": "21:00", "breaks": [{ "start": "13:00", "end": "14:00" }] },
  "tuesday": { "open": "09:00", "close": "21:00" }
}
```

**Business rules**

- [ ] Cannot change `slot_duration_min` if future bookings exist (or require migration tool).

---

### US-SVC-005 — Staff availability

**Acceptance criteria**

- [ ] `GET /staff/:staffId/availability?from=&to=` — returns windows + exceptions.
- [ ] `POST /staff/:staffId/availability` — leave/break/extra hours; must fall within salon hours unless `override` flag by admin.

---

### US-SVC-006 — Availability Calculation Engine

**Story:** As **booking module**, I want one engine combining schedules, holidays, leaves, buffers, timezone, overlaps, resources, and concurrency **so that** every API sees consistent slots.

**Spec:** [Availability-Engine.md](../Availability-Engine.md)

**Acceptance criteria**

- [ ] `AvailabilityEngine.suggestSlots()` implements full pipeline (§4).
- [ ] `AvailabilityEngine.assertSlotAvailable()` used inside booking transaction (§5).
- [ ] `TimezoneService` is the only conversion boundary (§7).
- [ ] Overlap check uses `tstzrange` consistent with GiST on `booking` (§8).
- [ ] `GET /availability/slots` exposes `suggestSlots` to UI.
- [ ] Unit tests per §10 (closed day, leave, buffer, overlap).

---

## API contract summary

| Method | Path | Permission (suggested) |
| --- | --- | --- |
| GET | `/services/catalog` | SERVICE:READ |
| POST | `/services` | SERVICE:WRITE |
| PUT | `/services/:id` | SERVICE:EDIT |
| PUT | `/services/:id/activate` | SERVICE:EDIT |
| PUT | `/services/:id/deactivate` | SERVICE:EDIT |
| GET | `/slots/config` | SLOT:READ |
| PUT | `/slots/config` | SLOT:EDIT |
| GET | `/staff/:staffId/availability` | STAFF:READ |
| POST | `/staff/:staffId/availability` | STAFF:EDIT |

---

## Database (new)

**Canonical schema:** [DB-Design-Booking-Calendar.md](../DB-Design-Booking-Calendar.md) (§3 — calendar & catalog).

### `service`

| Column | Type |
| --- | --- |
| `id` | UUID PK |
| `tenant_id` | UUID NOT NULL |
| `parent_id` | UUID nullable |
| `name` | varchar |
| `description` | text |
| `duration_min` | int |
| `completion_buffer_min` | int default 0 |
| `base_price` | decimal(10,2) |
| `assigned_staff_ids` | uuid[] or join table |
| `is_active` | boolean |
| audit + `deleted_at` |

**Indexes:** `(tenant_id, is_active)`, `(tenant_id, parent_id)`

### `slot_config`

| Column | Type |
| --- | --- |
| `tenant_id` | UUID PK |
| `slot_duration_min` | int |
| `buffer_before_min` | int |
| `buffer_after_min` | int |
| `working_hours` | jsonb |
| `overrides` | jsonb |

### `staff_availability`

| Column | Type |
| --- | --- |
| `id` | UUID PK |
| `tenant_id` | UUID |
| `staff_id` | UUID → user |
| `date` | date |
| `windows` | jsonb |
| `exception_type` | enum: `leave`, `break`, `extra` |

---

## Code to create

```text
src/modules/service/
libs/@anvix/business-core/modules/service/
libs/@anvix/server-core/database/entities/service.entity.ts
libs/@anvix/server-core/database/entities/slot-config.entity.ts
libs/@anvix/server-core/database/entities/staff-availability.entity.ts
libs/@anvix/business-core/modules/availability/availability-engine.service.ts
```

---

## Definition of Done

- [ ] Migrations + seed default `slot_config` per tenant.
- [ ] Swagger + DTOs for all endpoints.
- [ ] Unit tests: engine excludes booked slots and leave days.
- [ ] Tenant isolation tests on service CRUD.
