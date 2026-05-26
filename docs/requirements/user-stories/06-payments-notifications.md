# Module 06 — Payments & Notifications

| Field | Value |
| --- | --- |
| **Portals** | Customer, Salon Admin |
| **Phase** | P3 |
| **Status** | ⬜ Not implemented |
| **Depends on** | Module 05 |

---

## Overview

Confirm bookings via payment (UPI/card), OTP arrival verification, and multi-channel notifications with audit trail.

---

## User stories

### US-PAY-001 — Pay for booking

**Acceptance criteria**

- [ ] `POST /bookings/:id/pay` — idempotent via `Idempotency-Key` header.
- [ ] Body: `{ paymentMethod, providerPayload }` (gateway-specific DTO wrapper).
- [ ] On success: `status → confirmed`, persist `payment` row.
- [ ] On failure: booking stays `pending`, log attempt.

---

### US-PAY-002 — Booking OTP verify (arrival)

- [ ] `POST /bookings/:id/otp-verify` — `{ code }`.
- [ ] Marks `arrivalVerifiedAt`; staff UI shows verified badge.

---

### US-CUST-OTP-001 — Customer profile OTP

- [ ] `POST /customers/verify` — issue/confirm OTP for profile edits (Module 07).

---

### US-NOT-001 — Send booking notification

**Acceptance criteria**

- [ ] `POST /notifications/bookings` — `{ bookingId, type, channel? }`.
- [ ] Types: `confirmation`, `reminder_24h`, `reminder_1h`, `delay`, `cancel`, `reschedule`.
- [ ] Writes `notification_log` with `queued|sent|failed`.

---

### US-NOT-002 — Scheduled reminders

- [ ] Cron/scheduler reads confirmed bookings; enqueues reminders (Nest `@Cron` or queue).
- [ ] Respect tenant timezone from `tenant.config`.

---

### US-NOT-003 — Reference deep link

- [ ] `GET /bookings/reference/:referenceId` — minimal PII; optional OTP gate for edits.

---

## API contract

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/bookings/:id/pay` | Idempotency-Key required |
| POST | `/bookings/:id/otp-verify` | |
| POST | `/notifications/bookings` | Internal + admin trigger |
| GET | `/bookings/reference/:referenceId` | May be `@AllowWithoutTenant` + rate limit TBD |

---

## Database

### `payment`

| Column | Notes |
| --- | --- |
| `tenant_id`, `booking_id` | |
| `amount`, `currency` | INR default |
| `provider` | razorpay, etc. |
| `provider_ref` | external id |
| `status` | pending, success, failed |
| `idempotency_key` | UK per tenant |

### `notification_log`

| Column | Notes |
| --- | --- |
| `tenant_id`, `booking_id` | |
| `channel` | sms, email, push |
| `template_id`, `template_variant` | A/B |
| `status` | |
| `sent_by_user_id` | nullable |

---

## Integrations

| Integration | Config keys | Owner task |
| --- | --- | --- |
| Payment gateway | `payment.*` in configuration.ts | Finance picks provider |
| SMS | `sms.*` | Ops |
| Email | existing `AppMailerModule` | |

---

## Definition of Done

- [ ] Payment webhook handler (if async confirm).
- [ ] Retry + idempotency tests.
- [ ] No card/UPI data stored except provider token/ref (PCI minimization).
