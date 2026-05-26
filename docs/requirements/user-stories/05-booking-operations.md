# Module 05 — Booking Operations

| Field | Value |
| --- | --- |
| **Portal** | Salon Admin (+ feeds Staff & Customer) |
| **Phase** | P2 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/salon-admin/booking-operations.md` |
| **Depends on** | Module 04, 03, 06 (notifications partial) |

---

## Overview

Core MVP: unified **booking** entity, status machine, calendar APIs, reschedule/cancel, notes, waitlist enqueue. Channel-agnostic intake (`app`, `web`, `whatsapp`, `phone`, `walk_in`).

---

## User stories

### US-BOOK-001 — Create booking

**Acceptance criteria**

- [ ] `POST /bookings` returns `201` + `referenceId` + `status: pending`.
- [ ] Validates slots via availability engine (Module 04).
- [ ] Optimistic lock: `version` column; concurrent same slot → `409 ERR_SLOT_CONFLICT` + alternate slots in error payload.
- [ ] Supports `customerId` OR `guest: { name, phone }`.
- [ ] `channel` enum required.
- [ ] Pricing snapshot stored on booking (service prices at book time).

**Request body**

| Field | Type | Required |
| --- | --- | --- |
| `customerId` | UUID | No* |
| `guest` | object | No* |
| `serviceIds` | UUID[] | Yes |
| `staffId` | UUID | No |
| `startAt` | ISO8601 | Yes |
| `channel` | enum | Yes |
| `notes` | string | No |

---

### US-BOOK-002 — List / calendar (resource view)

**Spec:** [Booking-API-Flow.md](../Booking-API-Flow.md) §4

- [ ] `GET /bookings` — flat list with **`resourceIds`** filter (+ `date` / `from` / `to`, `status`, `customerId`)
- [ ] `GET /bookings/calendar` — grouped by resource for column calendar (`view=day|week|month`, `anchorDate`)
- [ ] `GET /resources` — bookable stylists for column picker
- [ ] Paginated list; calendar returns all resources in range (bounded by date window)
- [ ] Response includes `resourceId`, `resourceName`, local + UTC times

---

### US-BOOK-003 — Booking detail

- [ ] `GET /bookings/:id` — lines, pricing, notes, `statusHistory[]`, customer/guest.

---

### US-BOOK-004 — Reschedule

- [ ] `PUT /bookings/:id/reschedule` — `{ newStartAt, staffId? }`.
- [ ] Policy check (Module 12) — min notice window.
- [ ] Re-validates availability; increments `version`.

---

### US-BOOK-005 — Cancel

- [ ] `DELETE /bookings/:id` — body `{ reason }`.
- [ ] Sets `cancelled`, releases slot, triggers waitlist job (Module 10).
- [ ] Applies cancellation fee per `policy_snapshot`.

---

### US-BOOK-006 — Internal notes

- [ ] `POST /bookings/:id/notes` — `{ text, isInternal: true }`.
- [ ] Append-only; author from JWT user id.

---

### US-BOOK-007 — Manual notification trigger

- [ ] `POST /bookings/:id/notifications` — `{ type: reminder|delay|early_arrival }`.
- [ ] Delegates to Module 06.

---

### US-BOOK-008 — Waitlist enqueue

- [ ] `POST /bookings/:id/waitlist` — customer wants slot when available (or separate POST without booking).

---

## Status state machine

```text
pending → confirmed → checked_in → servicing → completed
   ↓         ↓            ↓
cancelled  cancelled   no_show (from servicing/checked_in)
```

**Rules**

- `pending → confirmed`: payment (Module 06) or admin override.
- Staff PATCH (Module 09): `checked_in`, `servicing`, `completed`.
- Illegal transitions → `422 ERR_INVALID_STATUS_TRANSITION`.

---

## API contract

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/bookings` | BOOKING:READ |
| POST | `/bookings` | BOOKING:WRITE |
| GET | `/bookings/:id` | BOOKING:READ |
| PUT | `/bookings/:id/reschedule` | BOOKING:EDIT |
| DELETE | `/bookings/:id` | BOOKING:DELETE |
| POST | `/bookings/:id/notes` | BOOKING:EDIT |
| POST | `/bookings/:id/notifications` | BOOKING:EDIT |
| POST | `/bookings/:id/waitlist` | BOOKING:WRITE |
| GET | `/bookings/reference/:referenceId` | BOOKING:READ or public+OTP |

---

## Database

**Canonical schema:** [DB-Design-Booking-Calendar.md](../DB-Design-Booking-Calendar.md) (§4 — bookings).

### `booking`

| Column | Notes |
| --- | --- |
| `tenant_id` | required |
| `reference_id` | unique per tenant, human-friendly |
| `status` | enum |
| `channel` | enum |
| `customer_id` | nullable |
| `guest_snapshot` | jsonb |
| `staff_id` | nullable |
| `start_at`, `end_at` | timestamptz |
| `policy_snapshot` | jsonb |
| `pricing_snapshot` | jsonb |
| `version` | int optimistic lock |

### `booking_line`, `booking_status_history`, `booking_note`

See BRD §12.3.

**Indexes:** `(tenant_id, start_at)`, `(tenant_id, staff_id, start_at)`, `(tenant_id, reference_id)`.

---

## Events (internal)

Emit after commit (for dashboard + notifications):

| Event | Payload |
| --- | --- |
| `booking.created` | bookingId, tenantId |
| `booking.confirmed` | bookingId |
| `booking.cancelled` | bookingId, slotReleasedAt |
| `booking.status_changed` | oldStatus, newStatus |

---

## Definition of Done

- [ ] Full lifecycle integration test in tenant A only.
- [ ] Double-booking test (409).
- [ ] Swagger + permissions `BOOKING` in constants.
- [ ] Audit on status changes.
