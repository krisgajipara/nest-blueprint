# Booking & Payment Module

## Features
- **Real-Time Slot Lookup:** checks stylist availability, buffers, working hours, and uses optimistic locking to prevent double bookings within two-second updates.
- **Service & Pricing Selection:** lets customers pick services, dynamic price breakdowns (service charges, taxes, convenience fee), and assign staff with slotted start times.
- **Unified Booking Intake:** handles app/web/WhatsApp/walk-ins through a single flow that issues reference IDs and automated status transitions (pending → confirmed).
- **Online Payment Integration:** emits booking confirmations, settles transactions, and notifies customers and salons once payment succeeds.
- **OTP/Notification Confirmations:** sends immediate references, reminders, and status updates (arrival, delay, issue escalation) via OTP-driven flows.

## Flow & Related Modules
- **Booking flow:** slot selection calls the availability engine, creates an appointment, and triggers notifications to both the customer portal and salon admin/Staff views. Related modules: appointment management, notification scheduler, slot validator.
- **Payment flow:** once booking is confirmed, payment gateway integration updates appointment status, logs transactions in the settlement ledger, and feeds the partner dashboard for earnings snapshots.
- **Conflict flow:** if conflicts arise (double booking, staff unavailability), the booking module consults the availability configuration and notifies the customer with alternate slots before logging the incident for analytics.

## APIs
- **POST /bookings:** create a new booking with service selection, staff preference, date/time, pricing breakdown, buffers, and conflict validation.
- **GET /bookings/:id:** retrieve booking details, current status, reference number, and QR/push tokens used for check-in.
- **POST /bookings/:id/pay:** record payment success (card/UPI) and transition the booking to confirmed, triggering notifications.
- **POST /bookings/:id/otp-verify:** verify OTP-based confirmations or arrival codes so stylists know the customer is verified.
- **POST /notifications/bookings:** send confirmation, reminder, delay, or issue alerts tied to a booking reference.
- **GET /bookings/reference/:referenceId:** allow customers to reopen a booking via link or shared reference for quick edits.
