# Multi-Tenant Developer Guide

This guide details how to develop secure, multi-tenant modules within the Sports Engine application. Our architecture follows a **"Secure by Default"** philosophy using `TenantAwareRepository`.

## 1. Core Concept

In this application, "Multi-Tenancy" means users from different organizations (Tenants) share the same database and tables. Data isolation is achieved by enforcing a `tenant_id` filter on **every single database query**.

Instead of developers manually adding `WHERE tenant_id = '...'` to hundreds of queries (which is error-prone), we use a base repository layer to handle this automatically.

**All business modules are now fully tenant-aware**, including previously non-tenant entities like Events, which have been updated to extend `BaseTenantEntity` and use `TenantAwareRepository`.

---

## 2. Key Features (What the System Does for You)

### ✅ Automatic Tenant Filtering

Every time you call standard methods like `.find()`, `.findOne()`, or `.createQueryBuilder().getMany()`, the system strictly applies `tenant_id = current_user_tenant` and `deleted_at IS NULL`.

### ✅ Defense in Depth (Recursive Join Protection)

This is the most powerful feature. If you join other tables (e.g., `Batch` joins `Coach`), the repository **automatically scans all joined aliases** and applies the tenant filter to them as well.

- **Result**: You don't need to manually filter joined tables. The system prevents data leaks even in complex graphs.

### ✅ Trusted Context

Dependency Injection is set to `Scope.REQUEST`. This means every repository instance is unique to the current HTTP request, ensuring `this.context.getTenantId()` is always accurate and thread-safe.

---

## 3. Developer Responsibilities ("The Taken Cares")

While the system handles a lot, you strictly own the following:

### 1️⃣ Entities MUST extend `BaseTenantEntity`

If you don't extend this, your table won't have a `tenant_id` column, and the automatic filters will fail or ignore it (causing a leak).

- **Correction**: Always extend `BaseTenantEntity`.

### 2️⃣ Repositories MUST extend `TenantAwareRepository`

If you use a standard TypeORM `Repository<T>`, you bypass all security logic.

- **Correction**: Your classes must extend `TenantAwareRepository<T>`.

### 3️⃣ Repositories MUST be `Scope.REQUEST`

- **Correction**: Always add `@Injectable({ scope: Scope.REQUEST })` to your repository class.

### 4️⃣ Database Views & Raw SQL (CRITICAL CAUTION ⚠️)

The `TenantAwareRepository` cannot magically inject filters into raw SQL strings or inside the definition of a Database View.

- **Rule**: If you write `CREATE VIEW` or use `.query('SELECT ...')`, **YOU** are responsible for manually adding `tenant_id` protection.
- **View Requirement**: Every ViewEntity MUST expose a `tenant_id` column so the repository can filter it later.

---

## 4. Step-by-Step Implementation Guide

### Step 1: Define the Entity

Create your entity extending the tenant base class.

```typescript
// src/modules/tournament/tournament.entity.ts
import { Entity, Column } from "typeorm";
import { BaseTenantEntity } from "@core-database"; // <--- IMPORANT

@Entity("tournaments")
export class Tournament extends BaseTenantEntity {
    @Column()
    name: string;
    // tenant_id is inherited!
}
```

### Step 2: Create the Repository

Extend the tenant-aware repository and inject the context.

```typescript
// src/modules/tournament/tournament.repository.ts
import { Injectable, Scope, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TenantAwareRepository, Tournament } from "@core-database";
import { RequestContextService } from "@core-utilities";

@Injectable({ scope: Scope.REQUEST }) // <--- IMPORTANT: Request Scope
export class TournamentRepository extends TenantAwareRepository<Tournament> {
    constructor(
        @InjectRepository(Tournament)
        repository: Repository<Tournament>,
        @Inject() requestContextService: RequestContextService // <--- Inject Context
    ) {
        super(repository.target, repository.manager, repository.queryRunner, requestContextService);
    }

    // Now write methods as usual!
    async findActiveTournaments() {
        // Automatically adds: WHERE tenant_id = '...' AND deleted_at IS NULL
        return this.find({ where: { status: "ACTIVE" } });
    }
}
```

### Step 3: Use QueryBuilder (Safe)

Even when using QueryBuilder, filters are applied automatically **when the query is executed**.

```typescript
async findWithMatches() {
    return this.createQueryBuilder("t")
        .leftJoinAndSelect("t.matches", "m")
        // AUTOMATICALLY ADDS:
        // AND t.tenant_id = :id
        // AND m.tenant_id = :id (Recursive protection!)
        .getMany();
}
```

---

## 5. Checklist for Code Reviewers

When reviewing code, ask these questions to ensure isolation:

- [ ] Does the new Entity extend `BaseTenantEntity`? (All entities should be tenant-aware)
- [ ] Does the new Repository extend `TenantAwareRepository`? (All repositories should be tenant-aware)
- [ ] Is the Repository marked with `Scope.REQUEST`?
- [ ] If a **DB View** is used, does it include `tenant_id` in its definition?
- [ ] Are they avoiding `query()` (Raw SQL)? If not, is `tenant_id` manually handled?
- [ ] **Exception Check**: Only `TenantRepository` should extend `Repository` directly (as it's the root tenant entity)

---

## 6. Cheat Sheet: Do I need Manual Filtering?

| Scenario               | Repository Type                                  | Action Required                                 |
| :--------------------- | :----------------------------------------------- | :---------------------------------------------- |
| **Standard Usage**     | `extends TenantAwareRepository`                  | **Automatic** (No action needed)                |
| **Tenant Repository**  | `TenantRepository extends Repository<Tenant>`    | **N/A** (Root tenant entity, no filtering)      |
| **Generic Repository** | `private repo: Repository<T>`                    | **Manual** (Must add `where: { tenantId }`)     |
| **Composite Repo**     | Injecting standard repos (like `AuthRepository`) | **Manual** (Must add `where: { tenantId }`)     |
| **Query Builder**      | `this.createQueryBuilder()`                      | **Automatic** (No action needed)                |
| **Raw SQL**            | `this.query('SELECT ...')`                       | **Manual** (Must add `WHERE tenant_id = $1`)    |
| **Database View**      | Entity maps to a `@ViewEntity`                   | **Manual** (Ensure View has `tenant_id` column) |

---

## 7. Architecture Patterns: Avoiding Circular Dependencies

When splitting huge repositories or using composite repositories (like `AuthRepository`), follow these rules to avoid circular dependency errors (`Nest can't resolve dependencies...`).

### Rule 1: The Strict Hierarchy (DAG)

Dependencies must flow **downwards** only.

- **Controllers** depend on **Services**.
- **Services** depend on **Repositories**.
- **Repositories** depend on **Entities** (and other _lower-level_ Repositories).

### Rule 2: Repository-to-Repository Injection

You CAN inject a Repository into another Repository, but **ONLY** if it creates a strict parent-child relationship.

- ✅ `AuthRepository` (Parent) -> injects `OtpRepository` (Child)
- ❌ `OtpRepository` -> injects `AuthRepository` (Circular!)

### Rule 3: The "Facade" Pattern vs "Service Orchestration"

If two repositories need each other (e.g., `UserRepo` needs `OrderRepo` to count orders, and `OrderRepo` needs `UserRepo` to get names), you have a design flaw.

- **Solution**: Remove the dependency from _both_ repositories. Create a **Service** (e.g., `UserStatsService`) that injects _both_ repositories and handles the logic there.
- **Guideline**: Repositories should be "dumb" data accessors. Complex logic involving multiple domains belongs in a Service.

### Rule 4: Using Other DB Functions

If you need to use raw database functions (like `NOW()`, `COUNT()`, custom postgres functions):

1.  **Try TypeORM first**: properties like `createdAt: 'NOW()'` often work.
2.  **QueryBuilder**: Use `.addSelect('COUNT(*)', 'count')`.
3.  **Raw SQL (Last Resort)**: If you MUST use `this.query('SELECT my_custom_func(...)')`, remember to **MANUALLY** add `WHERE tenant_id = $1`.
