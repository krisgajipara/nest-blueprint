# Implementation Baseline (Anvix Backend)

**Last verified:** 2026-05-20  
**Purpose:** Single snapshot for agents updating BRD/user-stories. Re-verify with repo before marking docs ✅.

---

## Controllers (`src/modules/`)

| Module | Controller path | Tenant header | Guard pattern |
| --- | --- | --- | --- |
| Health | `app.controller.ts` | No (`@AllowWithoutTenant`) | None |
| Tenant | `tenant/tenant.controller.ts` | No (`@TenantApi`) | `RoleGuard` on protected routes |
| Auth | `auth/auth.controller.ts` | Public routes exempt; profile/password **Yes** | `JwtAuthGuard` on protected |
| Users | `user/user.controller.ts` | **Yes** | `JwtAuthGuard` (class-level) |
| Roles | `role/role.controller.ts` | **Yes** | `RoleGuard` (class-level) |
| Profiler | `profiler/profiling.controller.ts` | No (`@AllowWithoutTenant`) | None |

---

## Shipped API endpoints

### Tenant (`@TenantApi` — no `x-tenant`)

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/tenants/by-subdomain` | No |
| GET | `/tenants` | Bearer + TENANT:READ |
| GET | `/tenants/dropdown` | Bearer + TENANT:READ |
| GET | `/tenants/:id` | Bearer + TENANT:READ |
| POST | `/tenants` | Bearer + TENANT:WRITE |
| PUT | `/tenants/:id` | Bearer + TENANT:EDIT |
| PUT | `/tenants/:id/activate` | Bearer + TENANT:EDIT |
| PUT | `/tenants/:id/deactivate` | Bearer + TENANT:EDIT |

### Auth

| Method | Path | Tenant header |
| --- | --- | --- |
| POST | `/auth/login` | No |
| POST | `/auth/register` | No |
| POST | `/auth/otp-verify` | No |
| POST | `/auth/otp-left-time` | No |
| POST | `/auth/resend-otp` | No |
| POST | `/auth/forgot-password` | No |
| POST | `/auth/reset-password` | No |
| GET | `/auth/profile` | **Yes** |
| PUT | `/auth/change-password` | **Yes** |

### Users (tenant required)

| Method | Path |
| --- | --- |
| GET | `/users` |
| GET | `/users/dropdown` |
| GET | `/users/:id` |
| POST | `/users` |
| PUT | `/users/:id` |
| DELETE | `/users/:id` |

### Roles (tenant required)

| Method | Path |
| --- | --- |
| POST | `/roles/roles` |
| GET | `/roles/roles` |
| GET | `/roles/roles/:id` |
| PUT | `/roles/roles/:id` |
| DELETE | `/roles/roles/:id` |
| GET | `/roles/dropdown` |
| POST | `/roles/users/assign-role` |
| DELETE | `/roles/users/:userId/role` |
| GET | `/roles/users/:userId/role` |
| GET | `/roles/permissions/default` |

### Profiler (no tenant)

| Method | Path |
| --- | --- |
| GET | `/profiler`, `/profiler/summary`, `/profiler/slow`, `/profiler/errors` |
| POST | `/profiler/clear` |
| GET | `/profiler-ui`, `/profiler-ui/script.js` |

---

## Platform mechanics (shipped)

| Component | Location |
| --- | --- |
| `TenantContextMiddleware` | `libs/@anvix/server-core/middleware/tenant-context.middleware.ts` |
| `TenantGuard` (global `APP_GUARD`) | `libs/@anvix/server-core/custom-guards/tenant.guard.ts` |
| `@TenantApi()` / `@AllowWithoutTenant()` | `libs/@anvix/server-core/custom-decorators/allow-without-tenant.decorator.ts` |
| `TenantAwareRepository` | `libs/@anvix/server-core/database/repositories/tenant-aware.repository.ts` |

---

## Database entities (shipped)

| Entity | Table | `tenant_id` |
| --- | --- | --- |
| `Tenant` | `tenant` | No (system) |
| `User` | `user` | Yes |
| `Role` | `role` | Yes |
| `Token` | `token` | Yes |
| `Otp` | `otp` | Yes |
| `ResetPasswordToken` | `reset_password_token` | Yes |

---

## Document map (requirements pack)

| Path | Content |
| --- | --- |
| `docs/requirements/BRD-Salon-Booking-Platform.md` | Full BRD |
| `docs/requirements/user-stories/00-13*.md` | Per-module dev specs |
| `docs/requirements/user-stories/README.md` | Index + order |
| `docs/draft/Implementation TODO.md` | Sprint checklist |
| `docs/auth-api-flow-diagram.md` | Auth frontend contract |

---

## Planned modules (not in codebase — spec only)

| ID | Module | Key routes (planned) |
| --- | --- | --- |
| 04 | Service & availability | `/services`, `/slots/config`, `/staff/:id/availability` |
| 05 | Booking | `/bookings`, reschedule, cancel, notes, waitlist |
| 06 | Payments & notifications | `/bookings/:id/pay`, `/notifications/bookings` |
| 07 | Customer discovery | `/tenants/nearby`, `/customers/profile` |
| 08 | Self-service | appointments history/upcoming, policies |
| 09–10 | Staff | agenda, PATCH status, waitlist, communications |
| 11–13 | Product Owner | onboarding docs, `/policies`, `/dashboards/*` |

User-story files: `docs/requirements/user-stories/04-*.md` through `13-*.md`.

---

## Known gaps (doc as 🟡, not ✅)

- Tenant isolation e2e tests for `users` / `roles`
- `@RequirePermissions` on all user endpoints (users use JWT only today)
- Login tenant scoping (BRD Q2) — email uniqueness per tenant vs global
- `AuthRoleGuard` vs `RoleGuard` standardization for tenant-token match
- Tenant onboarding wizard, documents, bootstrap seed (Module 11)
- All booking-domain tables and APIs (Modules 04–10)

---

## How to refresh this file

After shipping a module:

1. Add controller row and API table section.
2. List new entities/migrations.
3. Update planned table (remove shipped routes).
4. Set corresponding `user-stories/NN-*.md` status to ✅ or 🟡.
5. Tick `Implementation TODO.md` items.
