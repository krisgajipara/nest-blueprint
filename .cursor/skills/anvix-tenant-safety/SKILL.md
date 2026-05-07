---
name: anvix-tenant-safety
description: Enforce tenant-safe implementation in Anvix backend code using tenant context middleware, tenant-aware entities and repositories, subscriber behavior, and guard alignment. Use when building or reviewing tenant-owned data flows.
---

# Anvix Tenant Safety

## Use This Skill When

- Adding or modifying tenant-owned modules.
- Reviewing tenant isolation and guard behavior.
- Writing raw SQL, views, or unfiltered repository logic.

## Read First

1. `libs/@anvix/documents/TENANT_GUIDE.md`
2. `libs/@anvix/documents/dev-guidelines/coding-standards-v2.md`
3. `libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md`
4. `libs/@anvix/documents/dev-guidelines/coding-standards-rule/repository-standards.md`

## Tenant Safety Checklist

- Ensure middleware order preserves context initialization before tenant extraction.
- Use `x-tenant` or `x-tenant-id` handling consistently with existing middleware behavior.
- Tenant-owned entity extends `BaseTenantModifiableEntity` or `BaseTenantModifiableEntityWithoutIdentity`.
- Tenant-owned repository extends `TenantAwareRepository<T>`.
- Repository is request-scoped and injects `AsyncContextService` from `@core-generic-services`.
- Protected routes use the correct guard and permission decorator pattern.
- Any raw SQL explicitly filters by `tenant_id`.
- Any system-level bypass (`createQueryBuilderUnfiltered()`) is intentional and documented.

## Guard Alignment Checks

- Confirm whether route uses `JwtAuthGuard`, `RoleGuard`, or `AuthRoleGuard`.
- Verify behavior for product-owner/super-admin bypass before relying on it.
- Ensure tenant matching requirements are enforced for protected tenant routes.

## Subscriber/Repository Checks

- Tenant assignment should be safe for inserts and updates.
- Updates must not allow cross-tenant ownership mutation.
- Joined query aliases should not accidentally bypass tenant filtering.

## Required Output

When finishing tenant-related work, report:

- how tenant context is set and consumed
- how repository filtering is guaranteed
- where raw/unfiltered data access exists (if any) and why
- tenant-specific tests run or still needed
