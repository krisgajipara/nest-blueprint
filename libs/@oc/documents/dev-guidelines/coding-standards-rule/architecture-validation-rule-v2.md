# Architecture Codebase Validation Rules (Minimized Checklist)

This document provides a strict, high-density validation checklist for code reviews. Use this to programmatically or manually detect architectural violations.

## 1. Module Boundaries & Circular Dependencies
- [ ] **Strictly Service-to-Service:** Verify that **only** Services are injected across module boundaries.
  - **Violation Identity:** Constructor imports `Repository` classes from other modules (e.g., `import { UserRepository }` inside `AuthService`).
  - **Violation Identity:** Constructor uses `@InjectRepository()` for an entity belonging to another module.
- [ ] **No Circular Dependencies:**
  - **Violation Identity:** Usage of `forwardRef()`. STRICTLY PROHIBITED. Use an Orchestrator Service or Facade Module instead.
  - **Anti-Circular Pattern:** If Module A needs B and B needs A, create a third "Orchestrator Service" or "Facade Module".
- [ ] **Unidirectional Flow:**
  - **Violation Identity:** Repository calling a Service.
  - **Violation Identity:** Entity calling a Service or Repository.
  - **Rule:** Controller -> Service -> Repository. Never Upwards.
- [ ] **Encapsulation:**
  - **Violation Identity:** `module.ts` `exports` array containing a Repository class. Only Services should be exported.
  - **Rule:** Each module owns its repositories — no direct sharing across components.
- [ ] **Imports:**
  - **Violation Identity:** Imports starting with `../../` or absolute paths. Must use tsConfig aliases (e.g., `@business-core-modules/...`).

## 2. DTO Standards
- [ ] **Validation Decorators:**
  - **Violation Identity:** Usage of `class-validator` decorators (`@IsString`, `@IsInt`, `@IsUUID`, `@IsOptional`).
  - **Requirement:** Must use `@ValidateType()` with `FieldTypeEnum` and custom validators from `@core-custom-validators`.
- [ ] **Explicit Mapping:**
  - **Violation Identity:** usage of `Object.assign(this, data)` or `this = { ...data }` in constructors.
  - **Requirement:** Every property must be explicitly assigned line-by-line (e.g., `this.firstName = entity.firstName;`).
- [ ] **Strong Typing:**
  - **Violation Identity:** Constructor parameter typed as `any`.
  - **Requirement:** Input types must be concrete Entities or DTOs (e.g., `constructor(court: Court)` NOT `any`).
- [ ] **Response Structure:**
  - **Violation Identity:** Returning object literals `return { id: 1 }` typed as a DTO.
  - **Requirement:** Must explicitly instantiate the DTO using constructor (e.g., `new UserResponseDto(user)`).
  - **Requirement:** Response DTOs NOT used as types.
- [ ] **Nested Objects:**
  - **Requirement:** Complex nested objects must use their own private DTO class definition within the same file.
- [ ] **Mapping Logic:**
  - **CRITICAL:** All mapping logic performed in DTO constructors only, NOT in service layers.

## 3. Entity & Database
- [ ] **Multi-Tenancy:**
  - **Requirement:** Business entities must extend `BaseTenantEntity` (adds `tenant_id`). System entities extend `BaseModifiableEntity`.
- [ ] **Primary Keys:**
  - **Requirement:** Must use UUIDs (`@PrimaryGeneratedColumn('uuid')`).
- [ ] **Field Constants:**
  - **Violation Identity:** Hardcoded integers for length (e.g., `length: 255`).
  - **Requirement:** Use constants from `@core-constants` (e.g., `TableFieldLength.NAME`).
- [ ] **Relationships:**
  - **Requirement:** Explicit `@JoinColumn({ name: '...', referencedColumnName: '...' })` on `@ManyToOne`/`@OneToOne`.
  - **Check:** Ensure `cascade: true` is enabled if parent manages child lifecycle.
- [ ] **Constraints:**
  - **Violation Identity:** Hardcoded constraint name strings.
  - **Requirement:** Use `@Unique(DatabaseUniqueKey.ENUM_VALUE, ['fields'])` and `DatabaseUniqueKey` enum.

## 4. Repository & Multi-Tenancy Patterns
- [ ] **Inheritance:**
  - **Requirement:** Repositories for tenant entities **MUST** extend `TenantAwareRepository<T>`.
  - **Violation Identity:** `extends Repository<T>` is prohibited for business data.
- [ ] **Scope:**
  - **Requirement:** Must be `@Injectable({ scope: Scope.REQUEST })` and inject `RequestContextService`.
- [ ] **Facade Pattern (AuthRepository Rule):**
  - **Check:** Modules with 3+ entities must use a Facade Repository.
  - **CRITICAL:** Facade repositories MUST be `@Injectable({ scope: Scope.REQUEST })`.
  - **CRITICAL:** Facade repositories MUST inject dedicated `TenantAwareRepository` instances only.
  - **CRITICAL:** Monolithic repositories >500 lines MUST be split using facade pattern.
  - **CRITICAL:** Cross-entity operations MUST use facade repositories.
- [ ] **Data Access:**
  - **Violation Identity:** Manually adding `.where('tenant_id = :id')` (Base class handles this).
  - **Violation Identity:** Usage of `.query()` (Raw SQL) without binding `tenant_id` manually.
  - **CRITICAL:** Database Views MUST include `tenant_id` column.
- [ ] **Optimization:**
  - **Requirement:** Repositories should default to matching specific `select: []` fields, avoiding `SELECT *`.
  - **CRITICAL:** Defined ENUMs used for ordering (e.g., `OrderDirection.DESC`).

## 5. Service & Controller Layer (CRITICAL)
- [ ] **Controller Logic:**
  - **Violation Identity:** Controllers containing `if/else`, loops, or data transformation.
  - **Violation Identity:** Controllers instantiating classes (`new Dto()`).
- [ ] **Swagger:**
  - **Requirement:** `@ApiResponseStatus` must include the Response DTO class as the **4th parameter**.
  - **Violation Identity:** Usage of `@ApiQuery` decorators when query DTO is already decorated with `@ApiProperty` or `@ApiPropertyOptional`.
  - **Requirement:** Rely on DTO decorations for automatic Swagger documentation. Only use `@ApiQuery` for complex cases not covered by DTOs.
- [ ] **Security:**
  - **Requirement:** Protected routes must have `@RequirePermissions`, `@UseGuards`, `@ApiBearerAuth`.
  - **CRITICAL:** New modules added to `MODULE_CONSTANTS` and `DEFAULT_PERMISSIONS`.
- [ ] **Service AppResponse:**
  - **Violation Identity:** `return { data: ... }` or missing third parameter object.
  - **Requirement:** `new AppResponse(SuccessConstant.ENUM, data, { module: ... })`.
  - **CRITICAL:** Success messages MUST use `SuccessConstant` enum values, NEVER string literals.
- [ ] **Type Safety:**
  - **Violation Identity:** Return type `Promise<AppResponse<any>>`.
  - **Requirement:** Return type must be `Promise<AppResponse<YourResponseDto>>`.
- [ ] **Internal Data Fetching:**
  - **CRITICAL:** Services SHOULD provide internal methods (e.g., `findOneById`) returning raw entities for other services, while public controller methods use `AppResponse`.
- [ ] **DB Isolation:**
  - **Violation Identity:** Service injecting `DataSource`, `EntityManager`, or `QueryRunner`.
  - **Violation Identity:** Service using `repo.createQueryBuilder`.
  - **Requirement:** Service calls semantic Repository methods only (e.g., `repo.findActiveUsers()`).

## 6. Error Handling
- [ ] **Standard Keys:**
  - **Violation Identity:** Hardcoded error strings `'User not found'`.
  - **Requirement:** Use `error.json` keys (e.g., `ERR_MODULE_NOT_FOUND`) and `MapToModuleName`.
- [ ] **Module Naming Standards:**
  - **CRITICAL:** All module name references MUST use `ModuleName` enum values.
  - **CRITICAL:** NEVER use hardcoded module name strings (e.g., "User").
  - **CRITICAL:** Always use `MapToModuleName(ModuleName.ENUM_VALUE)`.
- [ ] **Patterns:**
  - **Pattern:** `throw new NotFoundException({ message: 'ERR_MODULE_NOT_FOUND', module: MapToModuleName(ModuleName.USER) })`.
  - **Requirement:** Use specific NestJS Exceptions (`NotFoundException`, `ConflictException`).
  - **Requirement:** 400 Bad Request errors must include `field`, `message`, and metadata.

## 7. Code Quality Validation
- [ ] **Import & Path Aliases:**
  - **CRITICAL:** tsConfig path aliases used for ALL imports.
  - **CRITICAL:** NO relative imports (e.g., `../../../module/file`).
  - **CRITICAL:** NO hardcoded absolute paths (e.g., `libs/@oc/...`).
  - **Requirement:** Proper re-exports from `index.ts` files.
- [ ] **TypeScript & NestJS Standards:**
  - **Requirement:** `async/await` for all async operations.
  - **Requirement:** Proper TypeScript types (no `any`).
  - **Requirement:** Logger integration with `GenerateLogPrefix`.
  - **Requirement:** Comments for methods/classes explaining logic.
- [ ] **API Standards:**
  - **Requirement:** RESTful naming (plural nouns).
  - **Requirement:** Correct HTTP methods (GET, POST, PUT, DELETE).
  - **Requirement:** Standard status codes (200, 201, 204, 400, 403, 404).
  - **Requirement:** API versioning where needed.

## 8. Business Logic Validation
- [ ] **List Endpoints:**
  - **Requirement:** Search functionality implemented.
  - **Requirement:** Filtering capabilities.
  - **Requirement:** Pagination support.
  - **Requirement:** Sorting with `SORT_MAP: Record<string, string>` (no switch/if-else).
  - **Requirement:** `CommonSearchResponseDto` usage.
- [ ] **Data Integrity:**
  - **Requirement:** Soft-delete implementation.
  - **Requirement:** Transaction usage for multi-step operations.
  - **Requirement:** Proper error handling with standard keys.
  - **Requirement:** Data validation rules.

## 9. File Update Procedures (Violation Handling)

### **Critical Violations (Must Fix)**
- [ ] `class-validator` usage → Replace with custom validators
- [ ] `class-validator` type decorators → Use `ValidateType()` with `FieldTypeEnum`
- [ ] Inline object types in DTOs → Create private DTO classes
- [ ] Hardcoded strings instead of ENUMs → Use defined enums
- [ ] All fields returned from repository → Implement selective returns
- [ ] Non-standard error messages → Use `error.json` keys
- [ ] Business logic in constructors → Move to direct property mapping
- [ ] Response DTOs used as types → Always instantiate with constructor
- [ ] Mapping logic in service layer → Move all mapping to DTO constructors
- [ ] Hardcoded constraint names → Use `DatabaseUniqueKey` enum values
- [ ] Non-standard `@Unique` format → Use `@Unique(DatabaseUniqueKey.EnumValue, ["field1", "field2"])`
- [ ] Non-standard `@JoinColumn` usage → Must specify `name` and `referencedColumnName`
- [ ] Missing response DTO in `ApiResponseStatus` → Always pass response DTO as 4th parameter
- [ ] Redundant `@ApiQuery` decorators → Remove when DTOs provide sufficient documentation
- [ ] Relative or hardcoded import paths → Use ONLY tsConfig path aliases
- [ ] Hardcoded module name strings → Use `MapToModuleName(ModuleName.ENUM_VALUE)`
- [ ] Missing permissions setup → Add module to `MODULE_CONSTANTS` and `DEFAULT_PERMISSIONS`
- [ ] Missing security decorators → Use `@RequirePermissions`, `@UseGuards`, `@ApiBearerAuth`
- [ ] DTO constructors using `any` → Use strongly typed parameters
- [ ] DTO constructors using `Object.assign` → Map each field explicitly
- [ ] String literals for success messages → Use `SuccessConstant` enum values
- [ ] Entity missing tenant context → Extend `BaseTenantEntity`
- [ ] Repository bypassing tenant filters → Extend `TenantAwareRepository`
- [ ] Repository missing request context → Add `@Injectable({ scope: Scope.REQUEST })`
- [ ] Non-facade repository pattern → Use Facade pattern for 3+ entities
- [ ] Manual tenant filtering in facades → Remove, rely on `TenantAwareRepository`
- [ ] Services injecting repos from other modules → Inject Services only
- [ ] Direct repo imports from other modules → Import Services only
- [ ] Usage of `forwardRef()` → Strictly prohibited, use Facade/Orchestrator
- [ ] Circular Module Dependencies → Refactor with Orchestrator service
- [ ] Sorting using switch/if-else → Use SORT_MAP pattern

### **Medium Violations (Should Fix)**
- [ ] Missing Swagger documentation
- [ ] Missing error handling
- [ ] Incomplete constant usage

### **Low Violations (Nice to Have)**
- [ ] Code comments improvement
- [ ] Performance optimizations
- [ ] Documentation updates

## 10. Validation Report Template

```markdown
# Code Validation Report

## Summary
- **Total Files Reviewed:** X
- **Critical Issues:** X
- **Medium Issues:** X
- **Status:** ✅ APPROVED / ❌ REJECTED

## Critical Issues Found
1. **File:** `path/to/file.ts`
   - **Line:** X
   - **Issue:** Description
   - **Rule Violated:** Coding Standard X
   - **Required Fix:** Specific action needed
```
