# Role & User Management Module

## Features
- **Role-Based Access Control:** default roles (Super Admin, Sub Admin, Staff/Stylist) plus custom role CRUD to control permissions.
- **User Lifecycle Actions:** list, add, update, activate/deactivate, assign roles, and soft delete staff accounts throughout the tenant.
- **Bulk Staff Operations:** onboard stylist batches with synced metadata (photo, WhatsApp number, specialties) for faster ramp-up.
- **Permission Matrix Management:** ties into role CRUD APIs for create/assign/update actions and handles cache invalidation for consistency.
- **Credential & Policy Enforcement:** reset passwords via OTP, send invite links, and enforce password policies through the auth integration.

## Flow & Related Modules
- **Access flow:** when a new staff member is added, the auth module provisions credentials (with OTP verification), RBAC seeds the allowed feature set, and notifications alert into the communication module. Related modules: auth service, role/permission module, notification scheduler.
- **Role assignment flow:** assigning or removing roles triggers cache invalidation in the role repository and updates staff permissions, which ensures downstream modules (booking desk, service catalog) honor current access levels.
- **Audit flow:** all changes propagate to the audit logging infrastructure and inform the product owner portal (policy + compliance module) when there are owner-level edits.

## APIs
- **POST /roles:** create a new role with a permissions matrix for the salon admin portal.
- **GET /roles:** list roles with pagination/search; used by the role catalog and onboarding flows.
- **GET /roles/:id:** fetch a role with permissions for the detail/permission matrix view.
- **PUT /roles/:id:** update role permissions or metadata when admins change access levels.
- **DELETE /roles/:id:** soft delete a role while ensuring system roles can never be removed.
- **GET /roles/dropdown:** provide role dropdown data (with SUPER_ADMIN only visible to super-admins) for assignment controls.
- **POST /roles/users/assign-role:** batch-assign roles to multiple users from the modal.
- **DELETE /users/:userId/role:** remove a role assignment from a staff user.
- **GET /users/:userId/role:** retrieve current role data to populate the edit UI.
- **GET /users:** power the staff list view with pagination, filters, and search metadata.
- **POST /users:** onboard a new staff member (stylist, admin, etc.) with profile metadata.
- **PUT /users/:id:** update user details (contact info, phone, specialty) or change status.
- **DELETE /users/:id:** soft delete a staff account when they leave the salon.
- **GET /users/dropdown:** drive autocomplete/select controls across booking or service assignment screens.
