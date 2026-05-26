# Appointment Booking — Domain Challenges × Anvix MVP

Reference for architects and developers. Maps common production problems to **what Anvix ships now**, **Phase 1–3 plan**, and **post-MVP**.

**Stack (this repo):** NestJS, PostgreSQL, TypeORM, multi-tenant (`tenant_id`), global `TenantGuard`, `TenantAwareRepository`, future Redis/cache as needed.

**Related docs:** [BRD](./BRD-Salon-Booking-Platform.md), [user-stories](./user-stories/README.md), [04-service-availability](./user-stories/04-service-availability.md), [05-booking-operations](./user-stories/05-booking-operations.md).

---

## Architecture target (salon MVP)

```text
Client (Customer / Admin / Staff)
        ↓
API Gateway (future) / Nest controllers
        ↓
┌───────────────────┬────────────────────┬─────────────────────┐
│ Availability      │ Booking            │ Policy (PO)         │
│ Engine            │ Service            │ (cancel windows)    │
│ (slots, buffers)  │ (CRUD, status)     │                     │
└─────────┬─────────┴─────────┬──────────┴──────────┬──────────┘
          │                     │                     │
          └──────────┬──────────┴─────────────────────┘
                     ↓
              PostgreSQL (OLTP, tenant-scoped)
                     ↓
          ┌──────────┴──────────┐
          │ Notification       │ Payment orchestrator
          │ (queue + audit)    │ (hold → pay → confirm)
          └────────────────────┘
```

**Hardest problem for us (same as industry):** real-time availability under concurrency — design Phase 1–2 around this, not around calendar sync or analytics first.

---

## Challenge matrix

| # | Problem | Salon MVP priority | Anvix approach (MVP) | Phase | Post-MVP |
| --- | --- | --- | --- | --- | --- |
| 1 | **Double booking** | **P0** | PG transaction + `SELECT … FOR UPDATE` on slot row; `booking.version` optimistic lock; retry on 409 | 1–2 | Redis lock if multi-instance workers |
| 2 | **Slot generation** | **P0** | `service.duration`, buffers in `slot_config`, staff availability JSON, salon hours | 1 | Recurrence engine (RRULE) |
| 3 | **Timezones** | **P1** | Store `timestamptz` UTC; `tenant.config.timezone` (e.g. `Asia/Kolkata`); convert in API/UI only | 1–2 | DST tests for non-IN tenants |
| 4 | **Real-time availability sync** | **P1** | Short TTL on slot cache; invalidate on booking commit; optional WebSocket later | 2 | Socket.IO / SSE |
| 5 | **Calendar integration** | P3 | Out of MVP | — | Google/Outlook sync jobs |
| 6 | **Rescheduling** | **P0** | Single DB transaction: validate new slot → update booking → release old window; not naive `UPDATE` | 2 | Saga if payment/refund involved |
| 7 | **Cancellation policies** | **P1** | `policy_snapshot` on booking; Module 12 templates; fee rules in service layer | 2 + 12 | Refund orchestration |
| 8 | **Payment + booking atomicity** | **P1** | **Reservation pattern:** `pending` + slot hold → pay → `confirmed`; expiring hold (5 min) | 3 | Saga + compensating cancel |
| 9 | **High-concurrency slot search** | P2 | Query by tenant + staff + date range; index `(tenant_id, staff_id, start_at)` | 1–2 | Precomputed availability table |
| 10 | **No-show** | P2 | Status `no_show`; reputation flag on `customer` | 2 | Penalties, overbooking rules |
| 11 | **Multi-resource allocation** | P3 | MVP: one primary resource (stylist); optional room later | 2 | CSP / joint availability |
| 12 | **Recurring appointments** | P3 | Out of MVP | — | Series + exception dates |
| 13 | **Notification reliability** | **P1** | Queue + `notification_log` + idempotency key; 24h/1h cron | 3 | WhatsApp provider, dedup |
| 14 | **Multi-tenant** | **P0** | Shipped: `TenantGuard`, `TenantAwareRepository`, `@TenantApi()` | 0 ✅ | Per-tenant noisy-neighbor monitoring |
| 15 | **Reporting / analytics** | P2 | Module 13 rollups; avoid heavy reports on OLTP | 7 | Warehouse / BI |
| 16 | **Audit & compliance** | P1 | Status history table; audit middleware fields; PO escalations | 2 | Immutable audit store |
| 17 | **Waitlist** | **P1** | `waitlist_entry` + job on cancel; `POST /waitlist/:id/notify` | 2 + 10 | Fair queue + timeout |
| 18 | **Offline sync** | P3 | Out of MVP | — | Mobile sync protocol |
| 19 | **Search / filters** | P1 | `GET /tenants/nearby` + service catalog filters | 4 | Elasticsearch if scale |
| 20 | **Scaling** | P2 | Modular monolith first; stateless API; queue for async | 3+ | CQRS / event sourcing if needed |

**Legend:** P0 = MVP blocker, P1 = MVP should-have, P2 = stretch, P3 = later.

---

## Deep dives (what to implement)

### 1. Double booking (P0)

**MVP flow (single PostgreSQL, one Nest app):**

```text
BEGIN;
  -- lock overlapping bookings for staff + window
  SELECT id FROM booking
  WHERE tenant_id = :t AND staff_id = :s
    AND start_at < :end AND end_at > :start
    AND status NOT IN ('cancelled')
  FOR UPDATE;

  IF conflict → ROLLBACK → 409 ERR_SLOT_CONFLICT

  INSERT booking (... version = 0);
COMMIT;
```

**Also:** optimistic `version` on update/reschedule; client retries on 409 with alternate slots from availability engine.

**Do not rely on** cache-only checks without DB lock.

---

### 2. Slot generation (P0) — Module 04

| Input | Source |
| --- | --- |
| Service duration | `service.duration_min` + `completion_buffer_min` |
| Salon window | `slot_config.working_hours` |
| Buffers | `buffer_before_min`, `buffer_after_min` |
| Staff exception | `staff_availability` (leave/break) |
| Existing bookings | `booking` rows in range |

**Engine API (internal):** `suggestSlots({ tenantId, serviceIds, staffId?, from, to }) → Slot[]`

**Rule:** end time = start + sum(durations) + buffers; next slot earliest = previous end + buffer_after.

---

### 3. Timezones (P1)

| Layer | Rule |
| --- | --- |
| DB | `timestamptz` (UTC storage) |
| Tenant | `tenant.config.timezone` default `Asia/Kolkata` |
| API request | ISO8601 with offset OR local date + time + implicit tenant TZ (document in OpenAPI) |
| Response | UTC + optional `localStartAt` in DTO for UI |
| Cron reminders | Schedule in tenant TZ, store next run UTC |

**DST:** India has no DST; add tests when supporting US/EU tenants.

---

### 4. Real-time sync (P1)

**MVP without WebSocket:**

1. No long-lived availability cache (> 30s TTL) on write path.
2. On booking commit → delete cache keys `availability:{tenant}:{staff}:{date}`.
3. Admin/staff UI polls or refetches agenda after PATCH status.

**Phase 2+:** emit `booking.updated` → Socket room `tenant:{id}:staff:{id}`.

---

### 6–7. Reschedule & cancellation (P0)

**Reschedule = orchestrated steps in one transaction:**

```text
validate policy (notice hours)
validate new slot (engine + FOR UPDATE)
update booking start/end, increment version
append booking_status_history
COMMIT → async: notifications + waitlist (if cancel path)
```

**Cancel:**

```text
set status = cancelled, reason, cancelled_at
release slot (implicit — no overlapping booking row)
snapshot policy applied fee
COMMIT → queue: waitlist notify, customer SMS
```

**Partial failure (post-MVP saga):** if payment refund fails, booking stays cancelled but compensation task retries — never leave “orphan” without audit row.

---

### 8. Payment + booking (P1) — Module 06

**Reservation pattern (MVP):**

| Step | State | Slot |
| --- | --- | --- |
| Create booking | `pending` | soft-held in transaction / status |
| Pay started | `pending` | `hold_expires_at = now() + 5min` |
| Pay OK | `confirmed` | hold cleared |
| Pay fail / timeout | `cancelled` or `expired` | slot released |

**Idempotency:** `Idempotency-Key` on `POST /bookings/:id/pay`.

**Not MVP:** full two-phase commit with external PSP — use webhook + reconcile job.

---

### 9. Slot search at scale (P2)

**MVP indexes:**

```sql
CREATE INDEX idx_booking_tenant_staff_start
  ON booking (tenant_id, staff_id, start_at)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_booking_tenant_start_status
  ON booking (tenant_id, start_at, status)
  WHERE deleted_at IS NULL;
```

**Later:** `availability_snapshot` table nightly or on-change for “search tomorrow 4–6 PM”.

---

### 13. Notifications (P1)

| Concern | MVP |
| --- | --- |
| Duplicate | `dedupe_key` = `{bookingId}:{template}:{scheduledFor}` unique |
| Failed | retry 3x exponential backoff in BullMQ |
| Storm | one reminder cron per booking, not per service line |
| Channels | email (existing mailer) + SMS adapter interface |

---

### 14. Multi-tenant (P0 — mostly done)

Already: row-level `tenant_id`, global guard, PO cross-tenant via `@TenantApi()`.

**Booking module must:** never accept `tenantId` in body; always from `AsyncContextService`.

---

### 17. Waitlist (P1)

On `booking.cancelled` event:

```text
find waitlist_entry (tenant, staff, overlapping service, status=waiting)
ORDER BY position ASC LIMIT 1
→ notify → status=notified
```

Race: `FOR UPDATE` on waitlist row when promoting to booked.

---

## Component ownership (Nest modules)

| Component | Module / file | Owns |
| --- | --- | --- |
| Slot + availability engine | `availability` (business-core) | suggestSlots, validateSlot |
| Booking engine | `booking` | create, reschedule, cancel, status, version |
| Policy evaluator | `policy` (PO) | notice hours, fee % |
| Payment orchestrator | `payment` | hold, confirm, webhook |
| Notification engine | `notification` | templates, queue, audit log |
| Scheduler | `@nestjs/schedule` or Bull | reminders, hold expiry |
| Audit | middleware + `booking_status_history` | who/when |

Keep **availability** and **booking** as separate services to avoid god-service; booking calls availability, not vice versa.

---

## What to pick next (aligned with Implementation TODO)

| Order | TODO phase | Solves challenges |
| --- | --- | --- |
| 1 | **Phase 1** — service + slot config + staff availability + engine | #2, #9 (baseline), #3 (TZ in config) |
| 2 | **Phase 2** — booking CRUD + locks + status + reschedule/cancel | #1, #6, #7, #17 (waitlist hook) |
| 3 | **Phase 3** — hold + pay + notifications | #8, #13 |
| 4 | Phase 0 hardening — tenant e2e tests | #14 |
| 5 | Phase 12 minimal policies | #7 before customer self-service #8 |

**Defer:** #5 calendar sync, #11 multi-resource, #12 recurring, #18 offline, #20 CQRS until MVP proven.

---

## Interview / design talking points (Anvix-specific answers)

| Question | Short answer for this codebase |
| --- | --- |
| Prevent double booking? | Transaction + `FOR UPDATE` on overlapping rows + optimistic `version` |
| Scale slot search? | Tenant-scoped indexes first; precompute later; no ES in MVP |
| Payment failure? | Reservation + expiring hold; idempotent pay; webhook reconcile |
| Recurring schedules? | Not MVP; store RRULE post-MVP |
| Distributed locks? | Postgres locks sufficient for monolith; Redis if split workers |
| Timezone/DST? | UTC DB + tenant TZ; IST default |
| Multi-resource? | Single stylist resource in MVP |
| Audit? | `booking_status_history` + existing audit middleware |
| Calendar sync? | Phase 3+ integration service with retry queue |

---

## Open decisions (log in BRD §15 when resolved)

| ID | Decision needed |
| --- | --- |
| AD-01 | Slot hold: DB status only vs separate `slot_hold` table |
| AD-02 | WebSocket in MVP or polling-only for staff desk |
| AD-03 | Login requires `x-tenant` for staff vs email-global |
| AD-04 | Policy engine inline in booking vs shared `PolicyService` |

---

*When implementation choices change, update this file and the relevant user-story module (04, 05, 06).*
