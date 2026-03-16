# Booking Operations Module

## Features
- **Booking List & Calendars:** day/week/month views with resource/stylist filters and clear statuses (confirmed, pending, cancelled, completed).
- **Manual Booking Creation:** handle new/existing customers with slot recommendations, contact info capture, service/stylist selection, and detailed pricing breakdown (service + taxes + convenience fee).
- **Waitlist & Conflict Management:** manage waitlisted guests, reschedule/cancel flows, and enforce buffer/conflict validation to avoid double bookings.
- **Notifications:** trigger reminders, early arrival requests, delay alerts, confirmations, and automated cancellation/reschedule updates.
- **Contextual Notes:** display internal notes and customer history during booking edits so stylists can reference past services quickly.

## Flow & Related Modules
- **Booking lifecycle flow:** booking desk interacts with the availability engine and appointment tables; creation/rescheduling updates statuses, triggers notifications, and emits events to the staff and customer portals. Related modules: appointment service, notification queue, staff view module, customer self-service module.
- **Calendar sync:** changes in appointments push to the staff calendar and customer portal, ensuring real-time slot availability; the product owner health dashboard also ingests these events for KPI aggregation.
- **Manual intervention flow:** when conflicts arise, the booking desk consults service/availability configuration, updates statuses, and logs actions through the audit/logger modules.

## APIs
- **GET /bookings:** list bookings with filters (status, staff, date, customer) for the calendar and list views.
- **POST /bookings:** create a new appointment (new/existing customer) with slot suggestion, pricing, services, and stylist assignment.
- **GET /bookings/:id:** fetch booking details, internal notes, and historical status changes for editing or dispute resolution.
- **PUT /bookings/:id/reschedule:** move a booking to a new slot after conflict validation and buffer enforcement.
- **DELETE /bookings/:id:** cancel a booking while triggering waitlist processing and notifications.
- **POST /bookings/:id/waitlist:** add a customer to the waitlist to be notified when a slot opens (used after cancellations).
- **POST /bookings/:id/notes:** append internal notes or customer history insights before saving to the appointment record.
- **POST /bookings/:id/notifications:** fire reminders, early arrival requests, or delay notices tied to the booking.
