# Context Service Consolidation TODO

Goal: keep one request context service that stores the full JWT token payload plus request language and tenant context, then remove the duplicate/deprecated context services.

Last verified against repo: 2026-05-04

## Current Context Services

Current files:

```text
libs/@anvix/server-core/generic-service/
|-- async-context.service.ts          # AsyncLocalStorage-backed userId and tenantId context
|-- audit-context.service.ts          # Deprecated wrapper around AsyncContextService for userId
`-- request-context.service.ts        # In-memory language/userId service used by validators

libs/@anvix/server-core/shared-modules/context/
`-- app-context.service.ts            # RequestContextService wrapper around AsyncContextService for tenantId
```

## Target Design

- [ ] Keep a single context service under `libs/@anvix/server-core/generic-service`.
- [ ] Rename/reshape `AsyncContextService` into the canonical service, or keep the name if it avoids churn.
- [ ] Store the full token payload instead of only `userId`.
- [ ] Store request language.
- [ ] Store tenant ID.
- [ ] Keep static getters for TypeORM subscribers, because subscribers cannot rely on request-scoped DI.
- [ ] Remove `audit-context.service.ts`.
- [ ] Remove `generic-service/request-context.service.ts`.
- [ ] Remove or replace `shared-modules/context/app-context.service.ts` if it becomes only a wrapper.

## Proposed Context Shape

```typescript
export interface AppRequestContext {
    language?: string;
    tenantId?: string;
    tokenPayload?: JwtPayload;
}

export interface JwtPayload {
    sub: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    userType?: number;
    roleId?: string | null;
    tenantId?: string;
    role?: unknown;
}
```

Useful convenience methods:

```text
initializeContext()
clearContext()
setLanguage(language)
getLanguage()
setTenantId(tenantId)
getTenantId()
setTokenPayload(payload)
getTokenPayload()
getUserId()
static getTenantId()
static getUserId()
static getTokenPayload()
```

## Code Update Checklist

### Core Context Files

- [ ] Update `generic-service/async-context.service.ts` to store `AppRequestContext`.
- [ ] Update `generic-service/index.ts` to export only the canonical context service.
- [ ] Delete `generic-service/audit-context.service.ts`.
- [ ] Delete `generic-service/request-context.service.ts`.
- [ ] Decide whether to delete `shared-modules/context/app-context.service.ts` or convert it into a backward-compatible alias temporarily.
- [ ] Update `shared-modules/context/app-context.module.ts` if the shared context wrapper is removed.
- [ ] Update `shared-modules/index.ts` exports if the shared context wrapper is removed.

### Middleware

- [ ] Update `AsyncContextMiddleware` to initialize the new context shape.
- [ ] Update `AuditMiddleware` to store the full token payload, not just `payload.sub`.
- [ ] Update `LanguageMiddleware` to read language from request headers and store it in the canonical context service.
- [ ] Update `TenantContextMiddleware` to store tenant ID through the canonical service.

### Guards

- [ ] Update `AuthRoleGuard` to set token payload and effective tenant ID through the canonical service.
- [ ] Check whether `JwtAuthGuard` should also set token payload.
- [ ] Check whether `RoleGuard` should also set token payload and tenant context.
- [ ] Standardize product-owner/super-admin bypass behavior while touching guards.

### Subscribers

- [ ] Update `database/subscribers/audit.subscriber.ts` to read user ID from the canonical service.
- [ ] Update `database/subscribers/tenant.subscriber.ts` to read tenant ID from the canonical service.
- [ ] Keep static methods available for subscriber use.

### Repositories

- [ ] Update `database/repositories/tenant-aware.repository.ts` to depend on the canonical service.
- [ ] Update repositories that inject `RequestContextService` from `@core-shared-modules`:
  - `business-core/modules/auth/otp.repository.ts`
  - `business-core/modules/auth/reset-password-token.repository.ts`
  - `business-core/modules/auth/token.repository.ts`
  - `business-core/modules/role/role.repository.ts`
  - `business-core/modules/tenant/tenant.repository.ts`
  - `business-core/modules/user/user.repository.ts`
- [ ] Remove wrapper imports from `@core-shared-modules` if the wrapper is deleted.

### Validators

- [ ] Update `custom-validators/custom-validator.module.ts` to provide the canonical service.
- [ ] Update validators currently importing `../generic-service/request-context.service`.
- [ ] Ensure validators can still read language safely.
- [ ] Define default language fallback if no header/context exists.

### Modules

- [ ] Update `src/app.module.ts` providers to remove `AuditContextService`.
- [ ] Update `business-core/modules/tenant/tenant.module.ts` providers/exports.
- [ ] Update any module that imports `RequestContextService` from `@core-shared-modules`.

### Docs

- [ ] Update `TENANT_GUIDE.md`.
- [ ] Update `folder-architecture.md`.
- [ ] Update `dev-guidelines/coding-standards-v2.md`.
- [ ] Update `dev-guidelines/architecture-validation-rule-v2.md`.
- [ ] Update `dev-guidelines/boilerplate-setup-guide.md`.
- [ ] Update `dev-guidelines/coding-standards-rule/repository-standards.md`.
- [ ] Update `dev-guidelines/ai-module-generation.md`.
- [ ] Update `libs/@anvix/documents/README.md` if document links or descriptions change.

## Verification Checklist

- [ ] Run `rg "AuditContextService|generic-service/request-context.service|from \"@core-shared-modules\".*RequestContextService|from '@core-shared-modules'.*RequestContextService"`.
- [ ] Run `rg "RequestContextService" libs src` and verify remaining usages are intentional.
- [ ] Run `rg "AsyncContextService" libs src` and verify the canonical service is the only context implementation.
- [ ] Run `npm run lint` if practical.
- [ ] Run `npm run build` only if applying migrations during build is acceptable for the current environment.

## Risks To Handle Carefully

- Validators currently depend on language through `generic-service/request-context.service.ts`.
- Tenant repositories currently depend on `RequestContextService` from `@core-shared-modules`.
- TypeORM subscribers need static context access.
- Guards currently differ in how they treat `PRODUCT_OWNER` and `SUPER_ADMIN`.
- `AuditMiddleware` currently verifies JWT and may throw if token is invalid; changing token handling should preserve expected behavior.

