# Waitlist & Communication Module

## Features
- **Waitlist Board Automation:** surfaces customers when slots open due to cancellations/reschedules and shows estimated wait times.
- **Communication Shortcuts:** send SMS/push templates for early arrival requests, delays, or slot releases with one tap.
- **Tip Logging & Commission Signals:** (future) feed tip/commission reminders into payroll-related modules for staff accountability.
- **Reschedule Alerts:** notify staff of customer-driven reschedules from the self-service portal and provide approve/deny actions.
- **Shared Notes & Loyalty Tags:** show reputation markers (advance pay, VIP) across the staff so everyone understands the customer context.

## Flow & Related Modules
- **Slot release flow:** when a booking is cancelled or rescheduled, the module checks the waitlist queue, notifies the next eligible customer, and updates the booking module with the new assignment. Related modules: notification scheduler, booking operations, customer self-service module.
- **Communication flow:** staff-triggered messages leverage the notification service and audit logs to track who sent what; related modules include the notification queue, audit log, and customer history module.

## APIs
- **GET /waitlist:** retrieves customers queued for recently opened slots, including their estimated wait times and loyalty tags.
- **POST /waitlist/:id/notify:** sends slot-release notifications (SMS/push) to the next eligible customer on the waitlist.
- **POST /communications/templates:** manages reusable SMS/push templates for early arrival, delay, or slot-release messages.
- **POST /communications/messages:** triggers staff-driven communications (e.g., “your stylist is ready”) while logging who sent it for audit purposes.
- **GET /customers/:customerId/reputation:** fetches loyalty/reputation markers (advance pay, VIP) so staff can understand context before sending a message.
