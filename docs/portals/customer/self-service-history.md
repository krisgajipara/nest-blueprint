# Self-Service & History Module

## Features
- **Appointment History View:** list past appointments with filters (date range, service, staff), status badges (completed, cancelled, no-show), and export-ready entries.
- **Upcoming Appointments Dashboard:** show future bookings with quick reschedule/cancellation actions plus visible policy windows and fees.
- **Self-Service Workflow:** validate availability and policy rules before allowing reschedules/cancellations and send notifications to salon staff.
- **Notification Suite:** trigger confirmations, 24h/1h reminders, reschedule/cancellation acknowledgements, and SMS/email alerts.
- **Secure Access Controls:** ensure customers can only view/modify their own bookings, loyalty tags, or repeated-service hints.

## Flow & Related Modules
- **Self-service flow:** reschedule/cancel requests hit the appointment module, which validates against the slot availability engine and policy library before updating the booking and triggering notifications. Related modules: appointment validator, policy rules module, notification service.
- **History flow:** every appointment update syncs to the customer history store and allows the salon admin/staff portals to surface contextual notes when they are servicing the customer.
- **Notification sync:** reminders and confirmations originate from the notification queue, cross-referencing the customer portal, staff view, and support queue for consistent messaging.

## APIs
- **GET /customers/:customerId/appointments/history:** returns completed/cancelled/no-show bookings with filterable metadata for the history view.
- **GET /customers/:customerId/appointments/upcoming:** lists upcoming bookings with quick actions (reschedule/cancel) and policy summaries.
- **PUT /bookings/:id/reschedule:** shifts an appointment to a new slot after checking availability, buffers, and policy constraints.
- **DELETE /bookings/:id:** cancels a booking with configurable refund/cancellation logic and notifies both salon and customer.
- **GET /bookings/:id/policies:** surfaces cancellation windows, fees, and notice requirements before letting the customer act.
- **GET /notifications?customerId=:customerId:** fetches confirmation/reminder/reschedule notifications to show timeline/error reconciliations.
