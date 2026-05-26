# Module 08 — Customer Self-Service & History

| Field | Value |
| --- | --- |
| **Portal** | Customer |
| **Phase** | P4 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/customer/self-service-history.md` |
| **Depends on** | Module 05, 12 (policies) |

---

## Overview

Customers view past/upcoming appointments, preview cancellation policy, reschedule or cancel without calling the salon.

---

## User stories

### US-HIST-001 — Appointment history

**Acceptance criteria**

- [ ] `GET /customers/:customerId/appointments/history?page=&from=&to=&serviceId=&staffId=`
- [ ] Only own `customerId` unless admin (403 otherwise).
- [ ] Status filters: `completed`, `cancelled`, `no_show`.
- [ ] Export-friendly fields (date, service names, amount).

---

### US-HIST-002 — Upcoming appointments

- [ ] `GET /customers/:customerId/appointments/upcoming`
- [ ] Includes `canReschedule`, `canCancel`, `policySummary` per row.

---

### US-POL-001 — Policy preview

- [ ] `GET /bookings/:id/policies` — cancellation window, fee %, notice hours (from `policy_snapshot` + live template).

---

### US-SELF-001 — Reschedule

- [ ] `PUT /bookings/:id/reschedule` — same as admin but permission `CUSTOMER_SELF_SERVICE`.
- [ ] Rejects if outside policy window → `422 ERR_POLICY_VIOLATION`.

---

### US-SELF-002 — Cancel

- [ ] `DELETE /bookings/:id` — optional `reason`; computes refund/fee from policy.
- [ ] Notifies salon via Module 06.

---

### US-NOT-FEED-001 — Notification timeline

- [ ] `GET /notifications?customerId=` — list confirmation/reminder/cancel events for dispute UI.

---

## API contract

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/customers/:customerId/appointments/history` | |
| GET | `/customers/:customerId/appointments/upcoming` | |
| GET | `/bookings/:id/policies` | |
| PUT | `/bookings/:id/reschedule` | Shared handler with Module 05 |
| DELETE | `/bookings/:id` | Shared handler |
| GET | `/notifications` | Query customerId |

---

## Security

| Rule | Implementation |
| --- | --- |
| Customer can only access own `customerId` | Compare JWT `sub` → customer mapping |
| Cross-tenant booking id | TenantAwareRepository returns 404 |

---

## Definition of Done

- [ ] E2E: book → upcoming → reschedule → history.
- [ ] Policy violation returns structured error for UI fee display.
- [ ] Waitlist not triggered on customer cancel if policy disables it (config flag).
