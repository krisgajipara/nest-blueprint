# Implementation TODO Tracker

Purpose: maintain one execution checklist for the Booking MVP across all portals.

**Detailed dev specs:** `docs/requirements/user-stories/` (per module).

## How to use this tracker
- Mark items with `[x]` only after code, tests, and docs are updated.
- Keep each task PR-sized (small, reviewable, and testable).
- Update this file at the end of each implementation session.

## Phase 0 - Foundations (Tenant + Auth + RBAC)
- [x] Global `TenantGuard` with `@TenantApi()` / `@AllowWithoutTenant()` exemptions (no per-route dual guards).
- [ ] Tenant context middleware is wired in request lifecycle.
- [ ] Tenant-aware base entities/repositories are in place.
- [ ] Auth flow is stable (JWT/OAuth + OTP verification endpoints).
- [ ] Role/permission seed data includes Product Owner, Salon Admin, Staff.
- [ ] User-role assignment and role cache invalidation are implemented.
- [ ] Audit logging is enabled for tenant/user/role changes.

## Phase 1 - Service and Availability Core

**DB spec:** `docs/requirements/DB-Design-Booking-Calendar.md` (§3, §6.1)

- [ ] Migration M1: `tenant_calendar_config`, `service`, `service_staff`
- [ ] Migration M2: `staff_availability`
- [ ] Service catalog CRUD (`/services`, `/services/catalog`, activate/deactivate) is implemented.
- [ ] Parent-child category support and stylist assignment are implemented.
- [ ] Slot configuration APIs (`/slots/config`) are implemented.
- [ ] Buffer logic (before/after) and dynamic day-off overrides are implemented.
- [ ] Staff availability APIs (`/staff/:staffId/availability`) are implemented.
- [ ] Availability Calculation Engine (`AvailabilityEngine` + `TimezoneService`) per `docs/requirements/Availability-Engine.md`
- [ ] `GET /availability/slots` wired to `suggestSlots`
- [ ] `assertSlotAvailable` wired in `POST /bookings` transaction

## Phase 2 - Booking Lifecycle (Core MVP)

**DB spec:** `docs/requirements/DB-Design-Booking-Calendar.md` (§4, §6.2)

- [ ] Migration M3: `customer`
- [ ] Migration M4: `booking`, `booking_line`, `booking_status_history`, `booking_note`
- [ ] Unified booking creation (`POST /bookings`) supports all intake channels.
- [ ] Booking status state machine is implemented (pending -> confirmed -> checked-in -> servicing -> done).
- [ ] Reschedule (`PUT /bookings/:id/reschedule`) with policy and availability validation is implemented.
- [ ] Cancellation (`DELETE /bookings/:id`) releases slot and records reason.
- [ ] Booking details and history (`GET /bookings/:id`) include notes and status changes.
- [ ] Optimistic locking/double-booking guard is implemented and tested.

## Phase 3 - Payment, OTP, and Notifications
- [ ] Booking payment API (`POST /bookings/:id/pay`) is integrated with gateway abstraction.
- [ ] OTP verify flow (`POST /bookings/:id/otp-verify`, `/customers/verify`) is implemented.
- [ ] Notification dispatcher supports confirmation/reminder/delay/cancel/reschedule events.
- [ ] Booking reference lookup (`GET /bookings/reference/:referenceId`) is implemented.
- [ ] Notification audit trail records sender, channel, and delivery status.

## Phase 4 - Customer Portal Modules

### Discovery and Profile
- [ ] Nearby salon discovery (`GET /tenants/nearby`) with radius and filters is implemented.
- [ ] Service discovery details (`GET /services/:id`) are exposed for customer UX.
- [ ] Customer profile APIs (`GET/PUT /customers/profile`) are implemented with OTP guard.
- [ ] Loyalty/reputation markers are readable by authorized flows only.

### Self-service and History
- [ ] Appointment history (`GET /customers/:customerId/appointments/history`) is implemented.
- [ ] Upcoming appointments (`GET /customers/:customerId/appointments/upcoming`) is implemented.
- [ ] Policy preview endpoint (`GET /bookings/:id/policies`) is implemented.
- [ ] Self-service reschedule/cancel respects policy windows and penalties.

## Phase 5 - Salon Admin Portal Modules

### Booking Operations

**API plan:** `docs/requirements/Booking-API-Flow.md`

- [ ] `GET /resources` — bookable stylists for resource view
- [ ] Booking list (`GET /bookings`) with **resourceIds** + date/status filters
- [ ] Resource calendar (`GET /bookings/calendar`) grouped by resourceId
- [ ] Manual booking creation supports new and existing customers.
- [ ] Internal booking notes (`POST /bookings/:id/notes`) are implemented.
- [ ] Waitlist enqueue (`POST /bookings/:id/waitlist`) is implemented.
- [ ] Booking-level notification trigger (`POST /bookings/:id/notifications`) is implemented.

### Role and User Management
- [ ] Role CRUD (`POST/GET/PUT/DELETE /roles`) is implemented with safeguards.
- [ ] Role assignment APIs are implemented (`/roles/users/assign-role`, `/users/:userId/role`).
- [ ] User CRUD (`GET/POST/PUT/DELETE /users`) is implemented with soft delete.
- [ ] Role and user dropdown APIs are implemented for UI selectors.

## Phase 6 - Staff View Modules

### Daily Agenda
- [ ] Staff agenda endpoint (`GET /staff/:staffId/agenda`) is implemented.
- [ ] Quick status update endpoint (`PATCH /bookings/:id/status`) is implemented.
- [ ] Booking history snippets (`GET /bookings/:id/history`) are optimized for desk UI.

### Waitlist and Communication
- [ ] Waitlist board endpoint (`GET /waitlist`) is implemented.
- [ ] Slot release notification (`POST /waitlist/:id/notify`) is implemented.
- [ ] Communication templates (`POST /communications/templates`) are implemented.
- [ ] Staff message dispatch (`POST /communications/messages`) is implemented with audit.
- [ ] Customer reputation read endpoint (`GET /customers/:customerId/reputation`) is scoped safely.

## Phase 7 - Product Owner Portal Modules

### Tenant Onboarding
- [ ] Tenant CRUD and lifecycle (`GET/POST/PUT /tenants`, activate/deactivate) is implemented.
- [ ] Onboarding wizard state and document verification workflow are implemented.
- [ ] Tenant bootstrap seeds default roles and starter templates.

### Policy and Support
- [ ] Policy CRUD (`GET/POST/PUT /policies`) with versioning is implemented.
- [ ] Tenant policy override and rollback behavior is implemented.
- [ ] Escalation queue APIs (`GET/POST /support/escalations`) are implemented.
- [ ] Credential resend flow (`POST /support/credentials/resend`) is implemented and audited.

### Health Dashboard
- [ ] Tenant health metrics endpoint (`GET /dashboards/tenants-health`) is implemented.
- [ ] Booking KPI endpoint (`GET /dashboards/bookings-kpis`) is implemented.
- [ ] SLA alert endpoint (`GET /alerts/sla`) is implemented.
- [ ] Escalation assignment (`POST /support/escalations/:id/assign`) is implemented.

## Cross-cutting Quality Gates
- [ ] DTO validation and Swagger docs exist for all new endpoints.
- [ ] Permission checks are wired on all admin/product-owner routes.
- [ ] Tenant isolation tests cover read/write paths for each module.
- [ ] Integration tests cover booking create -> pay -> status -> reschedule -> cancel.
- [ ] Idempotency/retry handling is verified for payment and notification flows.
- [ ] Migration and seed scripts are complete and reversible where required.

## Release Readiness Checklist
- [ ] MVP smoke tests pass for Customer, Salon Admin, Staff, and Product Owner journeys.
- [ ] Monitoring and alerting dashboards are enabled in non-prod and prod.
- [ ] Runbooks exist for booking failures, payment failure, and notification backlog.
- [ ] Feature flags and rollback plan are documented.
- [ ] Known risks and deferred items are logged.

