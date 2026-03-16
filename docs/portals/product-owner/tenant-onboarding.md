# Tenant Onboarding Module

## Features
- **Guided Tenant Onboarding Wizard:** captures salon/business profile data, package selection, contracts, and routing for GST/PAN uploads within a structured flow.
- **Document Collection & Verification:** stores registration certificates, owner IDs, GST documents, and bank proofs while tracking statuses and sending reminders.
- **Tenant Metadata Capture:** records timezone, currency, branding (logo/primary color), address, and subdomain info to provision isolated tenant environments.
- **Role Bootstrap Templates:** seeds owner/admin/staff placeholders plus initial service catalogs and staff templates so salons start with a ready workspace.
- **Compliance Gating & Manual Review Notifications:** enforces approval workflows and alerts the product-owner support queue when human intervention is required.

## Flow & Related Modules
- **Tenant onboarding flow:** landing page → registration form → document upload → admin verification → tenant record creation → RBAC seeds, tenant config, and package billing entries. Related modules: tenant management service, document store, billing/plan module, RBAC setup.
- **Health handshake:** once onboarding completes, the tenant is reported to the health dashboard module, triggering monitoring jobs that cross-reference onboarding metadata with active bookings and SLA scoring.
- **Policy propagation:** onboarding flow also selects the appropriate cancellation and buffer policies, which are stored in the policy library and forwarded to the booking engine and notification service for consistent enforcement.

## APIs
- **GET /tenants/by-subdomain:** resolves tenant branding and configuration (logo, colors, subdomain) so the new tenant experience can pre-fill branding before login.
- **GET /tenants:** returns paginated tenant lists with filters (status, name) for product owner dashboards and onboarding oversight.
- **GET /tenants/:id:** retrieves detailed tenant metadata for editing or compliance review.
- **POST /tenants:** creates a tenant record, seeds owner/admin/staff roles, and stores uploaded logos/documents required for onboarding.
- **PUT /tenants/:id:** updates salon profile data, timezone, branding, and billing package details once the tenant owner modifies settings.
- **PUT /tenants/:id/deactivate:** marks the tenant inactive when onboarding fails compliance checks or the salon is temporarily paused.
- **PUT /tenants/:id/activate:** reactivates a tenant after compliance issues are resolved so onboarding can continue without clock reset.
