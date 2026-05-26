# Module 02 — Authentication

| Field | Value |
| --- | --- |
| **Portal** | All |
| **Phase** | P0 |
| **Status** | ✅ Implemented |
| **Controller** | `src/modules/auth/auth.controller.ts` |
| **Service** | `libs/@anvix/business-core/modules/auth/auth.service.ts` |
| **Deep-dive** | [auth-api-flow-diagram.md](../../auth-api-flow-diagram.md) |

---

## Overview

Login, registration, OTP, password reset, profile. Public routes exempt from tenant guard; **profile and change-password require `x-tenant`** for tenant-scoped user data.

---

## Dependencies

- Module 01 (tenant exists for tenant-scoped login — **open Q2** in BRD)
- `User` entity, `Token`, `Otp`, `ResetPasswordToken`
- `AppJwtService`, `AppMailerService`
- Config: `app.otp.expire_time`, OTP enabled flag

---

## User stories

### US-AUTH-001 — Login

**Acceptance criteria**

- [x] `POST /auth/login` — `@AllowWithoutTenant()`.
- [x] Body: `LoginRequestDto` (email, password, rememberMe).
- [x] If OTP enabled: response `otpRequired: true`, no tokens.
- [x] Else: `AuthResponseDto` with access/refresh JWT + user summary.
- [x] Tokens stored in `token` table.

**Errors:** 401 invalid credentials, 400 validation.

---

### US-AUTH-002 — OTP verify / resend / left-time

**Acceptance criteria**

- [x] `POST /auth/otp-verify` — returns tokens on success.
- [x] `POST /auth/resend-otp`, `POST /auth/otp-left-time`.
- [x] OTP marked used; expired OTP rejected.

---

### US-AUTH-003 — Register

**Acceptance criteria**

- [x] `POST /auth/register` — creates user flow per product rules.
- [x] Conflict if email exists (tenant scope TBD — Q2).

---

### US-AUTH-004 — Forgot / reset password

**Acceptance criteria**

- [x] `POST /auth/forgot-password` — issues reset flow.
- [x] `POST /auth/reset-password` — token validation.

---

### US-AUTH-005 — Profile & change password (tenant required)

**Acceptance criteria**

- [x] `GET /auth/profile` — `JwtAuthGuard` + **tenant header required** (global guard).
- [x] `PUT /auth/change-password` — old password verification.
- [ ] JWT payload should include `tenantId` when multi-tenant login finalized (Q2).

---

## API contract

| Method | Path | Tenant header | Guard | Response DTO |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | No | — | `AuthResponseDto` |
| POST | `/auth/register` | No | — | `{}` |
| POST | `/auth/otp-verify` | No | — | `AuthResponseDto` |
| POST | `/auth/otp-left-time` | No | — | `OtpLeftTimeResponseDto` |
| POST | `/auth/resend-otp` | No | — | `{}` |
| POST | `/auth/forgot-password` | No | — | `{}` |
| POST | `/auth/reset-password` | No | — | `{}` |
| GET | `/auth/profile` | **Yes** | JwtAuthGuard | `UserResponseDto` |
| PUT | `/auth/change-password` | **Yes** | JwtAuthGuard | `{}` |

**Envelope:** `AppResponse<T>` — see auth flow doc.

---

## Database (existing)

| Table | Tenant-scoped | Notes |
| --- | --- | --- |
| `user` | Yes | Login lookup must respect tenant when Q2 decided |
| `token` | Yes | access/refresh per user |
| `otp` | Yes | login/register OTP |
| `reset_password_token` | Yes | |

---

## Implementation tasks (remaining)

| Task | Priority |
| --- | --- |
| Require `x-tenant` on login when email not globally unique | M |
| Include `tenantId` in JWT claims consistently | M |
| Align profile route with `AuthRoleGuard` + tenant match | S |
| Invalidate tokens on role/email change (`AuthRoleGuard` TODO) | S |
| Customer-specific auth vs staff (userType) | C |

---

## Definition of Done

- [x] All endpoints have Swagger + request/response DTOs.
- [ ] E2E: login → OTP → profile with tenant header.
- [ ] Document login tenant requirement in Swagger per route.
