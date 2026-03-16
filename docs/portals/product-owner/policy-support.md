# Policy & Support Module

## Features
- **Regional Policy Library:** stores cancellation windows, buffer minutes, slot duration limits, notice requirements, and loyalty templates per region/state.
- **Versioned Policy Templates & Overrides:** lets the product owner publish standard templates while allowing salon-specific customizations and rollback tracks.
- **Support & Triage Queue:** centralizes salon/customer escalations, enriches them with severity tags, and enforces SLA reminders for faster resolution.
- **Admin Credential Controls:** resend tenant admin credentials, revoke access, or mark tenants inactive directly from the module.
- **Compliance Audit Surface:** logs policy edits, document approvals, and support handoffs for traceability.

## Flow & Related Modules
- **Policy management flow:** updates to policy templates sync to the booking engine, notification service, and staff/customer portals so the same rules govern slot validation, reminders, and self-service actions. Related modules: policy library, booking/slot validator, notification scheduler.
- **Escalation flow:** issues raised in salon or customer portals land in the support queue, where product owner agents can assign them to operations or engineering owners; the flow touches the notification module, document store, and tenant operations dashboard.
- **Credential flow:** resend admin credentials ties into the user management module (Auth + RBAC) and triggers an audit entry plus notification to the assigned admin account.

## APIs
- **GET /policies:** lists cancellation windows, buffer rules, slot duration limits, and loyalty templates so the policy library can be edited or previewed.
- **POST /policies:** creates a new policy bundle or template that salons can opt into for their booking rules.
- **PUT /policies/:id:** updates an existing policy with version tracking and tenant override markers for rollbacks.
- **GET /support/escalations:** fetches escalations with severity tags and SLA reminders so the triage team can prioritize manually submitted issues.
- **POST /support/escalations:** creates a new escalation from the support queue, capturing tenant context, documents, and compliance history.
- **POST /support/credentials/resend:** resends tenant admin credentials (login link/OTP) and logs the audit entry for compliance visibility.
