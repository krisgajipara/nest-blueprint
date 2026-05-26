# Module 09 — Staff Daily Agenda

| Field | Value |
| --- | --- |
| **Portal** | Staff View |
| **Phase** | P6 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/staff-view/daily-agenda.md` |
| **Depends on** | Module 05 |

---

## Overview

Lightweight stylist desk: today's bookings, one-tap status updates, customer context snippets, urgent alerts.

---

## User stories

### US-AGENDA-001 — Today's list

**Acceptance criteria**

- [ ] `GET /staff/:staffId/agenda?date=today` — default today in tenant TZ.
- [ ] Sorted by `startAt`; badges: `confirmed`, `checked_in`, `servicing`, `completed`.
- [ ] Staff can only load **own** `staffId` unless admin role (403).

---

### US-AGENDA-002 — Quick status update

**Acceptance criteria**

- [ ] `PATCH /bookings/:id/status` — body `{ status }`.
- [ ] Allowed transitions per state machine (Module 05).
- [ ] Publishes real-time update (WebSocket future) or polling-friendly `updatedAt`.
- [ ] Under 2s visible on salon admin calendar (NFR-PERF-002).

---

### US-AGENDA-003 — Customer context on card

- [ ] `GET /bookings/:id/history` — last N services, allergies, internal notes (read-only for staff).
- [ ] Max 5 records; no full customer PII export.

---

### US-AGENDA-004 — Urgent alerts

- [ ] `GET /alerts/waitlist` — top waitlist entries for tenant/staff.
- [ ] `GET /alerts/reschedule-requests` — customer-initiated pending approvals.

---

## API contract

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/staff/:staffId/agenda` | STAFF:READ or self |
| PATCH | `/bookings/:id/status` | STAFF:EDIT |
| GET | `/bookings/:id/history` | STAFF:READ |
| GET | `/alerts/waitlist` | STAFF:READ |
| GET | `/alerts/reschedule-requests` | STAFF:READ |

---

## Implementation notes

- Reuse `BookingService.updateStatus()` — do not duplicate logic in staff module.
- Controller: `src/modules/staff/staff.controller.ts` thin wrapper.
- Filter agenda query: `WHERE staff_id = :staffId AND start_at >= :dayStart AND start_at < :dayEnd`.

---

## Definition of Done

- [ ] Stylist A cannot PATCH stylist B's booking.
- [ ] Mobile-friendly payload (minimal fields).
- [ ] Integration test for status flow checked_in → completed.
