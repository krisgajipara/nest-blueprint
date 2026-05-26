# Calendar & Booking — Solution Playbook (High-Difficulty Problems)

Maps each hard problem to **concrete Anvix solutions** (PostgreSQL, NestJS, multi-tenant). Use with [DB-Design-Booking-Calendar.md](./DB-Design-Booking-Calendar.md).

**Legend:** MVP = ship in salon booking MVP | P2+ = post-MVP

---

## Difficulty overview

| Problem | Difficulty | MVP strategy | Primary owner component |
| --- | --- | --- | --- |
| Timezone conversion | Very High | One TZ per tenant + `TimezoneService` | `TimezoneService` |
| Slot overlapping | Very High | GiST exclusion + transactional booking | DB constraint + `BookingService` |
| Slot generation | Very High | Deterministic engine from config + bookings | `AvailabilityEngine` |
| Day-off management | High | `day_overrides` + staff leave rows | `tenant_calendar_config` + `staff_availability` |
| DST handling | Very High | Defer non-IST; use IANA TZ DB | `TimezoneService` (P2+) |
| Resource availability | Very High | Stylist as resource MVP; `service_staff` | `AvailabilityEngine` |
| Recurring schedules | Very High | Out of MVP | `RecurrenceService` (P2+) |
| Buffer timing | High | Config + included in slot `end_at` | `AvailabilityEngine` |
| Cross-calendar conflicts | High | External sync deferred | `CalendarSyncService` (P3+) |
| Real-time availability | Very High | Short cache TTL + invalidation; WS later | `AvailabilityEngine` + events |

---

## Target architecture

```text
                    ┌─────────────────────┐
                    │   TimezoneService   │  ← single conversion boundary
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────┐
│                              ▼                              │
│  tenant_calendar_config ──► AvailabilityEngine ◄── booking   │
│  service / service_staff       │ suggestSlots()      (read)  │
│  staff_availability            │ assertAvailable()           │
│                                ▼                             │
│                         BookingService                       │
│                    (create / reschedule / cancel)            │
│                    + GiST exclusion on INSERT                │
└─────────────────────────────────────────────────────────────┘
                               │
                    optional: CacheInvalidator (on booking commit)
                    optional: WebSocket gateway (P2+)
```

**Rule:** All datetime logic crosses **only** `TimezoneService` and **only** `AvailabilityEngine` for “is this slot open?”.

---

## 1. Timezone conversion (Very High)

### Problem

Local salon hours vs UTC instants; wrong boundaries on list/cancel/reminders; customer in another region.

### Solution

| Layer | Rule |
| --- | --- |
| **Canonical TZ** | One field: `tenant_calendar_config.timezone` (IANA, e.g. `Asia/Kolkata`). Do not duplicate in two config places. |
| **Persistence** | `booking.start_at` / `end_at` = `TIMESTAMPTZ` (UTC). |
| **Wall clock** | `working_hours`, `day_overrides`, `staff_availability.date` = **tenant local** (no Z suffix). |
| **API in** | Prefer `startAt` as ISO8601 with offset **or** `{ localDate, localTime }` + server uses tenant TZ. |
| **API out** | Always: `startAt` (UTC) + `startAtLocal` + `timezone`. |
| **Queries** | `?date=2026-05-21` → `TimezoneService.toUtcDayRange(tenantTz, date)` → SQL `BETWEEN`. |

### `TimezoneService` (Nest, `@core-utilities` or `availability` module)

```typescript
// Responsibilities only — no booking business rules
toUtc(localDate, localTime, tenantTimezone): Date
toLocal(utcInstant, tenantTimezone): { date, time }
toUtcDayRange(tenantTimezone, localDate): { fromUtc, toUtcExclusive }
formatForApi(utcInstant, tenantTimezone): ApiDateTimeDto
```

**Library:** `luxon` or `date-fns-tz` (pick one project-wide).

### MVP scope

- Default `Asia/Kolkata`; test 3 cases in § Tests.
- Customer “home TZ” = UI-only second column (P2+).

### DST (see §5)

Same service; use IANA database; add DST regression tests when tenant country ≠ IN.

---

## 2. Slot overlapping (Very High)

### Problem

Two bookings same stylist, same window, concurrent requests.

### Solution (defense in depth)

| Layer | Mechanism |
| --- | --- |
| **Database** | PostgreSQL **GiST exclusion** on `(tenant_id, staff_id, tstzrange)` |
| **Application** | `AvailabilityEngine.assertSlotAvailable()` before insert |
| **Concurrency** | Transaction; map `exclusion_violation` → `409 ERR_SLOT_CONFLICT` |
| **UX** | On 409, return `alternateSlots[]` from engine |

### Migration snippet (M4)

```sql
ALTER TABLE booking
ADD CONSTRAINT booking_no_staff_overlap
EXCLUDE USING gist (
  tenant_id WITH =,
  staff_id  WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
)
WHERE (
  deleted_at IS NULL
  AND staff_id IS NOT NULL
  AND status IN ('pending', 'confirmed', 'checked_in', 'servicing')
);
```

**Range must include service duration + buffers** in `end_at` so cleanup blocks the next booking.

### MVP scope

- GiST + app assert + integration test (two parallel `POST /bookings` → one success).

---

## 3. Slot generation (Very High)

### Problem

Generate valid start times from hours, breaks, service duration, existing bookings, staff rules.

### Solution — `AvailabilityEngine`

**Full specification:** [Availability-Engine.md](./Availability-Engine.md) (pipeline, TypeScript contract, concurrency, GiST alignment).

**API:** `GET /availability/slots` (read-only); internal `assertSlotAvailable()` on writes.

**Not in MVP:** precomputed slot table (P2 if slow).

### MVP scope

- Single stylist filter; multi-service duration sum; grid from `slot_duration_min`.

---

## 4. Day-off management (High)

### Problem

Salon closed on holidays; stylist on leave; special short days.

### Solution

| Type | Storage | Engine behavior |
| --- | --- | --- |
| **Salon holiday / closure** | `tenant_calendar_config.day_overrides` `{ date, type: "closed" }` | No slots that day |
| **Special hours** | `day_overrides` `{ type: "special_hours", open, close }` | Replace weekday template |
| **Stylist leave** | `staff_availability` `{ date, exception_type: "leave", allDay: true }` | Remove staff from that day |
| **Maintenance block** | `day_overrides` or admin “block” (P2) | Same as closed |

**APIs:**

- `PUT /slots/config` — merge `day_overrides`
- `POST /staff/:id/availability` — leave rows

### MVP scope

- JSON overrides + leave; no recurring “every Monday closed” (use working_hours `sunday.isOpen: false`).

---

## 5. DST handling (Very High)

### Problem

Clocks spring forward / fall back; slots may not exist or exist twice.

### Solution

| Phase | Approach |
| --- | --- |
| **MVP (India)** | `Asia/Kolkata` has **no DST** — document “IST-only MVP”; still use IANA TZ in `TimezoneService`. |
| **P2+** | When adding US/EU tenants: |
| | • All generation via `TimezoneService` + Luxon |
| | • Never use `+05:30` fixed offset; use `Asia/Kolkata`, `America/New_York` |
| | • Test suite: spring forward day, fall back day |
| | • On ambiguous local time, reject with `ERR_AMBIGUOUS_LOCAL_TIME` |

### MVP scope

- **No DST-specific code paths** beyond correct IANA usage; explicit QA matrix for IST only.

---

## 6. Resource availability (Very High)

### Problem

Stylist (and later room/chair) must be free; only stylists who can do the service.

### Solution (MVP = single resource type)

| Concern | Implementation |
| --- | --- |
| **Who can perform service** | `service_staff` join |
| **Who is working** | `user` active + not on leave (`staff_availability`) |
| **Who is already booked** | `booking` overlap for `staff_id` |
| **Unassigned stylist** | P2: iterate eligible staff, pick first free; MVP may **require** `staffId` on `POST /bookings` |

### P2+ multi-resource

```text
booking_resource (booking_id, resource_type, resource_id)
EXCLUDE per (tenant_id, resource_type, resource_id, tstzrange)
```

Constraint satisfaction deferred.

### MVP scope

- One `staff_id` per booking; engine filters by `service_staff`.

---

## 7. Recurring schedules (Very High)

### Problem

“Every Monday 10:00 for 6 weeks” — conflicts with holidays and edits.

### Solution

| Phase | Approach |
| --- | --- |
| **MVP** | **Not supported** — single appointment only. |
| **P2+** | Tables: `recurrence_series` (RRULE, tenant_id, staff_id, customer_id) + `recurrence_exception` |
| | Materialize next N instances via nightly job or on-demand expansion |
| | Each instance = normal `booking` row linked to `series_id` |

### MVP scope

- Document WON’T; avoid half-implemented RRULE in UI.

---

## 8. Buffer timing (High)

### Problem

Cleanup/prep between appointments; variable per service.

### Solution

| Buffer | Source |
| --- | --- |
| Before appointment | `tenant_calendar_config.buffer_before_min` (+ optional per-service later) |
| After service | `service.completion_buffer_min` + `tenant_calendar_config.buffer_after_min` |

**Effective blocked interval:**

```text
blockedStart = startAt - buffer_before
blockedEnd   = startAt + sum(durations) + sum(completion_buffers) + buffer_after
```

Store on `booking`: `start_at` = customer-facing start; `end_at` = **end of blocked window** (includes buffers) so GiST overlap is correct.

**Engine:** uses same formula when suggesting slots (next slot ≥ previous `end_at`).

### MVP scope

- Tenant defaults + per-service `completion_buffer_min`; no per-stylist buffer (P2).

---

## 9. Cross-calendar conflicts (High)

### Problem

Google/Outlook events not in Anvix DB; double-book against external calendar.

### Solution

| Phase | Approach |
| --- | --- |
| **MVP** | **In-app calendar only** — no external sync. |
| **P3+** | `CalendarSyncService`: OAuth, pull busy blocks into `external_busy_block` (tenant_id, staff_id, tstzrange, source) |
| | Availability engine subtracts external blocks |
| | Webhook + reconciliation cron; handle token refresh |

### MVP scope

- Zero external calendar code; admin manual blocks via `day_overrides` / leave.

---

## 10. Real-time availability (Very High)

### Problem

User A sees slot; User B books it; User A still sees it.

### Solution (phased)

| Phase | Mechanism |
| --- | --- |
| **MVP** | **No long cache** on write path; after `POST /bookings` commit → invalidate keys `avail:{tenant}:{staff}:{date}` |
| | Admin/staff UI: refetch agenda on focus or 30s poll |
| | `GET /availability/slots` cache TTL ≤ 30s if used at all |
| **P2** | WebSocket/SSE: room `tenant:{id}:calendar` event `slot.taken` |
| **P3** | Redis pub/sub across API instances |

**Do not** cache availability in Redis without invalidation on booking writes.

### MVP scope

- Cache invalidation hook in `BookingService` after create/cancel/reschedule.

---

## Implementation phases (maps to problems)

| Sprint | Deliverables | Problems addressed |
| --- | --- | --- |
| **S1** | `tenant_calendar_config`, `TimezoneService`, `PUT/GET /slots/config` | TZ (baseline), day-off (salon), buffers (config) |
| **S2** | `service`, `service_staff`, `staff_availability`, `AvailabilityEngine` v1, `GET /availability/slots` | Slot generation, resource availability, day-off (staff) |
| **S3** | `booking` + GiST + `BookingService` + `POST /bookings` | Overlap, buffers on write, real-time (invalidate) |
| **S4** | Reschedule/cancel/PATCH status, list by local date | TZ queries, overlap on update |
| **S5** | Payment hold, notifications | (adjacent) |
| **P2+** | DST tests, recurrence, WebSocket, external calendar | DST, recurring, cross-calendar, real-time v2 |

---

## Shared test matrix (QA)

| ID | Scenario | Expected |
| --- | --- | --- |
| T1 | Book 09:00 IST → DB UTC | `03:30Z` same calendar day |
| T2 | Parallel book same slot | One 201, one 409 |
| T3 | Salon closed on override date | Zero slots |
| T4 | Stylist leave | Zero slots for that staff |
| T5 | 30m service + 15m buffer | Next slot ≥ 45m later |
| T6 | Cancel booking | Slot reappears in `GET /availability/slots` |
| T7 | `GET /bookings?date=` local | Correct UTC bounds (IST day) |

---

## Nest modules to add

| Module | Services |
| --- | --- |
| `calendar` | `CalendarConfigService` |
| `availability` | `AvailabilityEngine`, `TimezoneService` |
| `service` | `ServiceCatalogService` |
| `booking` | `BookingService`, `BookingRepository` |

Register in `app.module.ts` after migrations.

---

## Document cross-links

| Topic | Doc |
| --- | --- |
| Tables & APIs | [DB-Design-Booking-Calendar.md](./DB-Design-Booking-Calendar.md) |
| GiST detail | DB design § (add on merge) + §2 above |
| User stories | [user-stories/04](./user-stories/04-service-availability.md), [05](./user-stories/05-booking-operations.md) |
| Industry context | [Appointment-Domain-Challenges.md](./Appointment-Domain-Challenges.md) |

---

## Summary

| Problem | MVP answer in one line |
| --- | --- |
| Timezone | `TimezoneService` + UTC instants + local JSON hours |
| Overlap | GiST `tstzrange` + `BookingService` transaction |
| Slot generation | `AvailabilityEngine` from config − bookings |
| Day-off | `day_overrides` + `staff_availability` |
| DST | IANA TZ; IST-only tests in MVP |
| Resource | `staff_id` + `service_staff` |
| Recurring | Deferred |
| Buffer | In `end_at` + engine step size |
| Cross-calendar | Deferred |
| Real-time | Invalidate cache; poll; WS later |

*Update this playbook when a problem moves from MVP to shipped.*
