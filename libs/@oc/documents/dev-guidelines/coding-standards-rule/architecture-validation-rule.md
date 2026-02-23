# Code Generation & Validation Framework

This document provides a comprehensive framework for generating code following developer guidelines and validating it against coding standards.

## 🚀 **Code Generation Workflow**

### **Step 1: Analyze Requirements**

1. **Identify Module Type:** Determine if this is a new module or enhancement
2. **Review Prompts:** Check relevant developer guideline prompts:
    - Master Architecture Prompt for structure
    - Module-specific prompts for requirements
    - Example modules for reference patterns
3. **Gather Requirements:** List all endpoints, entities, and business logic needed

### **Step 2: Generate Module Structure**

Following the Master Architecture Prompt, generate:

#### **Entity Layer**

- Location: `libs/@oc/server-core/database/entities/{module}.entity.ts`
- Location: `libs/@oc/server-core/database/entities/{module}.entity.ts`
- Inherit from `BaseTenantEntity` (Multi-tenant) or `BaseModifiableEntity` (System-wide)
- `BaseTenantEntity` is the DEFAULT for all business modules
- Inherit from `Identity` for Auth/User modules only
- Use UUID primary keys
- Define relationships with `cascade: true`

#### **Business Logic Layer**

- Location: `libs/@oc/business-core/modules/{module}/`
- `repository.ts` - Direct database operations, selective data return
- `service.ts` - Business logic, orchestrate repositories
- `dto/request/` - Input validation using custom validators
- `dto/response/` - Output structure with mapping logic

#### **API Layer**

- Location: `src/modules/{module}/`
- `controller.ts` - Route definitions with Swagger docs
- `module.ts` - Module declarations and imports

### **Step 3: Apply Module-Specific Requirements**

- Follow module-specific prompts (Auth, User, etc.)
- Implement required endpoints and business logic
- Use defined ENUMs and constants
- Apply logging and caching patterns

## ✅ **Validation Process**

### **Phase 1: Auto-Validation Checklist**

#### **1. Folder Structure Validation**

- [ ] Files created in correct directories
- [ ] DTOs, entities, repositories, services in designated locations
- [ ] Index files properly created for exports

#### **2. DTO Standards Validation**

- [ ] **CRITICAL:** No class-validator usage (@IsString, @IsEmail, etc.)
- [ ] **CRITICAL:** Custom validators used from `libs/@oc/server-core/custom-validators/`
- [ ] **CRITICAL:** Type validation uses ONLY `ValidateType()` with `FieldTypeEnum` - NEVER @IsUUID, @IsString, @IsNumber, @IsDate, etc.
- [ ] **CRITICAL:** Response DTOs use private DTO classes for nested objects
- [ ] **CRITICAL:** Response DTO constructors contain only direct property mapping
- [ ] **CRITICAL:** Response DTOs NOT used as types - always instantiated with constructor (e.g., `new OtpLeftTimeResponseDto(remainingTime)`)
- [ ] **CRITICAL:** All mapping logic performed in DTO constructors only, NOT in service layers
- [ ] **CRITICAL:** DTO constructors MUST use strongly typed parameters (e.g., `constructor(court: Court)` NOT `constructor(court: any)`)
- [ ] **CRITICAL:** DTO constructors MUST map each field explicitly, one by one - NEVER use `Object.assign(this, data)`
- [ ] Request/Response DTOs properly separated
- [ ] Proper exports using index.ts files
- [ ] @ApiProperty decorators with examples

#### **3. Entity & Database Validation**

- [ ] UUID primary keys used
- [ ] `cascade: true` for relationships
- [ ] Soft-delete pattern implemented
- [ ] Base entity inheritance correct
- [ ] Constants used for field lengths
- [ ] **CRITICAL:** Unique constraints use standard format: `@Unique(DatabaseUniqueKey.EnumValue, ["field1", "field2"])`
- [ ] **CRITICAL:** No hardcoded constraint names - only DatabaseUniqueKey enum values
- [ ] **CRITICAL:** When defining `@ManyToOne` or `@OneToOne` relationships, `@JoinColumn()` MUST be used, explicitly specifying `name`, `referencedColumnName`

#### **4. Repository Patterns Validation**

- [ ] **CRITICAL:** Selective data return (not all fields)
- [ ] **CRITICAL:** TypeORM managers and query builders used
- [ ] **CRITICAL:** Defined ENUMs used (OrderDirection.DESC vs 'DESC')
- [ ] Complex queries optimized
- [ ] **CRITICAL:** No Circular Dependencies. Repositories must NOT depend on each other cyclically.
- [ ] **CRITICAL:** `forwardRef()` is strictly PROHIBITED in Repositories. Usage indicates a design flaw.
- [ ] **CRITICAL:** Unidirectional Dependency Flow: Service -> Facade Repo -> Base Repo -> Entity. Never upwards.

#### **5. Service Layer Validation**

- [ ] Business logic contained in services only
- [ ] **CRITICAL:** AppResponse syntax correct
- [ ] **CRITICAL:** Only use third parameter with SuccessConstant
- [ ] **CRITICAL:** Success messages in AppResponse MUST use SuccessConstant enum values, NEVER string literals (e.g., SuccessConstant.UpdateSuccessAction, not 'UPDATE_SUCCESS_ACTION')
- [ ] **CRITICAL:** Service methods MUST use strongly typed response DTOs in AppResponse return types, NEVER `AppResponse<any>`
- [ ] **CRITICAL:** Cross-Module Communication: Services MUST inject Services from other modules, NEVER Repositories.
- [ ] **CRITICAL:** Internal Data Fetching: Services SHOULD provide internal methods (e.g., `findOneById`) that return raw entities for other services to use, while public controller methods use `AppResponse`.
- [ ] Repository method calls only
- [ ] No direct database access

#### **6. Controller Layer Validation**

- [ ] No business logic in controllers
- [ ] Dedicated request DTOs with @Query()
- [ ] **CRITICAL:** ApiResponseStatus decorator includes response DTO as 4th parameter (mandatory for Swagger)
- [ ] All possible HTTP status codes passed to ApiResponseStatus
- [ ] Swagger documentation complete

#### **7. Permissions & Security Validation**

- [ ] **CRITICAL:** New modules added to MODULE_CONSTANTS in permissions.constant.ts
- [ ] **CRITICAL:** Module added to DEFAULT_PERMISSIONS with CRUD permissions
- [ ] **CRITICAL:** @RequirePermissions decorator used in controllers with module and permission constants
- [ ] **CRITICAL:** Guards applied: @UseGuards(RolesGuard, AuthGuard)
- [ ] **CRITICAL:** @ApiBearerAuth() decorator present on protected endpoints

#### **8. Error Handling Validation**

- [ ] **CRITICAL:** Standardized error messages from error.json
- [ ] **CRITICAL:** Pattern: `throw new NotFoundException({ message: 'ERR_MODULE_NOT_FOUND', module: MapToModuleName(ModuleName.USER) })`
- [ ] **CRITICAL:** NEVER use hardcoded module name strings - ALWAYS use `MapToModuleName(ModuleName.ENUM_VALUE)`
- [ ] **CRITICAL:** ModuleName enum values MUST be used instead of string literals for type safety
- [ ] NestJS HttpExceptions used
- [ ] Appropriate error keys:
    - `ERR_MODULE_NOT_FOUND` - Resource not found
    - `ERR_MIN_LENGTH`/`ERR_MAX_LENGTH` - Length validation
    - `ERR_REQUIRED` - Required fields
    - `ERR_TYPE`/`ERR_IS_ENUM` - Type validation
    - `ERR_DELETED` - Deleted resources
    - `ERR_NOT_VALID` - General validation

#### **8. Constants & Configuration**

- [ ] Constants in `libs/@oc/server-core/constants`
- [ ] PascalCase naming (CustomerConstant)
- [ ] Keys in PascalCase (AddSuccessAction)
- [ ] ConfigService for environment variables

#### **9. Module Naming Standards**

- [ ] **CRITICAL:** All module name references MUST use `ModuleName` enum values
- [ ] **CRITICAL:** NEVER use hardcoded module name strings (e.g., `"User"`, `"ProductVariant"`)
- [ ] **CRITICAL:** Always use `MapToModuleName(ModuleName.ENUM_VALUE)` for human-readable names
- [ ] **CRITICAL:** Controllers must define module-level constants: `const MODULE_NAME = MapToModuleName(ModuleName.YOUR_MODULE);`
- [ ] **CRITICAL:** @ApiResponseStatus decorators MUST use the module constant, not hardcoded strings
- [ ] **CRITICAL:** Error messages in services MUST use `MapToModuleName(ModuleName.ENUM_VALUE)`
- [ ] **CRITICAL:** Success messages MUST use `MapToModuleName(ModuleName.ENUM_VALUE)` for consistency
- [ ] ModuleName enum values provide type safety and prevent typos
- [ ] Human-readable names ensure user-friendly error messages and API documentation

#### **10. Multi-Tenancy Validation**

- [ ] **CRITICAL:** Entities MUST extend `BaseTenantEntity` (unless strictly system-wide)
- [ ] **CRITICAL:** Repositories MUST extend `TenantAwareRepository<T>`
- [ ] **CRITICAL:** Repositories MUST be decorated with `@Injectable({ scope: Scope.REQUEST })`
- [ ] **CRITICAL:** Repositories MUST inject `RequestContextService`
- [ ] **CRITICAL:** NEVER inject standard TypeORM `Repository<T>` into Services or other Repositories for Tenant entities. Always create and inject a specific `TenantAwareRepository` implementation.
- [ ] **CRITICAL:** Database Views MUST include `tenant_id` column
- [ ] **CRITICAL:** Raw SQL queries (`.query()`) MUST manually include `tenant_id` filter

#### **11. Repository Architecture Pattern (AuthRepository Rule)**

- [ ] **CRITICAL:** Repositories handling 3+ entities MUST use Facade pattern (like AuthRepository)
- [ ] **CRITICAL:** Facade repositories MUST be `@Injectable({ scope: Scope.REQUEST })`
- [ ] **CRITICAL:** Facade repositories MUST inject dedicated `TenantAwareRepository` instances only
- [ ] **CRITICAL:** NEVER inject standard TypeORM `Repository<T>` in facade repositories
- [ ] **CRITICAL:** Each entity in facade MUST have dedicated repository extending `TenantAwareRepository`
- [ ] **CRITICAL:** Dedicated repositories MUST be `@Injectable({ scope: Scope.REQUEST })`
- [ ] **CRITICAL:** Zero manual tenant filtering - rely on automatic `TenantAwareRepository` filtering
- [ ] **CRITICAL:** No circular dependencies: Service → Facade → Dedicated Repos → TenantAwareRepository
- [ ] **CRITICAL:** Monolithic repositories >500 lines MUST be split using facade pattern
- [ ] **CRITICAL:** Cross-entity operations MUST use facade repositories, not direct repository injection

#### **12. Module Boundaries & Circular Dependencies** ⚠️

- [ ] **CRITICAL:** Modules MUST NEVER export repositories in their `exports` array.
- [ ] **CRITICAL:** Modules MUST ONLY export Services (repositories are private implementation).
- [ ] **CRITICAL:** Cross-module data access MUST use Service-to-Service communication ONLY.
- [ ] **CRITICAL:** Services MUST NEVER inject repositories from other modules.
- [ ] **CRITICAL:** Services MUST NEVER import repository classes from other modules.
- [ ] **CRITICAL:** **Anti-Circular Pattern:** If Module A needs B and Module B needs A, you MUST create a third "Orchestrator Service" or "Facade Module" that depends on both to break the cycle.
- [ ] **CRITICAL:** `forwardRef()` is strictly PROHIBITED as a solution for circular dependencies. It indicates a design flaw that must be refactored.
- [ ] **CRITICAL:** Unidirectional flow must be maintained: Controller -> Service -> Repository. Never Repository -> Service.
- [ ] Each module owns its repositories — no direct sharing across module boundaries.
- [ ] Bypassing service layer breaks tenant safety and module encapsulation.
- [ ] Create dedicated service methods for cross-module operations.
- [ ] See detailed guide: `no-direct-repository-sharing.md`

### **Phase 2: Code Quality Validation**

#### **Import & Path Aliases**

- [ ] **CRITICAL:** tsConfig path aliases used for ALL imports
- [ ] **CRITICAL:** NO relative imports (e.g., `../../../module/file`)
- [ ] **CRITICAL:** NO hardcoded absolute paths (e.g., `libs/@oc/...`)
- [ ] Proper re-exports from index.ts files

#### **TypeScript & NestJS Standards**

- [ ] async/await for all async operations
- [ ] Proper TypeScript types
- [ ] Logger integration with GenerateLogPrefix
- [ ] Comments for methods/classes

#### **API Standards**

- [ ] RESTful naming (plural nouns)
- [ ] Correct HTTP methods
- [ ] Standard status codes
- [ ] API versioning where needed

### **Phase 3: Business Logic Validation**

#### **List Endpoints**

- [ ] Search functionality implemented
- [ ] Filtering capabilities
- [ ] Pagination support
- [ ] Sorting with ENUMs
- [ ] CommonSearchResponseDto usage

#### **Data Integrity**

- [ ] Soft-delete implementation
- [ ] Transaction usage for multi-step operations
- [ ] Proper error handling
- [ ] Data validation rules

## 🔧 **File Update Procedures**

### **When Standards Are Violated:**

#### **Critical Violations (Must Fix):**

1. **class-validator usage** → Replace with custom validators
2. **class-validator type decorators** → Use ValidateType() with FieldTypeEnum (NEVER @IsUUID, @IsString, @IsNumber, @IsDate, etc.)
3. **Inline object types in DTOs** → Create private DTO classes
4. **Hardcoded strings instead of ENUMs** → Use defined enums
5. **All fields returned from repository** → Implement selective returns
6. **Non-standard error messages** → Use error.json keys
7. **Business logic in constructors** → Move to direct property mapping
8. **Response DTOs used as types** → Always instantiate with constructor (e.g., `new ResponseDto(data)`)
9. **Mapping logic in service layer** → Move all mapping to DTO constructors
10. **Hardcoded constraint names** → Use DatabaseUniqueKey enum values
11. **Non-standard @Unique format** → Use `@Unique(DatabaseUniqueKey.EnumValue, ["field1", "field2"])`
12. **Non-standard @JoinColumn usage** → For `@ManyToOne` or `@OneToOne` relationships, `@JoinColumn()` MUST be used, explicitly specifying `name`, `referencedColumnName`
13. **Missing response DTO in ApiResponseStatus** → Always pass response DTO as 4th parameter for Swagger documentation
14. **Relative or hardcoded import paths** → Use ONLY tsConfig path aliases (e.g., `@business-core-modules`)
15. **Hardcoded module name strings** → Use `MapToModuleName(ModuleName.ENUM_VALUE)` instead of string literals like `"User"`
16. **Missing ModuleName enum usage** → All module references MUST use ModuleName enum values for type safety
17. **Missing permissions setup** → Add module to MODULE_CONSTANTS and DEFAULT_PERMISSIONS when creating new modules
18. **Missing security decorators** → Use @RequirePermissions, @UseGuards, @ApiBearerAuth on all protected endpoints
19. **DTO constructors using `any` type parameters** → Use strongly typed parameters (e.g., `Court` instead of `any`)
20. **DTO constructors using `Object.assign(this, data)`** → Map each field explicitly, one by one
21. **String literals for success messages in AppResponse** → Use SuccessConstant enum values instead of hardcoded strings
22. **Entity missing tenant context** → Extend `BaseTenantEntity` instead of `BaseModifiableEntity`
23. **Repository bypassing tenant filters** → Extend `TenantAwareRepository` instead of standard `Repository`
24. **Repository missing request context** → Add `@Injectable({ scope: Scope.REQUEST })`
25. **Non-facade repository pattern** → Use AuthRepository facade pattern for multi-entity operations
26. **Standard Repository injection in facades** → Only inject TenantAwareRepository implementations
27. **Manual tenant filtering in facades** → Remove manual filtering, use automatic TenantAwareRepository filtering
28. **Circular repository dependencies** → Restructure using facade pattern to eliminate cycles
29. **Repositories exported from modules** → Remove repositories from module exports array, only export services
30. **Services injecting cross-module repositories** → Inject services instead of repositories from other modules
31. **Direct repository imports from other modules** → Import and inject services only, never repositories
32. **Missing service methods for cross-module operations** → Create dedicated service methods instead of direct repository access
33. **Circular Module Dependencies** → Refactor to use a third "Orchestrator" service/module to break the cycle
34. **Usage of `forwardRef()`** → Strictly prohibited; refactor the architecture to ensure unidirectional flow
35. **Missing internal service methods** → Add methods like `findOneById` to services for cross-module entity retrieval instead of exporting repositories

#### **Medium Violations (Should Fix):**

1. Missing Swagger documentation
2. Missing error handling
3. Incomplete constant usage

#### **Low Violations (Nice to Have):**

1. Code comments improvement
2. Performance optimizations
3. Documentation updates

## 📋 **Validation Report Template**

```markdown
# Code Validation Report

## Summary

- **Total Files Reviewed:** X
- **Critical Issues:** X
- **Medium Issues:** X
- **Low Issues:** X
- **Status:** ✅ APPROVED / ❌ REJECTED

## Critical Issues Found

1. **File:** `path/to/file.ts`
    - **Line:** X
    - **Issue:** Description
    - **Rule Violated:** Coding Standard X
    - **Required Fix:** Specific action needed

## Medium Issues Found

[Similar format]

## Recommendations

- Improvements that would enhance code quality
- Best practices to consider for future development
```

## 🎯 **Quick Reference**

### **Common Error Keys**

```typescript
// ❌ WRONG - Hardcoded module name strings
throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: "User" });

// ✅ CORRECT - ModuleName enum with MapToModuleName
import { MapToModuleName, ModuleName } from "@core-utilities";

throw new NotFoundException({
    message: "ERR_MODULE_NOT_FOUND",
    module: MapToModuleName(ModuleName.USER)
});

// Validation (no module names needed)
throw new BadRequestException({ message: "ERR_REQUIRED", field: "email" });
throw new BadRequestException({ message: "ERR_MAX_LENGTH", field: "name", max: "50" });
throw new BadRequestException({ message: "ERR_NOT_VALID", field: "email" });
```

### **Module Naming Standards**

```typescript
// ❌ WRONG - Direct string usage
module: "User"
@ApiResponseStatus("...", "User", UserResponseDto)

// ✅ CORRECT - Enum-based with mapping
import { MapToModuleName, ModuleName } from "@core-utilities";

// In controller (module-level constant for decorators)
const USER_MODULE_NAME = MapToModuleName(ModuleName.USER);

@ApiResponseStatus("...", USER_MODULE_NAME, UserResponseDto)

// In service (direct usage)
throw new NotFoundException({
    message: "ERR_MODULE_NOT_FOUND",
    module: MapToModuleName(ModuleName.USER)
});

return new AppResponse(SuccessConstant.AddSuccessAction, data, {
    module: MapToModuleName(ModuleName.USER)
});
```

### **Required AppResponse Patterns**

```typescript
import { MapToModuleName, ModuleName } from "@core-utilities";

// Specific actions (create/update/delete)
return new AppResponse(SuccessConstant.AddSuccessAction, data, {
    module: MapToModuleName(ModuleName.USER)
});

// Generic actions
return new AppResponse(SuccessConstant.SuccessAction, data, {
    module: MapToModuleName(ModuleName.USER),
    action: "retrieved"
});
```

### **ENUM Usage**

```typescript
// ❌ Wrong
orderBy: "DESC";

// ✅ Correct
orderBy: OrderDirection.DESC;
```

---

**This framework ensures consistent, high-quality code generation and validation across all modules.**
