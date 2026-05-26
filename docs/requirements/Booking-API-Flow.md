# Booking APIs — Setup Order, Flows & Endpoint Catalog

**Audience:** Backend, frontend, QA.  
**Depends on:** [DB-Design-Booking-Calendar.md](./DB-Design-Booking-Calendar.md), [Availability-Engine.md](./Availability-Engine.md), [Calendar-Booking-Solutions.md](./Calendar-Booking-Solutions.md)

**Resource model (MVP):** A **resource** = bookable stylist (`user` row). `booking.staff_id` = `resourceId`. Room/chair = post-MVP (`resource_type`).

---

## 1. What must exist before booking APIs work

Nothing in §3 (Booking APIs) is usable until the rows below exist. Build in this order.

```text
Phase 0 (already shipped)
├── tenant, user, role, auth
├── TenantGuard + x-tenant header
└── Staff users created via POST /users + role assign

Phase A — Calendar & catalog (blocking)
├── M1 migration: tenant_calendar_config, service, service_staff
├── M2 migration: staff_availability
├── TimezoneService
├── CalendarConfigService → GET/PUT /slots/config
├── ServiceCatalogService → /services/*
├── StaffAvailabilityService → /staff/:id/availability
└── AvailabilityEngine.suggestSlots → GET /availability/slots

Phase B — Customer & booking data
├── M3 migration: customer
├── M4 migration: booking, booking_line, booking_status_history, booking_note
│   └── btree_gist + GiST exclusion on booking
├── CustomerService (minimal — or inline in booking for walk-in guest)
└── BookingRepository.findBlockingRanges + lockOverlapping

Phase C — Booking APIs (this document §3)
├── AvailabilityEngine.assertSlotAvailable
├── BookingService
└── BookingController → /bookings/*, /resources

Phase D — After core book flow
├── Payment POST /bookings/:id/pay
├── Notifications, waitlist, staff agenda
└── Customer self-service (same booking service)
```

### Setup checklist (tenant admin before first booking)

| # | Action | API / data |
| --- | --- | --- |
| 1 | Tenant active | `PUT /tenants/:id/activate` |
| 2 | Calendar configured | `PUT /slots/config` (hours, buffers, timezone) |
| 3 | Services created | `POST /services` + activate |
| 4 | Stylists linked to services | `PUT /services/:id/staff` or bulk assign |
| 5 | Staff users exist | `POST /users` (stylist role) |
| 6 | Optional: leave/holiday | `day_overrides`, `POST /staff/:id/availability` |

---

## 2. HTTP conventions (all booking-domain APIs)

| Item | Value |
| --- | --- |
| Prefix | `/v1` if global versioned (match auth doc) |
| Tenant | **`x-tenant` or `x-tenant-id` required** (except `@TenantApi` routes) |
| Auth | `Authorization: Bearer <token>` |
| Guard | `RoleGuard` + `@RequirePermissions` on admin/staff routes |
| Response | `AppResponse<T>` / `CommonSearchResponseDto` for lists |

---

## 3. API catalog (full list)

### 3.0 Resources (bookable stylists — for calendar columns)

| # | Method | Path | Purpose | Phase |
| --- | --- | --- | --- | --- |
| R1 | `GET` | `/resources` | List bookable resources (id, name, avatar) for resource view picker | B |
| R2 | `GET` | `/resources/dropdown` | Paginated autocomplete (same as users but filtered to stylists) | B |

**`GET /resources` query**

| Param | Type | Description |
| --- | --- | --- |
| `serviceId` | UUID | Only staff who can perform this service |
| `isActive` | boolean | Default true |
| `search` | string | Name search |
| `pageNumber`, `pageSize` | int | Pagination |

**Response item (`ResourceResponseDto`):**

```json
{
  "resourceId": "uuid",
  "resourceType": "staff",
  "displayName": "Amit Kumar",
  "isActive": true
}
```

Implementation: query `user` + `service_staff` where user is staff role in tenant.

---

### 3.1 Calendar & availability (Phase A — setup)

| # | Method | Path | Permission |
| --- | --- | --- | --- |
| A1 | `GET` | `/slots/config` | `CALENDAR:READ` |
| A2 | `PUT` | `/slots/config` | `CALENDAR:EDIT` |
| A3 | `GET` | `/services/catalog` | `SERVICE:READ` |
| A4 | `POST` | `/services` | `SERVICE:WRITE` |
| A5 | `PUT` | `/services/:id` | `SERVICE:EDIT` |
| A6 | `PUT` | `/services/:id/activate` | `SERVICE:EDIT` |
| A7 | `PUT` | `/services/:id/deactivate` | `SERVICE:EDIT` |
| A8 | `PUT` | `/services/:id/staff` | `SERVICE:EDIT` |
| A9 | `GET` | `/staff/:staffId/availability` | `STAFF:READ` |
| A10 | `POST` | `/staff/:staffId/availability` | `STAFF:EDIT` |
| A11 | `GET` | `/availability/slots` | `BOOKING:READ` or public customer |

---

### 3.2 Appointments / bookings (Phase C — core)

| # | Method | Path | Purpose |
| --- | --- | --- | --- |
| B1 | `GET` | `/bookings` | **List appointments** (filters incl. **resourceIds**) |
| B2 | `GET` | `/bookings/calendar` | **Resource calendar view** (grouped by resource) |
| B3 | `POST` | `/bookings` | Create appointment |
| B4 | `GET` | `/bookings/:id` | Detail + lines + history + notes |
| B5 | `PUT` | `/bookings/:id/reschedule` | Move slot |
| B6 | `DELETE` | `/bookings/:id` | Cancel |
| B7 | `PATCH` | `/bookings/:id/status` | Staff status toggle |
| B8 | `POST` | `/bookings/:id/notes` | Internal note |
| B9 | `GET` | `/bookings/reference/:referenceId` | Lookup by ref |
| B10 | `POST` | `/bookings/:id/waitlist` | Enqueue waitlist |

**Note:** B1 flat list for tables/export; B2 optimized for **resource column calendar UI**. Can merge into B1 with `?view=groupedByResource` if you prefer one endpoint (see §4.2).

---

### 3.3 Payments & customer (Phase D)

| # | Method | Path |
| --- | --- | --- |
| D1 | `POST` | `/bookings/:id/pay` |
| D2 | `POST` | `/bookings/:id/otp-verify` |
| D3 | `GET` | `/customers/profile` |
| D4 | `PUT` | `/customers/profile` |
| D5 | `GET` | `/customers/:id/appointments/history` |
| D6 | `GET` | `/customers/:id/appointments/upcoming` |

---

## 4. List appointments — filters (resource view)

### 4.1 `GET /bookings` — flat list

**Use for:** Admin table, exports, staff agenda simple list.

**Query (`ListBookingsRequestDto`):**

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `resourceIds` | UUID[] | No | **Filter by stylist(s).** Comma-separated `resourceIds=id1,id2` or repeated param. Maps to `booking.staff_id IN (...)`. |
| `date` | string | No | Single local day `YYYY-MM-DD` (tenant TZ). Implies `from`/`to` = that day. |
| `from` | string | No | Local date start (inclusive) |
| `to` | string | No | Local date end (inclusive) |
| `status` | string[] | No | `pending,confirmed,...` |
| `customerId` | UUID | No | |
| `channel` | string | No | |
| `search` | string | No | Reference, customer name, phone |
| `pageNumber` | int | No | Default 1 |
| `pageSize` | int | No | Default 20 |
| `sortBy` | string | No | Whitelist: `startAt`, `createdAt`, `status` |
| `sortOrder` | string | No | `ASC` / `DESC` |

**Behavior:**

- Resolve `from`/`to` local dates → UTC range via `TimezoneService.toUtcDayRange`.
- If `resourceIds` empty → all resources in tenant (respect permission: staff may only see own id).
- SQL: `WHERE tenant_id = :t AND start_at >= :fromUtc AND start_at < :toUtcExclusive AND (staff_id IN (:resourceIds) OR :noFilter)`.

**Response item (`BookingListItemDto`):**

```json
{
  "id": "uuid",
  "referenceId": "BK8A2F91K",
  "status": "confirmed",
  "channel": "walk_in",
  "startAt": "2026-05-21T03:30:00.000Z",
  "endAt": "2026-05-21T04:15:00.000Z",
  "startAtLocal": "2026-05-21T09:00:00+05:30",
  "timezone": "Asia/Kolkata",
  "resourceId": "uuid",
  "resourceName": "Amit Kumar",
  "resourceType": "staff",
  "customerId": "uuid",
  "customerName": "Neha S",
  "customerPhone": "+91...",
  "serviceSummary": "Haircut, Beard",
  "totalAmount": 850.00
}
```

---

### 4.2 `GET /bookings/calendar` — resource view (grouped)

**Use for:** Salon calendar with **one column per stylist** (resource).

**Query (`CalendarBookingsRequestDto`):** same filters as B1, plus:

| Param | Type | Description |
| --- | --- | --- |
| `resourceIds` | UUID[] | **Required for multi-column view** (which columns to load). Omit = all active resources from R1. |
| `view` | enum | `day` \| `week` \| `month` (default `week`) |
| `anchorDate` | string | Local `YYYY-MM-DD` — week/month centered on this date |

**Response (`CalendarBookingsResponseDto`):**

```json
{
  "timezone": "Asia/Kolkata",
  "fromLocal": "2026-05-19",
  "toLocal": "2026-05-25",
  "resources": [
    {
      "resourceId": "uuid-1",
      "resourceName": "Amit",
      "appointments": [
        {
          "id": "booking-uuid",
          "startAt": "...",
          "endAt": "...",
          "startAtLocal": "...",
          "endAtLocal": "...",
          "status": "confirmed",
          "customerName": "Neha",
          "serviceSummary": "Haircut"
        }
      ]
    },
    {
      "resourceId": "uuid-2",
      "resourceName": "Priya",
      "appointments": []
    }
  ]
}
```

**Implementation:**

1. Resolve resource list from `resourceIds` or `GET /resources` logic.
2. Single query: all bookings in UTC window with `staff_id IN (resourceIds)`.
3. Group in memory by `staff_id` (O(n) — fine for MVP scale).

**Alternative:** `GET /bookings?view=groupedByResource` — same DTO; pick one URL for frontend consistency.

---

## 5. Core flows (sequence)

### 5.1 Admin — configure then open resource calendar

```text
1. PUT /slots/config
2. POST /services, PUT /services/:id/staff
3. GET /resources                    → column headers
4. GET /bookings/calendar
     ?anchorDate=2026-05-21&view=week&resourceIds=u1,u2,u3
```

---

### 5.2 Create appointment (desk / walk-in)

```text
1. GET /availability/slots
     ?serviceIds=...&staffId=...&localFromDate=2026-05-21
2. POST /bookings
     { serviceIds, resourceId (staffId), startAt, channel, customerId | guest }
     → AvailabilityEngine.assertSlotAvailable inside TX
     → 201 { id, referenceId, status: pending }
3. (optional) POST /bookings/:id/pay → confirmed
4. GET /bookings/calendar → UI refresh (or invalidate cache)
```

---

### 5.3 Reschedule from calendar drag (future UI)

```text
1. PUT /bookings/:id/reschedule
     { newStartAt, resourceId? }
2. GET /bookings/calendar (same filters)
```

---

### 5.4 Staff — my column only

```text
1. GET /bookings?resourceIds={myUserId}&date=today
   OR
   GET /bookings/calendar?resourceIds={myUserId}&view=day&anchorDate=today
2. PATCH /bookings/:id/status { status: checked_in }
```

Permission: staff role forced to `resourceIds = self` if they lack `BOOKING:READ_ALL`.

---

## 6. Screen → API matrix

| Screen | APIs |
| --- | --- |
| Salon settings — hours | A1, A2 |
| Service menu | A3–A8 |
| Stylist schedule / leave | A9, A10, R1 |
| New booking — pick slot | A11, B3 |
| **Resource week calendar** | R1, **B2** (resourceIds) |
| Appointment list / search | **B1** (resourceIds, status, dates) |
| Appointment detail | B4, B8 |
| Cancel / reschedule | B5, B6 |
| Staff today column | B1 or B2 + B7 |
| Customer book online | A11, B3, D1 |

---

## 7. Permissions (suggested)

| Permission | Allows |
| --- | --- |
| `BOOKING:READ` | B1, B2, B4, B9, A11 |
| `BOOKING:READ_ALL` | Any `resourceIds`; without it → only own `resourceId` |
| `BOOKING:WRITE` | B3, B8, B10 |
| `BOOKING:EDIT` | B5, B7 |
| `BOOKING:DELETE` | B6 |
| `CALENDAR:*`, `SERVICE:*`, `STAFF:*` | Phase A |

Add `BOOKING`, `CALENDAR`, `SERVICE`, `STAFF` to `MODULE_CONSTANTS` + `DEFAULT_PERMISSIONS`.

---

## 8. Implementation waves (PR plan)

| PR | Scope | APIs unlocked |
| --- | --- | --- |
| PR-1 | M1 + calendar + services | A1–A8 |
| PR-2 | M2 + staff availability + TimezoneService + Engine read | A9–A11 |
| PR-3 | M3–M4 + BookingService + GiST | B3, B4 |
| PR-4 | List + **resource calendar** | **B1, B2**, R1 |
| PR-5 | Reschedule, cancel, PATCH status, notes | B5–B8 |
| PR-6 | Pay, waitlist, customer | D1, B10, D3–D6 |

---

## 9. Endpoint index (JSON)

```json
{
  "setupOrder": ["slots/config", "services", "service_staff", "staff/availability", "availability/slots"],
  "resourceView": {
    "listResources": "GET /resources",
    "calendarGrouped": "GET /bookings/calendar?resourceIds=&view=week&anchorDate=",
    "flatList": "GET /bookings?resourceIds=&from=&to="
  },
  "bookingApis": [
    { "method": "GET", "path": "/bookings", "filters": ["resourceIds", "date", "from", "to", "status", "customerId"] },
    { "method": "GET", "path": "/bookings/calendar", "filters": ["resourceIds", "view", "anchorDate", "status"] },
    { "method": "POST", "path": "/bookings" },
    { "method": "GET", "path": "/bookings/:id" },
    { "method": "PUT", "path": "/bookings/:id/reschedule" },
    { "method": "DELETE", "path": "/bookings/:id" },
    { "method": "PATCH", "path": "/bookings/:id/status" },
    { "method": "POST", "path": "/bookings/:id/notes" },
    { "method": "GET", "path": "/bookings/reference/:referenceId" },
    { "method": "POST", "path": "/bookings/:id/waitlist" }
  ]
}
```

---

## 10. DTO naming in code

| API field | DB column | Note |
| --- | --- | --- |
| `resourceId` | `booking.staff_id` | Public API uses resource vocabulary |
| `resourceIds` | `staff_id IN (...)` | Filter on list/calendar |
| `staffId` | same | Accept alias on write for backward compat → map to `resourceId` |

Prefer **`resourceId` / `resourceIds`** in booking/calendar APIs; keep `staffId` only on `/staff/:staffId/availability`.

---

## 11. Related docs

| Doc | Topic |
| --- | --- |
| [Availability-Engine.md](./Availability-Engine.md) | Slot pipeline before POST |
| [user-stories/05-booking-operations.md](./user-stories/05-booking-operations.md) | Acceptance criteria |
| [user-stories/09-staff-daily-agenda.md](./user-stories/09-staff-daily-agenda.md) | Staff filter = single resourceId |

---

*When implementing B1/B2, add Swagger query DTOs with `@ApiProperty` for `resourceIds` array and document comma-separated format.*
