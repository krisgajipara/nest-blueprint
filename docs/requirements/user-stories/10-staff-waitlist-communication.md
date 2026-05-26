# Module 10 — Staff Waitlist & Communication

| Field | Value |
| --- | --- |
| **Portal** | Staff View |
| **Phase** | P6 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/staff-view/waitlist-communication.md` |
| **Depends on** | Module 05, 06 |

---

## Overview

When slots open, notify waitlisted customers. Staff sends templated SMS/push with audit trail. Surfaces reputation tags before messaging.

---

## User stories

### US-WL-001 — Waitlist board

**Acceptance criteria**

- [ ] `GET /waitlist?staffId=&date=` — ordered by position; `estimatedWaitMin`, `loyaltyTags`.
- [ ] Populated when booking cancelled/rescheduled (async worker < 30s SLA).

---

### US-WL-002 — Notify next customer

- [ ] `POST /waitlist/:id/notify` — sends slot-release template via Module 06.
- [ ] Marks entry `notified`; idempotent if already sent.
- [ ] AB test variant `template_variant` (BRD AB-WL-01).

---

### US-COM-001 — Message templates CRUD

- [ ] `POST /communications/templates` — `{ code, channel, bodyHindi, bodyEn }`.
- [ ] Tenant-scoped; codes: `early_arrival`, `delay`, `slot_open`, `stylist_ready`.

---

### US-COM-002 — Send ad-hoc message

- [ ] `POST /communications/messages` — `{ customerId, templateCode, bookingId? }`.
- [ ] Logs `sent_by_user_id` from JWT.

---

### US-COM-003 — Reputation context

- [ ] `GET /customers/:customerId/reputation` — `advance_pay`, `vip`, `risk`.
- [ ] Staff/Admin only; tenant-scoped.

---

## API contract

| Method | Path |
| --- | --- |
| GET | `/waitlist` |
| POST | `/waitlist/:id/notify` |
| POST | `/communications/templates` |
| POST | `/communications/messages` |
| GET | `/customers/:customerId/reputation` |

---

## Database

### `waitlist_entry`

| Column | Notes |
| --- | --- |
| `tenant_id` | |
| `customer_id` | |
| `staff_id` | optional preference |
| `service_ids` | uuid[] |
| `position` | int |
| `status` | waiting, notified, booked, expired |
| `booking_id` | set when converted |

---

## Background job

**On `booking.cancelled`:**

1. Find waitlist for overlapping slot/staff.
2. Pick highest priority (position ASC).
3. Optionally auto-notify (AB-WL-01 variant A).

---

## Definition of Done

- [ ] Cancel booking triggers waitlist candidate within SLA.
- [ ] Audit log for every staff-sent message.
- [ ] No message to customer outside tenant.
