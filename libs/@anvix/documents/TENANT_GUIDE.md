# Multi-Tenant Architecture - Simplified Guide

## Overview

This NestJS application implements multi-tenancy with **complete data isolation** between tenants. The system supports a **PRODUCT_OWNER (SUPER_ADMIN)** role that can bypass tenant scoping for cross-tenant operations.

---

## How It Works (Simple)

```
Request → TenantContextMiddleware → AuthRoleGuard → TenantSubscriber → Database
           (extracts tenant        (validates JWT   (auto-injects     (filtered by
            from header)            + tenant match)  tenantId)         tenantId)
```

### 3 Key Components

1. **TenantSubscriber** - Auto-injects `tenantId` on insert/update
2. **TenantAwareRepository** - Auto-filters queries by `tenantId`
3. **AuthRoleGuard** - Validates tenant matches JWT token

---

## File Locations

```
libs/@oc/server-core/
├── database/
│   ├── base-entities/
│   │   ├── base-modifiable-entity.ts       # Adds tenantId + audit fields
│   │   └── base-modifiable-without-identity-entity.ts  # Adds tenantId + audit (no PK)
│   ├── entities/
│   │   └── tenant.entity.ts    # Tenant entity (no tenantId)
│   ├── repositories/
│   │   └── tenant-aware.repository.ts
│   └── subscribers/
│       └── tenant.subscriber.ts
├── generic-service/
│   └── tenant-context.service.ts  # Request-scoped tenant context
├── middleware/
│   └── tenant-context.middleware.ts
├── custom-decorators/
│   └── require-permissions.decorator.ts
└── custom-guards/
    ├── tenant.guard.ts
    └── auth-role.guard.ts      # Main auth guard

libs/@oc/business-core/
└── modules/
    └── tenant/
        └── tenant.module.ts    # Global module
```

---

## Usage

### 1. Create a Tenant-Aware Entity

```typescript
import { Entity, Column } from "typeorm";
import { BaseModifiableEntity } from "@core-database";

@Entity("projects")
export class Project extends BaseModifiableEntity {
    @Column()
    name: string;
}
```

**That's it.** The entity now has `tenantId` column (from `BaseModifiableEntity`), and all audit fields.

### 2. Create a Repository

```typescript
import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantAwareRepository } from "@core-database";
import { TenantContextService } from "@core-generic-services";
import { Project } from "@core-database";

@Injectable({ scope: Scope.REQUEST })
export class ProjectRepository extends TenantAwareRepository<Project> {
    constructor(
        @InjectRepository(Project)
        repository: Repository<Project>,
        @Inject() tenantContextService: TenantContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, tenantContextService);
    }

    // Custom queries automatically filtered by tenantId
    async findActiveProjects() {
        return this.createQueryBuilder("project")
            .where("project.isActive = :isActive", { isActive: true })
            .getMany();
        // Automatically adds: AND project.tenantId = :tenantId
    }
}
```

**Key points:**
- Extend `TenantAwareRepository<T>`
- Decorate with `@Injectable({ scope: Scope.REQUEST })`
- Pass `repository.target`, `repository.manager`, `repository.queryRunner`, and `tenantContextService` to `super()`
- All `createQueryBuilder()` calls auto-filter by tenantId

### 3. Use in Service

```typescript
@Injectable()
export class ProjectService {
    constructor(
        private readonly projectRepo: ProjectRepository
    ) {}

    async findAll() {
        // Automatically filtered by tenantId!
        return this.projectRepo.find();
    }

    async create(dto: CreateProjectDto) {
        // tenantId auto-injected by TenantSubscriber
        const project = this.projectRepo.create(dto);
        return this.projectRepo.save(project);
    }
}
```

---

## Existing Repositories (Migration Guide)

**Don't panic!** Existing repositories using standard `Repository<T>` will continue to work.

### Gradual Migration

**Option 1: Keep using standard Repository**
```typescript
// Works fine - just add tenantId to where clauses manually
async findProjects(tenantId: string) {
    return this.repo.find({ where: { tenantId } });
}
```

**Option 2: Migrate to TenantAwareRepository (recommended)**
```typescript
// Change extends and add proper constructor
@Injectable({ scope: Scope.REQUEST })
export class ProjectRepository extends TenantAwareRepository<Project> {
    constructor(
        @InjectRepository(Project)
        repository: Repository<Project>,
        @Inject() tenantContextService: TenantContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, tenantContextService);
    }
    // createQueryBuilder() now auto-filters by tenantId
}
```

### What TenantSubscriber Does

The `TenantSubscriber` automatically injects `tenantId` on:
- `beforeInsert` - Sets `tenantId` from current request context
- `beforeUpdate` - Validates `tenantId` hasn't changed

This works **regardless** of which repository you use.

---

## AuthRoleGuard (Main Guard)

Handles:
- ✅ JWT validation
- ✅ Tenant matching (token.tenantId === x-tenant header)
- ✅ Permission checks via `@RequirePermissions()`
- ✅ PRODUCT_OWNER bypass (SUPER_ADMIN skips tenant checks)

### Usage

```typescript
@UseGuards(AuthRoleGuard)
@RequirePermissions({ module: "PROJECT", permission: "READ" })
@Get()
async getProjects() {
    // Only users with PROJECT.READ permission can access
    // Tenant context is validated and set
}
```

---

## Key Differences from Standard Architecture

| Feature | Standard | Tenant-Aware |
|---------|----------|--------------|
| **Entity** | `extends BaseModifiableEntity` (no tenantId) | `extends BaseModifiableEntity` (has tenantId) |
| **Repository** | `extends Repository<T>` | `extends TenantAwareRepository<T>` |
| **Queries** | Manual tenant filtering | Auto-filtered by `createQueryBuilder()` |
| **Inserts** | Manual tenantId setting | Auto-injected by `TenantSubscriber` |
| **Updates** | No tenant validation | Validates tenantId hasn't changed |

---

## What Was Simplified

❌ **Removed:**
- TenantRule entity/service/repository (feature flags not needed)
- RuleGuard (rule enforcement not needed)
- @RequireRule decorator
- Complex method overrides in TenantAwareRepository
- Separate `BaseTenantEntity` files (tenantId now in `BaseModifiableEntity`)
- Static `TenantContext` class (causes race conditions)

✅ **Kept:**
- Automatic tenant filtering via `createQueryBuilder()`
- Auto-injection of `tenantId` via `TenantSubscriber`
- Tenant validation via `AuthRoleGuard`
- SUPER_ADMIN bypass (built into guard, no decorator needed)

---

## Quick Reference

### Base Entities

| Base Class | Use For | Has tenantId |
|-----------|---------|--------------|
| `BaseModifiableEntity` | Business data (projects, users, roles, etc.) | ✅ |
| `BaseModifiableEntityWithoutIdentity` | Business data with custom PK | ✅ |
| `BaseSystemModifiableEntity` | System data (tenants, global configs) | ❌ |

### Guards

| Guard | Use When |
|-------|----------|
| `AuthRoleGuard` | Full auth + tenant + permissions (default) |
| `TenantGuard` | Need tenant context but no auth (rare) |

### Decorators

| Decorator | Purpose |
|-----------|---------|
| `@RequirePermissions({ module, permission })` | Require specific permission |

---

## Testing

No special test setup needed. Just set tenant context in tests:

```typescript
// In test setup
tenantContextService.setTenantId("test-tenant-id");

// Run tests - all queries auto-filtered
const projects = await projectRepo.find();
```

---

## Migration Steps

1. **Add tenantId column** to existing tables via migration
2. **Update entities** — they already extend `BaseModifiableEntity` (now includes `tenantId`)
3. **Update repositories** to extend `TenantAwareRepository`
4. **Test** - verify queries return correct tenant data
5. **Deploy**

### Migration Command

```bash
npm run typeorm migration:generate -- -n add-tenant-columns
npm run typeorm migration:run
```

---

## Troubleshooting

### "Tenant context is required" Error
- Ensure `x-tenant` header is present
- Check `AuthRoleGuard` is applied to route

### "Tenant mismatch" Error
- JWT token's `tenantId` doesn't match `x-tenant` header
- User is trying to access data from different tenant

### Data Not Filtered by Tenant
- Ensure repository extends `TenantAwareRepository`
- Check `TenantContextService` is request-scoped
- Verify `TenantSubscriber` is registered in TypeORM config

---

## That's It!

The tenant architecture is intentionally simple:
- **One base class** for entities
- **One base class** for repositories
- **One subscriber** for auto-injection
- **One guard** for validation

No complex rule engines, no feature flags, no extra overhead. Just secure data isolation.
