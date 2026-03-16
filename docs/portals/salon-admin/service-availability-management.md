# Service & Availability Management Module

## Features
- **Service Catalog Builder:** create services with parent-child categories, pricing, HTML descriptions, images, duration, completion time, and assigned stylists.
- **Slot & Working Hours Configuration:** define slot duration, buffer before/after, availability windows, overrides, per-day hours, break slots, dynamic days off, and maintenance closures.
- **Staff Assignment & Availability:** attach staff to services and manage staff-specific availability plus leave/exceptions within salon hours.
- **Master Category Templates:** enable/disable tenant-level categories/services, set base prices, and configure add-ons from reusable templates.
- **Validation Rules:** lock slot duration once bookings exist and prevent inactive services from being booked.

## Flow & Related Modules
- **Operational configuration flow:** updates flow from the admin console to the salon settings API, which writes to the configuration store and updates the availability engine that both the booking desk and customer portal read for slot suggestion. Related modules: slot availability engine, configuration service, appointment validator.
- **Staff availability flow:** when staff schedules or leaves change, the staff module writes to staff_availability tables, causing booking/rescheduling modules and notifications to re-evaluate real-time slots.
- **Service sync flow:** enabling/disabling services notifies the discovery/search index and informs the customer app and booking desk so only allowed services show up.

## APIs
- **GET /services/catalog:** returns master category/service list, pricing, descriptions, and assigned stylists so the catalog builder UI can render current offerings.
- **POST /services:** create a new service (category, duration, price, description, employees) within the tenant’s context.
- **PUT /services/:id:** update service metadata, images, staffing, or activation status when the salon tweaks offerings.
- **PUT /services/:id/activate & /services/:id/deactivate:** toggle service availability without deleting it, keeping history for reporting.
- **GET /slots/config:** fetch current slot settings (slot duration, buffers, overrides, dynamic days off) for the booking calendar.
- **PUT /slots/config:** adjust slot duration, buffer before/after, working hours, or override flag for the calendar engine.
- **POST /staff/:staffId/availability:** record staff-specific working hours, breaks, and leave exceptions while enforcing salon-hour constraints.
- **GET /staff/:staffId/availability:** feed staff roster views and conflict checks before booking/rescheduling decisions.
