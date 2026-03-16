# Daily Agenda Module

## Features
- **Sorted Daily Agenda:** stylists view today/upcoming appointments with statuses (checked-in, servicing, done) on one desk screen.
- **Quick-Status Toggles:** update checked-in, awaiting customer, servicing, or completed states to keep the salon aware in real time.
- **Customer History Snippets:** display past services, notes, and allergies on each card to personalize interactions.
- **Urgent Alerts:** surface waitlist guests, buffer slot notices, and reschedule prompts as soon as they happen.
- **Lightweight Search & Filters:** jump to a booking or customer without navigating away from the desk view.

## Flow & Related Modules
- **Operations flow:** status updates flow into the booking and appointment modules so the calendar, notifications, and customer portals show the current state. Related modules: appointment status service, notification module, booking operations.
- **Waitlist & alerts flow:** when stylists mark guests as ready or complete, the system checks for waitlisted customers (Waitlist Board module) and pushes nudges to those customers via the notification service.

## APIs
- **GET /staff/:staffId/agenda:** returns today/upcoming bookings for a stylist with status badges for the daily agenda.
- **PATCH /bookings/:id/status:** update checked-in, servicing, or completed status from the desk view so calendars and notifications stay in sync.
- **GET /bookings/:id/history:** provides past service notes and allergies for the quick customer context shown on each card.
- **GET /alerts/waitlist:** surfaces urgent waitlist guests that need attention, including estimated wait times.
- **GET /alerts/reschedule-requests:** lists pending reschedule requests routed from the customer portal so stylists can act fast.
