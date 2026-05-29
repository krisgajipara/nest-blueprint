# Auth module — API flow diagram (full)

**Controller:** `src/modules/auth/auth.controller.ts`  
**Service:** `libs/@anvix/business-core/modules/auth/auth.service.ts`

---

## Frontend handoff (automation & UI)

Use this section to wire screens, API clients, and codegen. The ASCII flows below add edge cases; this section is the **contract** and **sequence** frontend needs first.

### How to use this doc

- **Product / UI:** Follow the [Screen → API journey](#screen--api-journey-register-login-otp-password-profile) table, then deep-link into §1 for error branches.
- **OpenAPI / Swagger:** Cross-check path + verb + DTO fields; this doc names the same DTO classes as `libs/@anvix/business-core/modules/auth/dto/`.
- **Automation (scripts, LLM):** Copy the [Endpoint index (JSON)](#endpoint-index-json) block into a ticket or tool context so calls are generated in the right order (e.g. register → OTP verify before expecting JWT).

### HTTP basics

| Item | Value |
|------|--------|
| Base URL | `https://<host>` (no trailing slash) |
| API prefix | `v1` → paths are **`/v1/auth/...`** |
| Content-Type | `application/json` on requests with a body |

### Headers

| Header | When | Notes |
|--------|------|--------|
| *(none)* | Public routes: login, register, OTP, forgot/reset | Still send tenant header if the app resolves tenant before auth (see below). |
| `Authorization: Bearer <accessToken>` | `PUT /v1/auth/change-password`, `GET /v1/auth/profile` | Use token from `AuthResponseDto` after successful login or OTP verify. |
| `x-tenant` **or** `x-tenant-id` | Whenever the product uses multi-tenant data | UUID of tenant; optional on public routes but required for consistent tenant-scoped user lookup. See `libs/@anvix/documents/TENANT_GUIDE.md`. |
| `language_code` | Optional | May appear on `request` for i18n of `message` (body/query/headers per backend conventions). |

### Success response shape (`AppResponse`)

Successful responses are JSON objects shaped like:

```json
{
  "message": "<translated or constant success message>",
  "data": { }
}
```

- **`data`** is the payload: `AuthResponseDto`, `UserResponseDto`, `OtpLeftTimeResponseDto`, or `{}` when the API returns no entity (e.g. register success).
- **`message`** is processed by `ReqResInterceptor` (translation); do not rely on English literals in production UI—use for display or logging as your i18n strategy allows.
- **`parameters`** may be present internally but are stripped on the wire after translation.

**`AuthResponseDto` (login / OTP verify when tokens are issued):**

```json
{
  "otpRequired": false,
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "id": "<uuid>",
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "userType": null
  }
}
```

When OTP is required at login, **`otpRequired`: true** and **`accessToken` / `refreshToken` / `user` are omitted** until `POST /v1/auth/otp-verify` succeeds.

### Error response shape (global exception filter)

Errors return HTTP 4xx/5xx with a body like:

```json
{
  "message": "<primary key or translated display string>",
  "developerErrors": [ ]
}
```

- Bind UI to **`message`** for a single toast or banner when you do not need field-level detail.
- Inspect **`developerErrors`** for validation breakdowns when the filter populates them.
- **401** on protected routes: clear tokens and send the user to login.

### `OtpType` (request body)

Backend enum is **numeric** in JSON:

| Name | Value | Typical flow |
|------|------|----------------|
| `REGISTER` | `1` | After `POST /v1/auth/register` |
| `LOGIN` | `2` | After `POST /v1/auth/login` when `otpRequired` is true |
| `FORGOT_PASSWORD` | `3` | After `POST /v1/auth/forgot-password` |

Example: `{ "email": "a@b.com", "otp": "123456", "otpType": 1 }`

### Config-driven behavior (environment)

| Flag / setting | Frontend impact |
|----------------|-----------------|
| `app.otp.enabled` | **Login only:** if `false`, login returns tokens immediately; if `true`, login returns `otpRequired: true` and user must call `otp-verify` with `otpType: 2`. |
| *(register)* | **Registration always sends OTP** in current backend (independent of `app.otp.enabled`). After register, always guide user to OTP with `otpType: 1` until product changes. |

### Screen → API journey (register, login, OTP, password, profile)

| Screen / step | User action | HTTP | Auth | Persist on client | Next step |
|---------------|-------------|------|------|-------------------|-----------|
| Register | Submit form | `POST /v1/auth/register` | No | Email (and tenant id if applicable) | Show “check email”; go to OTP entry |
| Register OTP | Submit code | `POST /v1/auth/otp-verify` body `otpType: 1` | No | **Save** `accessToken`, `refreshToken`, `user` on success | App shell / dashboard |
| Login | Submit email + password + **rememberMe** (required boolean) | `POST /v1/auth/login` | No | If `otpRequired`: save email + flag; else save tokens | OTP screen **or** home |
| Login OTP | Submit code | `POST /v1/auth/otp-verify` body `otpType: 2` | No | Save tokens + user | Home |
| OTP timer | (optional) | `POST /v1/auth/otp-left-time` | No | — | Show countdown |
| Resend OTP | Tap resend | `POST /v1/auth/resend-otp` | No | — | Stay on OTP screen |
| Forgot | Submit email + platform | `POST /v1/auth/forgot-password` | No | Email | OTP screen with `otpType: 3` (then align with backend for reset—see §1.5) |
| Reset password | Submit new password | `POST /v1/auth/reset-password` | No | Email | Login (confirm security flow with backend) |
| Change password | Submit old + new | `PUT /v1/auth/change-password` | Bearer | — | Success toast |
| Profile | Load app shell | `GET /v1/auth/profile` | Bearer | Cache `UserResponseDto` if useful | — |

### Suggested client session shape (TypeScript)

```typescript
/** Minimal auth wizard state — extend per framework store */
interface AuthFlowContext {
  tenantId?: string;       // mirror x-tenant header
  email?: string;          // for OTP steps
  pendingOtpType?: 1 | 2 | 3;
  accessToken?: string;
  refreshToken?: string;
  rememberMe?: boolean;    // only needed until login completes
}
```

### Endpoint index (JSON)

Paste into codegen or an LLM system prompt so calls stay ordered and authenticated correctly.

```json
[
  { "method": "POST", "path": "/v1/auth/register", "auth": false, "body": "RegisterRequestDto" },
  { "method": "POST", "path": "/v1/auth/login", "auth": false, "body": "LoginRequestDto (email, password, rememberMe boolean)" },
  { "method": "POST", "path": "/v1/auth/otp-verify", "auth": false, "body": "email, otp, otpType (1|2|3)" },
  { "method": "POST", "path": "/v1/auth/otp-left-time", "auth": false, "body": "email, otpType" },
  { "method": "POST", "path": "/v1/auth/resend-otp", "auth": false, "body": "email, otpType" },
  { "method": "POST", "path": "/v1/auth/forgot-password", "auth": false, "body": "email, platform" },
  { "method": "POST", "path": "/v1/auth/reset-password", "auth": false, "body": "email, newPassword" },
  { "method": "PUT", "path": "/v1/auth/change-password", "auth": "Bearer", "body": "oldPassword, newPassword" },
  { "method": "GET", "path": "/v1/auth/profile", "auth": "Bearer", "body": null }
]
```

### Auth errors to handle in UI (common `message` keys)

| Key | Typical HTTP | Suggested UI |
|-----|----------------|--------------|
| `ERR_EMAIL_NOT_FOUND` | 401 / 404 | “No account” / generic per security policy |
| `ERR_INVALID_CREDENTIALS` | 401 | “Email or password incorrect” |
| `ERR_ACCOUNT_INACTIVE` | 406 | “Account inactive—contact support” |
| `ERR_EMAIL_EXISTS` | 409 | “Email already registered” |
| `ERR_OTP_NOT_FOUND` | 404 | “Request a new code” |
| `ERR_OTP_INVALID` | 404 | “Invalid code” |
| `ERR_OTP_EXPIRED` | 404 | “Code expired—resend” |
| `ERR_CURRENT_PASSWORD_INCORRECT` | 406 | Inline on change-password form |

---

## What changed in this document (vs the older long version)

| Aspect | Older committed version (~478 lines) | Condensed “skill” version (~249 lines) | This version |
|--------|--------------------------------------|----------------------------------------|--------------|
| **Paths** | `/auth/...` (no global prefix) | `/v1/auth/...` | `/v1/auth/...` (matches `main.ts`) |
| **Diagrams** | Large ASCII trees + inline JSON bodies | Shorter trees, fewer steps | **Restored** deep trees + **accurate** DTO fields from code |
| **Feature mapping** | Per-feature bullets (UI, state, validation) | Single compact table | **Restored** detailed mapping + table |
| **Integration phases** | Long numbered narrative | Short table | **Restored** narrative + table |
| **Error handling** | Separate ASCII flows + long error key lists | Short bullet list | **Restored** expanded handling + keys |
| **Technical section** | JWT, OTP, DB, security bullets | Omitted | **Restored** (aligned to current code where possible) |

The condensed edit removed a lot of **frontend-oriented** detail (copy-paste templates, user-facing strings, step-by-step OTP branches). That was done to match the `api-flow-diagram-prompt` section headers in fewer lines—not because the old content was wrong. This file brings the depth back and keeps **`/v1`** and **DTO accuracy**.

---

## 1. Complete API flow visualization

### 1.1 Registration

```
┌──────────────────────────┐
│   USER REGISTRATION      │
│   POST /v1/auth/register │
└────────────┬─────────────┘
             │ User submits registration form
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ POST /v1/auth/register                                          │
│ Body (RegisterRequestDto) — see DTO in codebase for full rules: │
│ {                                                               │
│   "firstName": "John",                                          │
│   "lastName": "Doe",                                           │
│   "email": "john.doe@example.com",                             │
│   "password": "securePassword",  // min length per constant    │
│   "phoneNumber": "+1234567890",  // optional                   │
│   "dateOfBirth": "1990-01-01",                                 │
│   "age": "30",                                                 │
│   "userType": <UserTypeEnum optional, default USER>            │
│ }                                                               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─► Validation fails → 400 BAD_REQUEST (custom validators / field errors)
             │
             ├─► Email already registered → 409 CONFLICT
             │
             └─► Success → 201 CREATED
                     └─► User created (PENDING_VERIFICATION)
                         └─► OTP (REGISTER) always generated + emailed in current backend
                         └─► `data` is `{}` — use `message` for “check your email” copy
                         └─► UI: OTP screen with `otpType: 1`
```

### 1.2 Login (branch: OTP off vs on)

`AuthService.loginUser` uses `app.otp.enabled` from config.

```
┌──────────────────────────┐
│     USER LOGIN           │
│  POST /v1/auth/login     │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│ POST /v1/auth/login                          │
│ { "email", "password", "rememberMe": bool }  │
│ LoginRequestDto (rememberMe required)        │
└────────────┬─────────────────────────────────┘
             │
             ├─► User not found → 401 { message: ERR_EMAIL_NOT_FOUND }
             │
             ├─► Password invalid → 401 { message: ERR_INVALID_CREDENTIALS }
             │
             ├─► User status not ACTIVE → 406 { message: ERR_ACCOUNT_INACTIVE }
             │
             └─► Credentials OK
                     ├─► OTP disabled
                     │       └─► Issue JWT access + refresh, store tokens
                     │           └─► 200 AuthResponseDto (tokens + user, otpRequired: false)
                     │
                     └─► OTP enabled
                             └─► Create LOGIN OTP, email user
                                 └─► 200 message + AuthResponseDto { otpRequired: true } (no tokens yet)
```

### 1.3 OTP verification

```
┌──────────────────────────┐
│   OTP VERIFICATION       │
│ POST /v1/auth/otp-verify │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│ POST /v1/auth/otp-verify                     │
│ OtpVerifyRequestDto:                         │
│ {                                            │
│   "email": "user@example.com",               │
│   "otp": "123456",                           │
│   "otpType": <OtpType REGISTER | LOGIN | …>  │
│ }                                            │
└────────────┬─────────────────────────────────┘
             │
             ├─► User / OTP missing or invalid → 400 / 404 (per service)
             │
             └─► OTP valid and not expired
                     └─► Mark OTP used
                         ├─► otpType === REGISTER
                         │       └─► If PENDING_VERIFICATION → set ACTIVE
                         │       └─► Issue tokens, store, return AuthResponseDto
                         │
                         ├─► otpType === LOGIN
                         │       └─► Issue tokens, store, return AuthResponseDto
                         │
                         └─► Other types → success payload per service
```

**Supporting calls**

- `POST /v1/auth/otp-left-time` — remaining seconds (requires user + pending OTP for type).
- `POST /v1/auth/resend-otp` — new OTP emailed (`ResendOtpRequestDto`: email + otpType).

### 1.4 Forgot password (OTP via email)

```
POST /v1/auth/forgot-password
ForgotPasswordRequestDto: { "email", "platform": "front" | "admin" | … }

├─► User not found → 404 ERR_EMAIL_NOT_FOUND
├─► User inactive → 406 ERR_ACCOUNT_INACTIVE
└─► OK → create FORGOT_PASSWORD OTP, email code → 200
```

### 1.5 Reset password

**Code note:** `AuthService.resetPassword` today loads the user by **email**, checks **ACTIVE**, then **`updateUserPassword`** — it does **not** verify an OTP or reset token inside this method. The **method comment** in code says “reset token”; the **DTO** is `email` + `newPassword` only. Frontend/backend should align on whether OTP verification must happen **before** this call; until then, treat this as **implementation detail** and confirm with security review.

```
POST /v1/auth/reset-password
ResetPasswordRequestDto: { "email", "newPassword" }

├─► User not found → 404
├─► Inactive → 406 ERR_ACCOUNT_INACTIVE
└─► OK → password updated → 200
```

### 1.6 Change password (authenticated)

```
PUT /v1/auth/change-password
JwtAuthGuard + body: ChangePasswordRequestDto (oldPassword, newPassword)

├─► 401 if not authenticated
├─► Old password wrong → 406 ERR_CURRENT_PASSWORD_INCORRECT
└─► OK → 200
```

### 1.7 Profile

```
GET /v1/auth/profile
JwtAuthGuard + ApiBearerAuth

└─► 200 UserResponseDto (built in controller today — see code-review TODO for thin-controller consistency)
```

---

## 2. Feature-to-API mapping

### 2.1 Registration

| Concern | Detail |
|--------|--------|
| **API** | `POST /v1/auth/register` |
| **UI** | Registration form, validation feedback, optional OTP step |
| **State** | Form model → `RegisterRequestDto`; after success, email pending / redirect |
| **Validation** | Custom validators on DTO; Swagger mirrors `RegisterRequestDto` |

### 2.2 Login

| Concern | Detail |
|--------|--------|
| **API** | `POST /v1/auth/login` |
| **UI** | Email/password, remember-me, conditional OTP screen |
| **State** | Tokens in secure storage **or** `otpRequired` + email for next step |
| **Validation** | `LoginRequestDto` |

### 2.3 OTP verify / timer / resend

| Concern | Detail |
|--------|--------|
| **API** | `POST /v1/auth/otp-verify`, `otp-left-time`, `resend-otp` |
| **UI** | OTP input, countdown, resend cooldown |
| **State** | Email + `OtpType` carried from login/register/forgot flow |
| **Validation** | `OtpVerifyRequestDto`, `OtpLeftTimeRequestDto`, `ResendOtpRequestDto` |

### 2.4 Forgot / reset password

| Concern | Detail |
|--------|--------|
| **API** | `POST /v1/auth/forgot-password`, `POST /v1/auth/reset-password` |
| **UI** | Forgot form (email + platform); reset form (email + new password — align with real security flow) |
| **State** | Track whether OTP was verified client-side if you add that step |
| **Validation** | `ForgotPasswordRequestDto`, `ResetPasswordRequestDto` |

### 2.5 Session

| Concern | Detail |
|--------|--------|
| **API** | `PUT /v1/auth/change-password`, `GET /v1/auth/profile` |
| **UI** | Security settings, profile header |
| **State** | Bearer token on every request |
| **Validation** | `ChangePasswordRequestDto`; profile uses `@GetUser()` |

### 2.6 Summary table

| Feature | Method | Path |
|--------|--------|------|
| Register | POST | `/v1/auth/register` |
| Login | POST | `/v1/auth/login` |
| OTP verify | POST | `/v1/auth/otp-verify` |
| OTP time left | POST | `/v1/auth/otp-left-time` |
| Resend OTP | POST | `/v1/auth/resend-otp` |
| Forgot password | POST | `/v1/auth/forgot-password` |
| Reset password | POST | `/v1/auth/reset-password` |
| Change password | PUT | `/v1/auth/change-password` |
| Profile | GET | `/v1/auth/profile` |

---

## 3. API integration priority

### Phase 1 — Core (must-have)

1. **`POST /v1/auth/register`** — onboarding; often pairs with OTP verify.
2. **`POST /v1/auth/login`** — session entry; handle **both** OTP and non-OTP outcomes.
3. **`POST /v1/auth/otp-verify`** — completes login/register when OTP enabled.
4. **`GET /v1/auth/profile`** — post-login shell (optional on day one if another user endpoint exists).

### Phase 2 — Should-have

5. **`POST /v1/auth/otp-left-time`** / **`POST /v1/auth/resend-otp`** — OTP UX.
6. **`PUT /v1/auth/change-password`** — authenticated security.

### Phase 3 — Nice-to-have / polish

7. **`POST /v1/auth/forgot-password`** + **`POST /v1/auth/reset-password`** — recovery; align **reset** with OTP/token policy before production.

**Dependencies:** mailer for OTP; `app.otp.enabled` and `app.otp.expire_time` in config; JWT storage and refresh strategy on the client.

---

## 4. Templates for future API additions

### 4.1 ASCII diagram template

```
┌──────────────────────────┐
│   [FEATURE NAME]         │
│   [METHOD /v1/auth/...]  │
└────────────┬─────────────┘
             │ [User action]
             ▼
┌──────────────────────────────────────────────┐
│ [METHOD] /v1/auth/<path>                     │
│ { "field": "..." }                           │
└────────────┬─────────────────────────────────┘
             ├─► Success → [next UI]
             └─► Error → [message key / status]
```

### 4.2 Feature mapping template

- **API:** `METHOD /v1/auth/...`
- **UI components:** …
- **State:** …
- **Validation:** `XxxRequestDto`
- **Response handling:** …

### 4.3 Changelog

| Version | Date | Change |
|---------|------|--------|
| 2.0 | — | Restored full narrative; paths `/v1`; DTOs from code |
| 1.x | — | Historical long doc under `/auth/...` |

---

## 5. Error handling

### 5.1 Network

```
UI action → API request
    ├─► Network error → retry / offline message
    └─► Timeout → retry; avoid duplicate OTP sends if not idempotent
```

### 5.2 Auth errors (examples from service)

See also the **Frontend handoff** table [Auth errors to handle in UI](#auth-errors-to-handle-in-ui-common-message-keys).

| Condition | Typical key / status |
|-----------|---------------------|
| Bad login email | `ERR_EMAIL_NOT_FOUND` (401) |
| Bad password | `ERR_INVALID_CREDENTIALS` (401) |
| Inactive account | `ERR_ACCOUNT_INACTIVE` (406) |
| Wrong current password | `ERR_CURRENT_PASSWORD_INCORRECT` (406) |
| Missing user / OTP | `ERR_MODULE_NOT_FOUND` / `ERR_EMAIL_NOT_FOUND` (404) |
| OTP invalid / expired | `ERR_OTP_INVALID`, `ERR_OTP_EXPIRED`, `ERR_OTP_NOT_FOUND` (404) |
| Duplicate email on register | `ERR_EMAIL_EXISTS` (409) |

Map keys to **localized** UI strings; avoid leaking whether an email exists if product requires it.

### 5.3 User-facing copy (examples)

- Network: “Connection failed. Check your connection and try again.”
- Server: “Something went wrong. Try again later.”
- Validation: show server field errors when payload is structured.
- OTP: distinguish invalid vs expired vs max attempts when API exposes them.

---

## 6. Technical implementation (backend-oriented)

- **JWT:** Issued via `AppJwtService`; tokens stored for user in DB (`AuthRepository.storeLoginToken`); expiry/refresh per config.
- **OTP:** 6-digit, expiry from `app.otp.expire_time` (default 10 minutes in code paths); types `OtpType` (LOGIN, REGISTER, FORGOT_PASSWORD, etc.).
- **Passwords:** Hashed on entity (`bcrypt`); validate via entity methods.
- **Tenant:** Auth repositories use `TenantAwareRepository` where entities carry `tenantId`; ensure `x-tenant` / `x-tenant-id` behavior matches `TENANT_GUIDE.md` for tenant-scoped data.
- **Security hardening (product):** rate limit login/OTP; confirm reset-password flow; use HTTPS; secure cookie/storage for tokens on client.

---

## Quality checklist

- [x] **Frontend handoff:** envelopes, headers, journey table, `OtpType` values, endpoint JSON index.
- [x] Major journeys: register, login (OTP branches), OTP verify, forgot, reset, change password, profile.
- [x] Paths include global prefix `v1`.
- [x] DTO fields aligned with `RegisterRequestDto`, `OtpVerifyRequestDto`, `ForgotPasswordRequestDto`, etc.
- [x] **Documented mismatch:** `resetPassword` implementation vs “token” wording — resolve in code or docs after security review.
- [x] Restored depth comparable to pre-condensed version.

---

*Structure follows `anvix-api-flow-diagram` + `api-flow-diagram-prompt.md`. Narrative restored after git diff showed ~478 → ~249 line reduction.*
