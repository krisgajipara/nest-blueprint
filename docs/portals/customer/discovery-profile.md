# Discovery & Profile Module

## Features
- **Location-Based Discovery:** finds salons within a default 3 km radius with filters for service type (haircut, beard, spa, massage) and preferred stylist.
- **Rich Salon Cards:** display name, images, descriptions, distance, operating hours, and availability tags for quick scanning.
- **Quick Booking Access:** allow returning customers to reuse last services/stylists and book on behalf of friends or family.
- **Profile Management:** edit name, phone, email, WhatsApp, and loyalty/reputation markers with OTP verification for policy compliance.
- **Channel-Agnostic Intake:** unify bookings from app, web, WhatsApp, or walk-ins into the same booking object for consistency.

## Flow & Related Modules
- **Discovery flow:** location and filters hit the search/catalog service that reads from the service catalog and availability modules, then routes the user into the booking module. Related modules: service catalog, availability engine, booking operations.
- **Profile flow:** profile changes go through the auth/user module (JWT/OAuth, OTP verification) and update customer records in the appointment/customer tables for future references and loyalty tracking.

## APIs
- **GET /tenants/nearby** (or `/salons`): returns salons within the requested radius along with distance, category filters, and current availability tags.
- **GET /services/catalog:** provides serviced-based filters, categories, durations, and pricing for the discovery page.
- **GET /services/:id:** fetches service details (description, images, staff assignments) when a customer digs deeper before booking.
- **GET /customers/profile:** retrieves the logged-in customer’s profile, loyalty markers, and preferred contact channels.
- **PUT /customers/profile:** updates profile data (name, phone, WhatsApp) after OTP verification to keep contact info current.
- **POST /customers/verify:** issues an OTP and confirms the phone/email to guard profile edits and loyalty data.
