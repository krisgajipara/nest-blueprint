# Repository Standards & TenantAwareRepository Pattern

## Overview

This document defines the **mandatory standards** for creating and using repositories in the multi-tenant Sports Engine application. All repositories **MUST** extend `TenantAwareRepository<T>` to ensure automatic tenant filtering on every query.

---

## Core Principles

### 1️⃣ **Automatic Tenant Filtering**

Every repository that manages tenant-scoped entities **MUST** extend `TenantAwareRepository<T>`. This ensures:

- ✅ Tenant ID is **automatically added** to all queries
- ✅ No manual `WHERE tenant_id = ?` needed
- ✅ Zero chance of cross-tenant data leakage
- ✅ Consistent tenant isolation across the application

### 2️⃣ **Request-Scoped Repositories**

All tenant-aware repositories **MUST** be decorated with `@Injectable({ scope: Scope.REQUEST })` to access the current tenant context from the request.

### 3️⃣ **One Entity, One Repository**

Each repository should manage **one primary entity**. For operations involving multiple entities, use the **Facade Pattern** (see AuthRepository example).

### 4️⃣ **Module Ownership**

Repositories are **private to their module**. Cross-module data access happens via **Service-to-Service** communication, never repository-to-repository.

---

## TenantAwareRepository Base Class

### What It Does

The `TenantAwareRepository<T>` automatically:

1. Injects `RequestContextService` to get current tenant ID
2. Overrides TypeORM methods (`find`, `findOne`, `findAndCount`, etc.)
3. Adds `WHERE tenant_id = <current_tenant>` to every query
4. Protects against accidental cross-tenant data access

### Implementation

```typescript
// libs/@oc/server-core/database/repositories/tenant-aware.repository.ts

import { Injectable, Scope } from "@nestjs/common";
import { DataSource, FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { RequestContextService } from "@core-utilities";

@Injectable({ scope: Scope.REQUEST })
export class TenantAwareRepository<T> extends Repository<T> {
    constructor(
        private dataSource: DataSource,
        private entityClass: new () => T,
        private requestContextService: RequestContextService
    ) {
        super(entityClass, dataSource.createEntityManager());
    }

    private getTenantId(): string {
        return this.requestContextService.getTenantId();
    }

    // Override find to auto-inject tenant filter
    async find(options?: FindManyOptions<T>): Promise<T[]> {
        return super.find({
            ...options,
            where: {
                ...options?.where,
                tenantId: this.getTenantId()
            } as any
        });
    }

    // Override findOne to auto-inject tenant filter
    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        return super.findOne({
            ...options,
            where: {
                ...options?.where,
                tenantId: this.getTenantId()
            } as any
        });
    }

    // Other methods similarly wrapped...
}
```

---

## Standard Repository Patterns

### Pattern 1: Single Entity Repository (Most Common)

Use this for repositories managing **one primary entity**.

#### Example: OtpRepository

```typescript
// libs/@oc/business-core/modules/auth/otp.repository.ts

import { Injectable, Scope } from "@nestjs/common";
import { DataSource } from "typeorm";
import { TenantAwareRepository } from "@core-database";
import { Otp } from "@core-database";
import { RequestContextService } from "@core-utilities";
import { OtpType } from "@core-enums";

@Injectable({ scope: Scope.REQUEST })
export class OtpRepository extends TenantAwareRepository<Otp> {
    constructor(dataSource: DataSource, requestContextService: RequestContextService) {
        super(dataSource, Otp, requestContextService);
    }

    /**
     * Find latest OTP by user ID and type
     * Tenant filter applied automatically
     */
    async findLatestOtpByUserIdAndType(userId: string, otpType: OtpType): Promise<Otp | null> {
        // ✅ No manual tenant_id filter needed!
        return this.findOne({
            where: { userId, otpType },
            order: { createdAt: "DESC" }
        });
    }

    /**
     * Create new OTP record
     * Tenant ID set automatically by subscriber
     */
    async createOtp(otpData: Partial<Otp>): Promise<Otp> {
        const otp = this.create(otpData);
        return this.save(otp);
    }

    /**
     * Mark OTP as used
     */
    async markOtpAsUsed(otpId: string): Promise<void> {
        await this.update(
            { id: otpId }, // ✅ Tenant filter applied automatically
            { isUsed: true }
        );
    }

    /**
     * Get OTP expiry time
     */
    async getOtpExpireTime(userId: string, otpType: OtpType): Promise<Date | null> {
        const otp = await this.findOne({
            where: { userId, otpType, isUsed: false },
            order: { createdAt: "DESC" },
            select: ["expireAt"]
        });
        return otp?.expireAt || null;
    }
}
```

**Key Points:**

- ✅ Extends `TenantAwareRepository<Otp>`
- ✅ `@Injectable({ scope: Scope.REQUEST })`
- ✅ Injects `DataSource` and `RequestContextService`
- ✅ No manual `tenantId` filtering in queries
- ✅ Focused on single entity (Otp)

---

### Pattern 2: Facade Repository (Multi-Entity Operations)

Use this when you need to coordinate operations across **3 or more related entities** within the same module.

#### Example: AuthRepository (Facade)

```typescript
// libs/@oc/business-core/modules/auth/auth.repository.ts

import { Injectable, Scope } from "@nestjs/common";
import { OtpRepository } from "./otp.repository";
import { TokenRepository } from "./token.repository";
import { ResetPasswordTokenRepository } from "./reset-password-token.repository";

/**
 * Facade repository for Auth module
 * Coordinates operations across Otp, Token, and ResetPasswordToken entities
 * Does NOT extend TenantAwareRepository (delegates to dedicated repos)
 */
@Injectable({ scope: Scope.REQUEST })
export class AuthRepository {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly tokenRepository: TokenRepository,
        private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository
    ) {}

    // ========== OTP Operations (delegates to OtpRepository) ==========

    async createOtp(otpData: Partial<Otp>): Promise<Otp> {
        return this.otpRepository.createOtp(otpData);
    }

    async findLatestOtpByUserIdAndType(userId: string, otpType: OtpType): Promise<Otp | null> {
        return this.otpRepository.findLatestOtpByUserIdAndType(userId, otpType);
    }

    async markOtpAsUsed(otpId: string): Promise<void> {
        return this.otpRepository.markOtpAsUsed(otpId);
    }

    async getOtpExpireTime(userId: string, otpType: OtpType): Promise<Date | null> {
        return this.otpRepository.getOtpExpireTime(userId, otpType);
    }

    // ========== Token Operations (delegates to TokenRepository) ==========

    async storeLoginToken(accessToken: string, refreshToken: string, userId: string): Promise<void> {
        return this.tokenRepository.storeLoginToken(accessToken, refreshToken, userId);
    }

    async findValidRefreshToken(refreshToken: string): Promise<Token | null> {
        return this.tokenRepository.findValidRefreshToken(refreshToken);
    }

    async revokeRefreshToken(tokenId: string): Promise<void> {
        return this.tokenRepository.revokeRefreshToken(tokenId);
    }

    // ========== Reset Password Token Operations ==========

    async createResetPasswordToken(userId: string, token: string): Promise<ResetPasswordToken> {
        return this.resetPasswordTokenRepository.createResetPasswordToken(userId, token);
    }

    async findValidResetToken(token: string): Promise<ResetPasswordToken | null> {
        return this.resetPasswordTokenRepository.findValidResetToken(token);
    }
}
```

**Architecture:**

```
┌─────────────────────────────────────────────┐
│           AuthService                       │
│                 │                           │
│                 ▼                           │
│          AuthRepository (Facade)            │
│          @Injectable(REQUEST)               │
│                 │                           │
│       ┌─────────┼─────────┐                │
│       ▼         ▼         ▼                │
│   OtpRepo  TokenRepo  ResetPwdRepo         │
│   (Tenant)  (Tenant)   (Tenant)            │
│       │         │         │                │
│       ▼         ▼         ▼                │
│     Otp      Token   ResetPasswordToken    │
└─────────────────────────────────────────────┘
```

**Key Points:**

- ✅ Facade does NOT extend TenantAwareRepository
- ✅ Facade delegates to dedicated tenant-aware repositories
- ✅ Each dedicated repository extends TenantAwareRepository
- ✅ Automatic tenant filtering at the leaf level
- ✅ Clean separation of concerns

---

## Creating a New Repository: Step-by-Step

### Step 1: Determine Repository Type

**Single Entity?** → Use Pattern 1 (extend TenantAwareRepository)  
**3+ Related Entities?** → Use Pattern 2 (Facade pattern)

### Step 2: Create Repository File

**Location:** `libs/@oc/business-core/modules/{module}/{entity}.repository.ts`

### Step 3: Implement Repository (Pattern 1)

```typescript
import { Injectable, Scope } from "@nestjs/common";
import { DataSource } from "typeorm";
import { TenantAwareRepository } from "@core-database";
import { YourEntity } from "@core-database";
import { RequestContextService } from "@core-utilities";

@Injectable({ scope: Scope.REQUEST })
export class YourEntityRepository extends TenantAwareRepository<YourEntity> {
    constructor(dataSource: DataSource, requestContextService: RequestContextService) {
        super(dataSource, YourEntity, requestContextService);
    }

    // Add your custom methods here
    async findByCustomField(fieldValue: string): Promise<YourEntity | null> {
        // ✅ Tenant filter applied automatically
        return this.findOne({
            where: { customField: fieldValue }
        });
    }
}
```

### Step 4: Register in Module

```typescript
// src/modules/{module}/{module}.module.ts

import { YourEntityRepository } from "@business-core-modules";
import { YourEntity } from "@core-database";

@Module({
    imports: [TypeOrmModule.forFeature([YourEntity])],
    providers: [
        YourEntityService,
        YourEntityRepository // ✅ Register as provider
    ],
    exports: [YourEntityService] // ✅ NEVER export repository
})
export class YourEntityModule {}
```

### Step 5: Use in Service

```typescript
// libs/@oc/business-core/modules/{module}/{module}.service.ts

@Injectable()
export class YourEntityService {
    constructor(private readonly yourEntityRepository: YourEntityRepository) {}

    async findByField(fieldValue: string): Promise<YourEntity> {
        const entity = await this.yourEntityRepository.findByCustomField(fieldValue);
        if (!entity) {
            throw new NotFoundException({
                message: "ERR_MODULE_NOT_FOUND",
                module: MapToModuleName(ModuleName.YOUR_MODULE)
            });
        }
        return entity;
    }
}
```

---

## Repository Method Guidelines

### ✅ DO

1. **Extend TenantAwareRepository for tenant entities**

    ```typescript
    export class UserRepository extends TenantAwareRepository<User> {}
    ```

2. **Use REQUEST scope**

    ```typescript
    @Injectable({ scope: Scope.REQUEST })
    ```

3. **Inject DataSource and RequestContextService**

    ```typescript
    constructor(
        dataSource: DataSource,
        requestContextService: RequestContextService
    ) {
        super(dataSource, YourEntity, requestContextService);
    }
    ```

4. **Create focused, single-purpose methods**

    ```typescript
    async findActiveUsers(): Promise<User[]> {
        return this.find({ where: { status: UserStatus.ACTIVE } });
    }
    ```

5. **Use TypeORM query builders for complex queries**

    ```typescript
    async findUsersWithPlans(): Promise<User[]> {
        return this.createQueryBuilder("user")
            .leftJoinAndSelect("user.userPlans", "plans")
            .where("user.status = :status", { status: UserStatus.ACTIVE })
            // ✅ Tenant filter applied automatically by TenantAwareRepository
            .getMany();
    }
    ```

6. **Return only needed fields using select**
    ```typescript
    async findUserNames(): Promise<Array<{ id: string; firstName: string; lastName: string }>> {
        return this.find({
            select: ["id", "firstName", "lastName"]
        });
    }
    ```

### ❌ DON'T

1. **Don't manually add tenantId filters**

    ```typescript
    // ❌ WRONG - Redundant
    return this.find({
        where: {
            status: UserStatus.ACTIVE,
            tenantId: this.getTenantId() // ❌ Already automatic!
        }
    });

    // ✅ CORRECT
    return this.find({
        where: { status: UserStatus.ACTIVE }
    });
    ```

2. **Don't use standard Repository for tenant entities**

    ```typescript
    // ❌ WRONG - Bypasses tenant filtering
    @Injectable()
    export class UserRepository extends Repository<User> {}

    // ✅ CORRECT
    @Injectable({ scope: Scope.REQUEST })
    export class UserRepository extends TenantAwareRepository<User> {}
    ```

3. **Don't inject repositories from other modules**

    ```typescript
    // ❌ WRONG - Breaks module boundaries
    export class AuthService {
        constructor(private userRepository: UserRepository) {}
    }

    // ✅ CORRECT - Use service layer
    export class AuthService {
        constructor(private userService: UserService) {}
    }
    ```

4. **Don't put business logic in repositories**

    ```typescript
    // ❌ WRONG - Business logic in repository
    async createUserAndSendEmail(userData: UserDto): Promise<User> {
        const user = await this.save(userData);
        await this.emailService.sendWelcome(user);  // ❌ Business logic
        return user;
    }

    // ✅ CORRECT - Keep repositories for data access only
    async createUser(userData: Partial<User>): Promise<User> {
        return this.save(userData);
    }
    ```

5. **Don't use forwardRef in repositories**
    ```typescript
    // ❌ WRONG - Indicates circular dependency
    constructor(
        @Inject(forwardRef(() => OtherRepository))
        private otherRepository: OtherRepository
    ) {}
    ```

---

## Handling Raw SQL Queries

When using raw SQL (`.query()`), you **MUST** manually add tenant filtering:

```typescript
// ❌ WRONG - No tenant filter
async customQuery(): Promise<any[]> {
    return this.manager.query(`
        SELECT * FROM users WHERE status = 'ACTIVE'
    `);
}

// ✅ CORRECT - Manual tenant filter required
async customQuery(): Promise<any[]> {
    const tenantId = this.requestContextService.getTenantId();
    return this.manager.query(`
        SELECT * FROM users
        WHERE status = 'ACTIVE'
        AND tenant_id = $1
    `, [tenantId]);
}
```

**Prefer TypeORM query builders** when possible to avoid manual tenant filtering.

---

## Database Views with Tenant Filtering

Database views **MUST** include `tenant_id` column:

```sql
-- ✅ CORRECT - Includes tenant_id
CREATE VIEW product_variant_view AS
SELECT
    pv.id,
    pv.tenant_id,  -- ✅ Include tenant_id
    pv.product_id,
    p.name AS product_name,
    pv.variant_name
FROM product_variants pv
JOIN products p ON pv.product_id = p.id;
```

Repository for view:

```typescript
@Injectable({ scope: Scope.REQUEST })
export class ProductVariantViewRepository extends TenantAwareRepository<ProductVariantView> {
    constructor(dataSource: DataSource, requestContextService: RequestContextService) {
        super(dataSource, ProductVariantView, requestContextService);
    }

    // ✅ Tenant filter applied automatically on view queries
    async findVariantsByProduct(productId: string): Promise<ProductVariantView[]> {
        return this.find({
            where: { productId }
        });
    }
}
```

---

## System-Wide Entities (Non-Tenant)

For **system-wide entities** (e.g., `Role`, `SystemSettings`) that are NOT tenant-scoped:

### Option 1: Use Standard Repository

```typescript
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Role } from "@core-database";

@Injectable() // ✅ No REQUEST scope needed
export class RoleRepository extends Repository<Role> {
    constructor(dataSource: DataSource) {
        super(Role, dataSource.createEntityManager());
    }

    async findByName(name: string): Promise<Role | null> {
        return this.findOne({ where: { name } });
    }
}
```

### Option 2: Direct Injection

For simple system entities, inject directly in service:

```typescript
@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>
    ) {}
}
```

---

## Repository Naming Conventions

### File Naming

- `{entity-name}.repository.ts` (e.g., `user.repository.ts`)
- Facade: `{module-name}.repository.ts` (e.g., `auth.repository.ts`)

### Class Naming

- Single entity: `{EntityName}Repository` (e.g., `UserRepository`)
- Facade: `{ModuleName}Repository` (e.g., `AuthRepository`)

### Method Naming

- `findBy{Criteria}` - Find entities by criteria
- `findOne{Criteria}` - Find single entity
- `create{Entity}` - Create new entity
- `update{Entity}` - Update existing entity
- `delete{Entity}` - Soft delete entity
- `get{Aggregation}` - Get computed/aggregated data

Examples:

```typescript
findByEmail(email: string)
findOneActiveByUserId(userId: string)
createUser(userData: Partial<User>)
updateUserStatus(userId: string, status: UserStatus)
deleteUser(userId: string)
getUserStatistics(userId: string)
```

---

## Testing Repositories

### Unit Test Example

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { UserRepository } from "./user.repository";
import { RequestContextService } from "@core-utilities";

describe("UserRepository", () => {
    let repository: UserRepository;
    let mockDataSource: jest.Mocked<DataSource>;
    let mockRequestContext: jest.Mocked<RequestContextService>;

    beforeEach(async () => {
        mockDataSource = {
            createEntityManager: jest.fn().mockReturnValue({})
        } as any;

        mockRequestContext = {
            getTenantId: jest.fn().mockReturnValue("tenant-123")
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                { provide: DataSource, useValue: mockDataSource },
                { provide: RequestContextService, useValue: mockRequestContext }
            ]
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
    });

    it("should automatically apply tenant filter", async () => {
        const findSpy = jest.spyOn(repository, "find");

        await repository.find({ where: { status: UserStatus.ACTIVE } });

        expect(mockRequestContext.getTenantId).toHaveBeenCalled();
        // Verify tenant filter was added automatically
    });
});
```

---

## Validation Checklist

Before committing a new repository:

- [ ] ✅ Extends `TenantAwareRepository<T>` (for tenant entities)
- [ ] ✅ Decorated with `@Injectable({ scope: Scope.REQUEST })`
- [ ] ✅ Injects `DataSource` and `RequestContextService`
- [ ] ✅ No manual `tenantId` filtering in methods
- [ ] ✅ Methods are focused and single-purpose
- [ ] ✅ No business logic (data access only)
- [ ] ✅ Returns only needed fields (selective queries)
- [ ] ✅ Properly registered in module providers
- [ ] ✅ NOT exported from module (only service exported)
- [ ] ✅ Uses TypeORM query builders for complex queries
- [ ] ✅ Raw SQL includes manual tenant filtering (if used)
- [ ] ✅ Unit tests cover tenant isolation

---

## Common Patterns

### Pattern: Soft Delete

```typescript
async deleteUser(userId: string): Promise<void> {
    await this.softDelete({ id: userId });
    // ✅ Tenant filter applied automatically
}

async findActiveUsers(): Promise<User[]> {
    return this.find({
        where: { deletedAt: IsNull() }
    });
}
```

### Pattern: Pagination

```typescript
async findPaginated(page: number, limit: number): Promise<[User[], number]> {
    return this.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" }
    });
    // ✅ Tenant filter applied automatically
}
```

### Pattern: Search with Multiple Conditions

```typescript
async searchUsers(searchTerm: string, status?: UserStatus): Promise<User[]> {
    const queryBuilder = this.createQueryBuilder("user");

    if (searchTerm) {
        queryBuilder.andWhere(
            "(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)",
            { search: `%${searchTerm}%` }
        );
    }

    if (status) {
        queryBuilder.andWhere("user.status = :status", { status });
    }

    // ✅ Tenant filter applied automatically by TenantAwareRepository
    return queryBuilder.getMany();
}
```

### Pattern: Transactions

```typescript
async createUserWithProfile(userData: Partial<User>, profileData: Partial<UserProfile>): Promise<User> {
    return this.manager.transaction(async (transactionalEntityManager) => {
        const user = this.create(userData);
        const savedUser = await transactionalEntityManager.save(user);

        const profile = transactionalEntityManager.create(UserProfile, {
            ...profileData,
            userId: savedUser.id
        });
        await transactionalEntityManager.save(profile);

        return savedUser;
    });
    // ✅ Tenant context maintained within transaction
}
```

---

## Summary

### Key Takeaways

1. **Always extend `TenantAwareRepository<T>`** for tenant-scoped entities
2. **Use `@Injectable({ scope: Scope.REQUEST })`** for request-scoped dependency injection
3. **Never manually add `tenantId` filters** - it's automatic
4. **One entity per repository** (or use Facade pattern for 3+)
5. **Repositories are module-private** - export services, not repositories
6. **Data access only** - no business logic in repositories
7. **Test tenant isolation** - verify tenant filtering works correctly

### Benefits

- 🛡️ **Guaranteed Tenant Isolation** - No cross-tenant data leaks
- 🚀 **Developer Productivity** - No repetitive tenant filtering code
- 🧪 **Easier Testing** - Consistent patterns, easy to mock
- 📈 **Maintainability** - Clear separation of concerns
- 🔒 **Security** - Tenant filtering enforced automatically

---

**This is the definitive guide for repository implementation in the Sports Engine multi-tenant application.**
