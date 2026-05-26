# Multi-Tenant Architecture Guide

This guide explains the current multi-tenant architecture used by the backend.

Last verified against repo: 2026-05-04

Verified files:
- `src/app.module.ts`
- `libs/@anvix/server-core/middleware/async-context.middleware.ts`
- `libs/@anvix/server-core/middleware/tenant-context.middleware.ts`
- `libs/@anvix/server-core/generic-service/async-context.service.ts`
- `libs/@anvix/server-core/shared-modules/context/app-context.service.ts`
- `libs/@anvix/server-core/database/repositories/tenant-aware.repository.ts`
- `libs/@anvix/server-core/database/subscribers/tenant.subscriber.ts`
- `libs/@anvix/server-core/custom-guards/role.guard.ts`
- `libs/@anvix/server-core/custom-guards/auth-role.guard.ts`

## Overview

The application isolates tenant-owned data through:

- request context stored in `AsyncLocalStorage`
- tenant header validation middleware
- tenant-aware base entities
- tenant-aware repositories
- a TypeORM subscriber that injects and validates `tenantId`
- authorization guards that validate JWTs and permissions

## Request Flow

```text
HTTP request
  -> AsyncContextMiddleware
  -> LanguageMiddleware
  -> AuditMiddleware
  -> TenantContextMiddleware
  -> Controller guard
  -> Service
  -> TenantAwareRepository
  -> TenantSubscriber
  -> Database
```

## Core Files

```text
libs/@anvix/server-core/
|-- context/
|   `-- context.storage.ts                     # AsyncLocalStorage backing store
|-- generic-service/
|   `-- async-context.service.ts               # Full request context (tenantId, language, token payload)
|-- shared-modules/
|   `-- context/
|       `-- app-context.service.ts             # Backward-compatible wrapper for AsyncContextService
|-- middleware/
|   |-- async-context.middleware.ts            # Initializes AsyncLocalStorage for each request
|   |-- audit.middleware.ts                    # Captures audit metadata
|   |-- language.middleware.ts                 # Captures request language
|   `-- tenant-context.middleware.ts           # Validates tenant header and sets tenant context
|-- database/
|   |-- base-entities/
|   |   |-- base-tenant-modifiable-entity.ts
|   |   `-- base-tenant-modifiable-without-identity-entity.ts
|   |-- repositories/
|   |   `-- tenant-aware.repository.ts
|   `-- subscribers/
|       `-- tenant.subscriber.ts
`-- custom-guards/
    |-- jwt-auth.guard.ts
    |-- role.guard.ts
    `-- auth-role.guard.ts
```

## Middleware Order

Middleware is registered in `src/app.module.ts` in this order:

```typescript
consumer
    .apply(AsyncContextMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL })
    .apply(LanguageMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL })
    .apply(AuditMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL })
    .apply(TenantContextMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL });
```

`AsyncContextMiddleware` must run before `TenantContextMiddleware`, because tenant context is stored in `AsyncLocalStorage`.

## Global TenantGuard

All routes require a valid `x-tenant` or `x-tenant-id` header unless opted out with a decorator. The guard is registered globally (`APP_GUARD`), so controllers do not need `@UseGuards(TenantGuard)` on every endpoint.

| Decorator | Use for |
| --- | --- |
| `@TenantApi()` | Entire tenant module (cross-tenant / product-owner APIs, public subdomain resolve) |
| `@AllowWithoutTenant()` | Other public routes (health, auth login/register/OTP, profiler) |

The guard checks that:

1. A tenant header is present (unless exempt).
2. `TenantContextMiddleware` validated the tenant and set `AsyncContextService` tenant context.
3. Header tenant ID matches the validated context tenant ID.

## Tenant Header

`TenantContextMiddleware` reads tenant ID from either header:

```text
x-tenant
x-tenant-id
```

If no tenant header exists, the middleware allows the request to continue. This supports public routes such as tenant lookup or login flows.

If a tenant header exists, the middleware:

1. Checks the tenant validation cache.
2. Validates the tenant exists and is not soft deleted.
3. Stores `tenantId` on the request object.
4. Stores `tenantId` in `AsyncContextService`.

## Tenant-Aware Entities

Use tenant-aware base entities for data that belongs to a tenant.

```typescript
import { Column, Entity } from 'typeorm';
import { BaseTenantModifiableEntity } from '../base-entities/base-tenant-modifiable-entity';

@Entity('projects')
export class Project extends BaseTenantModifiableEntity {
    @Column({ type: 'varchar', length: 255, name: 'name' })
    name: string;
}
```

For entities that define their own primary key, use:

```typescript
import { BaseTenantModifiableEntityWithoutIdentity } from '../base-entities/base-tenant-modifiable-without-identity-entity';
```

System-wide entities should not use tenant-aware base entities. For example, `Tenant` extends `BaseSystemModifiableEntity` because the tenant record is the tenant owner record.

## Base Entity Reference

| Base class | Use for | Has `tenantId` |
| --- | --- | --- |
| `BaseTenantModifiableEntity` | Tenant-owned entities with default identity | Yes |
| `BaseTenantModifiableEntityWithoutIdentity` | Tenant-owned entities with custom identity | Yes |
| `BaseModifiableEntity` | Non-tenant audit-tracked entities | No |
| `BaseModifiableEntityWithoutIdentity` | Non-tenant audit-tracked entities with custom identity | No |
| `BaseSystemModifiableEntity` | System-wide records such as tenants | No |

## Tenant-Aware Repositories

Tenant-owned repositories should extend `TenantAwareRepository<T>`.

```typescript
import { TenantAwareRepository, Project } from '@core-database';
import { AsyncContextService } from '@core-generic-services';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ProjectRepository extends TenantAwareRepository<Project> {
    constructor(
        @InjectRepository(Project)
        repository: Repository<Project>,
        @Inject() AsyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, AsyncContextService);
    }

    async findActiveProjects(): Promise<Project[]> {
        return this.createQueryBuilder('project')
            .where('project.is_active = :isActive', { isActive: true })
            .getMany();
    }
}
```

## What TenantAwareRepository Does

`TenantAwareRepository`:

- applies `tenant_id = :tenantId` to query builder reads when the entity has a `tenantId` column
- applies `deleted_at IS NULL` when the entity supports soft delete
- applies tenant filters to joined aliases when joined entities have `tenantId`
- overrides common read methods such as `find`, `findOne`, `findAndCount`, and `count`
- adds tenant criteria to `update`, `delete`, and `softDelete`
- sets `tenantId` during `insert`, `upsert`, and `save`
- throws on `save` when an entity already belongs to a different tenant
- exposes `createQueryBuilderUnfiltered()` for explicit system-level queries

Use `createQueryBuilderUnfiltered()` carefully. It bypasses tenant filtering.

## TenantSubscriber

`TenantSubscriber` uses static methods on `AsyncContextService` because TypeORM subscribers are outside normal request-scoped dependency injection.

It runs on:

- `beforeInsert`: injects `tenantId` when the entity has a tenant column and no tenant is already set
- `beforeUpdate`: prevents changing an entity to a tenant different from the current request context

## Guards

Current guard usage is split:

- `JwtAuthGuard`: validates JWT and attaches user data to `request.user`; no role/permission checks.
- `RoleGuard`: validates JWT and checks permissions from `@RequirePermissions()`.
- `AuthRoleGuard`: includes tenant-aware JWT validation logic and token database validation, but current controllers primarily use `RoleGuard` and `JwtAuthGuard`.

For new protected tenant-owned APIs, verify the current controller pattern before choosing a guard. If tenant matching against token payload is required, prefer aligning the route with `AuthRoleGuard` or update `RoleGuard` to set tenant context consistently.

## Permission Decorator

Use `@RequirePermissions()` with module and permission constants:

```typescript
import { MODULE_CONSTANTS, PERMISSION_CONSTANTS } from '@core-constants';
import { RequirePermissions } from '@core-custom-decorators';
import { RoleGuard } from '@core-custom-guards';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('projects')
@UseGuards(RoleGuard)
export class ProjectController {
    @Get()
    @RequirePermissions({
        // Add PROJECT to MODULE_CONSTANTS before using this in a real module.
        module: 'Project',
        permission: PERMISSION_CONSTANTS.READ
    })
    async listProjects() {
        // service call
    }
}
```

## Product Owner Bypass

Current code has two related paths:

- `RoleGuard` bypasses permission checks for `UserTypeEnum.PRODUCT_OWNER`.
- `AuthRoleGuard` bypasses tenant matching and permission checks for `UserTypeEnum.SUPER_ADMIN`.

Before depending on product-owner bypass behavior for new APIs, confirm which guard the controller uses. The enum currently contains both `PRODUCT_OWNER` and `SUPER_ADMIN`, so guard behavior should be standardized if both are intended to mean different things.

## Raw SQL And Views

`TenantAwareRepository` cannot safely inject tenant filters into raw SQL strings.

For raw queries and database views:

- manually filter by `tenant_id`
- never trust a caller-provided tenant ID without validating it against request context
- document why `createQueryBuilderUnfiltered()` or raw SQL is needed

## New Tenant-Owned Module Checklist

- [ ] Entity extends `BaseTenantModifiableEntity` or `BaseTenantModifiableEntityWithoutIdentity`.
- [ ] Repository extends `TenantAwareRepository<T>`.
- [ ] Repository is request-scoped with `@Injectable({ scope: Scope.REQUEST })`.
- [ ] Repository injects `AsyncContextService` from `@core-generic-services`.
- [ ] Controller uses the correct guard for JWT, tenant, and permission needs.
- [ ] Controller uses `@RequirePermissions()` where needed.
- [ ] Raw queries include explicit tenant filtering.
- [ ] Migration includes `tenant_id` and index when applicable.
- [ ] Tests include tenant context setup.

## Test Setup

For repository-level tests, set tenant context before running tenant-aware queries:

```typescript
AsyncContextService.setTenantId('test-tenant-id');

const projects = await projectRepository.find();
```

If using `AsyncContextService` directly, initialize context first:

```typescript
asyncContextService.initializeContext();
asyncContextService.setTenantId('test-tenant-id');
```

## Troubleshooting

### Tenant context is missing

- Confirm `AsyncContextMiddleware` runs before `TenantContextMiddleware`.
- Confirm request includes `x-tenant` or `x-tenant-id` for tenant-owned routes.
- Confirm guard does not overwrite or skip tenant context unexpectedly.

### Tenant mismatch

- Check the tenant ID in the JWT payload.
- Check the `x-tenant` or `x-tenant-id` header.
- Confirm whether the current guard allows product-owner or super-admin bypass.

### Data is not filtered by tenant

- Confirm the entity has a `tenantId` property.
- Confirm the entity extends a tenant-aware base entity.
- Confirm the repository extends `TenantAwareRepository<T>`.
- Confirm raw SQL or unfiltered query builders are not being used accidentally.

