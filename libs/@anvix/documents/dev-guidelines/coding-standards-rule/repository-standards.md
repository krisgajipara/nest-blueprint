# Repository Standards

This document defines repository rules for the current Anvix backend architecture.

Last verified against repo: 2026-05-04

Related docs:

- `libs/@anvix/documents/TENANT_GUIDE.md`
- `libs/@anvix/documents/dev-guidelines/coding-standards-v2.md`
- `libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md`

## Core Rules

- Tenant-owned repositories must extend `TenantAwareRepository<T>`.
- Tenant-owned repositories must be request-scoped.
- Tenant-owned repositories must inject `AsyncContextService` from `@core-generic-services`.
- Services should depend on repositories in their own module only.
- Cross-module data access should happen through services.
- Repositories should not call services.
- Repositories should not contain business workflows.
- Raw SQL must manually filter by `tenant_id`.
- System-wide repositories may use normal TypeORM patterns when the entity is not tenant-owned.

## Current TenantAwareRepository Constructor Pattern

```typescript
import { TenantAwareRepository, User } from '@core-database';
import { AsyncContextService } from '@core-generic-services';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class UserRepository extends TenantAwareRepository<User> {
    constructor(
        @InjectRepository(User)
        repository: Repository<User>,
        @Inject() AsyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, AsyncContextService);
    }
}
```

## What TenantAwareRepository Handles

`TenantAwareRepository<T>` currently:

- applies tenant filtering when an entity has a `tenantId` column
- applies soft-delete filtering when an entity has `deletedAt`
- filters joined aliases when joined entities have `tenantId`
- overrides common read methods such as `find`, `findOne`, `findAndCount`, and `count`
- adds tenant criteria to `update`, `delete`, and `softDelete`
- sets `tenantId` during `insert`, `upsert`, and `save`
- throws on `save` when an entity belongs to a different tenant
- exposes `createQueryBuilderUnfiltered()` for deliberate system-level access

## Single Entity Repository

Use this when a repository owns one primary entity.

```typescript
@Injectable({ scope: Scope.REQUEST })
export class RoleRepository extends TenantAwareRepository<Role> {
    constructor(
        @InjectRepository(Role)
        repository: Repository<Role>,
        @Inject() AsyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, AsyncContextService);
    }

    async findByName(name: string): Promise<Role | null> {
        return this.createQueryBuilder('role')
            .where('role.name = :name', { name })
            .getOne();
    }
}
```

## Facade Repository

Use a facade only when a module needs to coordinate multiple related repositories. A facade should delegate to dedicated repositories instead of injecting raw TypeORM repositories.

```text
Service
  -> AuthRepository facade
     -> OtpRepository
     -> TokenRepository
     -> ResetPasswordTokenRepository
```

Facade rules:

- Keep facade methods focused on data coordination.
- Do not put business workflows in the facade.
- Inject dedicated repositories.
- Preserve request scope when tenant context is required.
- Avoid circular dependencies.

## Query Guidelines

Do:

- Use QueryBuilder for complex filters.
- Select only fields needed by the caller.
- Use whitelisted sort fields.
- Use enums/constants instead of raw strings.
- Keep method names semantic, such as `findActiveUsers`.

Do not:

- Add redundant manual tenant filters to normal `TenantAwareRepository` query-builder calls.
- Use raw SQL without tenant filtering.
- Return sensitive fields such as passwords or salts.
- Inject repositories from another module directly into a service.
- Export repositories from modules for cross-module use.

## Raw SQL

Raw SQL bypasses automatic tenant filtering. Always include tenant filtering manually:

```typescript
await this.query(
    'SELECT * FROM booking WHERE tenant_id = $1 AND deleted_at IS NULL',
    [this.context.getTenantId()]
);
```

Prefer QueryBuilder when possible.

## Database Views

Tenant-filtered views must include `tenant_id` in the view definition so repository filtering can work on the view entity.

```sql
CREATE VIEW booking_summary AS
SELECT
    tenant_id,
    status,
    COUNT(*) AS total
FROM booking
WHERE deleted_at IS NULL
GROUP BY tenant_id, status;
```

## System-Wide Repositories

System-wide entities such as `Tenant` are not tenant-owned. They may use standard TypeORM repository patterns when appropriate.

Keep system-wide access explicit and avoid mixing system-wide queries with tenant-owned repository methods.

## Validation Checklist

- [ ] Tenant-owned repository extends `TenantAwareRepository<T>`.
- [ ] Repository is request-scoped when tenant context is required.
- [ ] Repository injects `AsyncContextService` from `@core-generic-services`.
- [ ] Repository uses selective field returns.
- [ ] Repository does not call services.
- [ ] Repository is not exported for cross-module access.
- [ ] Raw SQL includes tenant filtering.
- [ ] Database views include `tenant_id` when tenant filtering is needed.
- [ ] Tests cover tenant isolation for high-risk queries.


