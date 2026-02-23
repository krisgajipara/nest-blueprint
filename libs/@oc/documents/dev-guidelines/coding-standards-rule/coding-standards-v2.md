# Coding Standards Rule Book - Minimized Summary (All Details Preserved)

## Table of Contents
1. [Folder Structure](#1-folder-structure)
2. [DTOs](#2-dtos)
3. [Entities & Database](#3-entities--database)
4. [Naming](#4-naming)
5. [Technology Stack & Patterns](#5-tech-stack--patterns)
6. [APIs & Endpoints](#6-apis--endpoints)
7. [Error Handling & Validation](#7-error-handling--validation)
8. [Code Quality & Style](#8-code-quality--style)
9. [Constants](#9-constants)
10. [Reusability & Modularity](#10-reusability--modularity)
11. [Dependencies & Circular](#11-dependencies--circular)
12. [REST API Standards](#12-rest-api-standards)
13. [Permissions & Security](#13-permissions--security)
14. [Multi-Tenancy Standards](#14-multi-tenancy-standards)

## 1. Folder Structure
- **Core:** `libs/@oc/server-core` (entities, repos, services, DTOs, enums, migrations, shared modules).
- **APIs:** `src/modules/{module}` (controllers, Nest modules).
- **Business:** `libs/@oc/business-core/modules/{module}/` (per-module logic).
- **DTOs:** `libs/@oc/business-core/modules/{module}/dto/{request|response}`.
- **Enums:** `libs/@oc/server-core/enums`.
- **Utils/Decorators:** `libs/@oc/server-core/utilities`, `libs/@oc/server-core/shared-modules`.
- **Constants:** `libs/@oc/server-core/constants` (entity lengths, business logic).

## 2. DTOs
- **Separation:** Every API must have DTOs separated into `request` and `response` folders per module.
- **Validation:** STRICTLY prioritize custom validators from `libs/@oc/server-core/custom-validators/`. NEVER use class-validator decorators. If a custom validator doesn't exist for your validation need, it must be added to the custom validators library.
- **Type Validation - STRICT RULE:** NEVER use class-validator type decorators (`@IsUUID()`, `@IsDateString()`, `@IsDate()`, `@IsBooleanString()`, `@IsBoolean()`, `@IsNumberString()`, `@IsNumber()`, `@IsString()`). ALWAYS use `ValidateType()` with appropriate `FieldTypeEnum` value. Available types: String, Number, NumberString, Boolean, BooleanString, Date, DateString, UUID, Array.
- **Response DTOs Schema:** NEVER create inline object types in response DTOs. Create private DTO classes for nested objects instead.
- **Response DTOs Constructor:** Response DTOs must contain mapping logic from entities within their constructors. DO NOT use entity methods or business logic in constructors - only direct property mapping.
- **Response DTOs Instantiation: CRITICAL** - Do NOT use response DTOs as types when instantiating them. Always instantiate response DTOs directly using their constructor with mapping logic.
- **Mapping Logic Location:** All mapping logic MUST be done exclusively in the DTO's constructor. DO NOT perform mapping or transformation in service layers. The service layer should pass raw data directly to the DTO constructor.
- **Repository to DTO Mapping:** Response DTOs must contain mapping logic from entities within their constructors. The service layer will pass the object received from the repository directly to the response DTO's constructor for mapping (pass the whole object, not individual properties).
- **Exports:** All DTOs within a module's `request` and `response` directories must be re-exported from an `index.ts` file in their respective directories and then from a `dto/index.ts` file.
- **Imports:** Always use tsconfig path aliases for importing DTOs (e.g., from `@business-core-modules`).
- **Swagger:** All DTOs must use proper validator decorators for Swagger via `@ApiProperty`.
  - **STRICT RULE - @ApiProperty Usage for DTO/Object Types:** When the property type is a DTO class or Object, NEVER use `example` property in `@ApiProperty()` decorator. ALWAYS use `type` property and assign the appropriate DTO class or TypeScript type. ALWAYS provide meaningful `description` for API documentation.

## 3. Entities & Database
- **PKs:** UUID (`@PrimaryGeneratedColumn('uuid')`).
- **Relationships:** `cascade: true`.
- **Deletes:** Soft-delete with `softRemove()` (not `remove()`/`delete()`).
- **Inheritance:** `BaseModifiableEntity` + `Identity`.
- **Unique:** Define in `DatabaseUniqueKey` enum (`UK_{TABLE}_{FIELDS}`); use `@Unique(DatabaseUniqueKey.X, ["fields"])`.

## 4. Naming
- **Files:** Kebab-case (e.g., `user-module.ts`).
- **Classes:** PascalCase (e.g., `UserModule`).

## 5. Tech Stack & Patterns
- **NestJS, TS, PostgreSQL, TypeORM.**
- **Env:** Via `ConfigService`.
- **Docs:** Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`).
- **Responses:** `ApiResponseStatus(description, statuses, module, responseDto)` - responseDto as 4th param MANDATORY.
- **Enums:** Postgres enums or TS string enums.

## 6. APIs & Endpoints
- **Controllers:** Handle incoming requests, validate input DTOs, call service methods, and return responses. No business logic. When APIs require query parameters, always use dedicated request DTOs with `@Query()` instead of individual parameters (global ValidationPipe handles validation).
- **Services:** Contain all business logic, orchestrate repositories and other services. Return `AppResponse` objects using the `new AppResponse(SuccessConstant.AddSuccessAction, { data }, { module: "ModuleName" })` syntax for specific actions, or `new AppResponse(SuccessConstant.SuccessAction, { data }, { module: "ModuleName", action: "actionName" })` for generic actions. Only use the third parameter when using SuccessConstant. For other success messages, omit the third parameter.
- **Repositories:** Handle direct database access and complex queries. SELECTIVELY RETURN DATA - never return all fields from repository level. Return only what the API needs for optimal performance.
- **Query Builder:** Use TypeORM Query Builder with managers where possible for complex queries. ALWAYS use defined ENUMs instead of hardcoded strings.
- **List Endpoints:** All list endpoints must implement searching, filtering, pagination, and sorting.
- **Return Shape:** List endpoints should return data in the shape `{ data: [...], total: number, limit, offset }` using `CommonSearchResponseDto`.
- **Search API Implementation - STRICT RULE:** Controller Decorator: Use `CommonSearchResponseDto` as 4th parameter and entity DTO as 5th parameter in `ApiResponseStatus`. Return Type: `AppResponse<CommonSearchResponseDto<EntityDto>>`. Service Response: Instantiate `new CommonSearchResponseDto<EntityDto>(results, pageSize, page, total)`.

## 7. Error Handling & Validation
- **Pipe:** Global `ValidationPipe`.
- **Exceptions:** `HttpExceptions` with standardized msgs from `error.json` (e.g., `{message: "ERR_MODULE_NOT_FOUND", module: "X"}`).
- **Error Keys:** `ERR_MODULE_NOT_FOUND`, `ERR_MIN_LENGTH`, `ERR_MAX_LENGTH`, `ERR_REQUIRED`, `ERR_TYPE`, `ERR_IS_ENUM`, `ERR_DELETED`, `ERR_NOT_VALID`, `ERR_ALPHA_NUMERIC`, `ERR_UNIQUE_ARRAY_ITEM`, `ERR_ONLY_SPACE`, `ERR_MIN_VALUE`, `ERR_MAX_VALUE`.

## 8. Code Quality & Style
- **Swagger:** Provide Swagger documentation for every endpoint.
- **Comments:** Add inline comments to describe the purpose of methods and classes.
- **CRITICAL - Import Rules:** NEVER use relative paths or hardcoded absolute paths. ALWAYS use tsConfig path aliases for ALL imports. All DTOs and modules must be properly re-exported through `index.ts` files to enable clean imports from root aliases. Common aliases: `@business-core-modules`, `@business-core-dto`, `@core-database`, `@core-enums`, `@core-utilities`, `@core-custom-validators`, `@core-custom-decorators`.
- **Asynchronous Code:** Use `async/await` for all asynchronous operations. Precise Async Usage: Only declare methods as `async` when they actually perform asynchronous operations (contain `await`). Remove `async` keyword from methods that just return Promises directly.
- **AppResponse Usage:** The third parameter controls dynamic message generation. Module only: `{ module: 'Entity' }` → "Entity list fetched successfully". Module + Action: `{ module: 'Entity', action: 'created' }` → "Entity has been created successfully". Omit parameter: For custom messages or when SuccessConstant provides exact text.
- **Transactions:** Use TypeORM's `QueryRunner` for multi-step database changes.

## 9. Constants
- **Location:** Constants for entity field lengths and common business logic should be in `libs/@oc/server-core/constants`.
- **Usage:** For entity string columns with length constraints, define constants for these lengths and reuse them in DTOs for validation.
- **Structure:** Per entity, there should be only one constant file containing all length/constant values.
- **Naming:** Constants should be named in PascalCase, e.g., `CustomerConstant`. Keys within constant objects should also be in PascalCase, e.g., `AddSuccessAction` instead of `ADD_SUCCESS_ACTION`.
- **AppResponse Usage:** When services return `AppResponse`, the first parameter must be from `SuccessConstant`. For specific actions like create/update/delete, use predefined constants (e.g., `SuccessConstant.AddSuccessAction`). For generic actions, use `SuccessConstant.SuccessAction` and pass both `module` and `action` as the third parameter to generate messages like "{module} has been {action} successfully."

## 10. Reusability & Modularity
- **Self-contained modules.**
- **Translations:** In translation module.
- **Utils:** `libs/@oc/server-core/utilities` or `shared-modules`.

## 11. Dependencies & Circular
- **🚫 STRICT RULE: No Circular Dependencies** Circular dependencies (A depends on B, B depends on A) are a sign of poor architectural design and are STRICTLY PROHIBITED.
- **Repositories:** NEVER use `forwardRef()` in repositories. Repositories should be "leaf" nodes or depend only on lower-level repositories in a strict DAG (Directed Acyclic Graph). One-way Flow: Service → Facade Repository → Base Repository → Entity.
- **Services:** Avoid circular service dependencies (UserService needs AuthService needs UserService). Solution: Extract shared logic into a third service or utility, or use event-based communication.
- **Modules:** Use `forwardRef()` in Modules only as a last resort for loose coupling between feature modules.

## 12. REST API Standards
- **Resource Naming:** Use nouns for resource URLs, not verbs. Resources should generally be plural. Good: `/users`, `/products/{productId}`. Bad: `/getUsers`, `/createProduct`, `/user/{userId}/order`.
- **HTTP Methods:** Use HTTP methods correctly to indicate the action on a resource: GET: Retrieve a resource or a list of resources. POST: Create a new resource. PUT / PATCH: Update an existing resource. DELETE: Delete a resource.
- **HTTP Status Codes:** Return standard HTTP status codes to indicate the outcome of a request: 200 OK: Successful GET, PUT, PATCH. 201 Created: Successful POST. 204 No Content: Successful DELETE. 400 Bad Request: Invalid request payload (e.g., validation error). 401 Unauthorized: Missing or invalid authentication. 403 Forbidden: The user is not permitted to access this resource. 404 Not Found: The requested resource does not exist.
- **API Versioning:** Implement API versioning (e.g., `/api/v1/users`) to allow for API evolution without breaking existing clients.

## 13. Permissions & Security
- **🔒 STRICT RULE: UUID Validation Pipes** MANDATORY REQUIREMENT - NO EXCEPTIONS ALLOWED All NestJS controller route parameters that accept UUID values MUST use the `ParseUUIDPipe` for validation.
- **When adding a new module, ALWAYS update the permissions system:** Module Constants: Add the new module constant to `MODULE_CONSTANTS` in `libs/@oc/server-core/constants/permissions.constant.ts`. Default Permissions: Add the module to `DEFAULT_PERMISSIONS` array with full CRUD permissions (read, write, edit, delete). Controller Decorators: Update controllers to use `@RequirePermissions` decorator with appropriate module and permission constants. Guards: Ensure guards are applied: `@UseGuards(RolesGuard, AuthGuard)` and `@ApiBearerAuth()`.

## 14. Multi-Tenancy Standards
- **🛡️ Secure by Default** Our application uses a strict multi-tenancy model where data isolation is enforced at the repository layer. Developers must adhere to these rules to prevent cross-tenant data leaks.
- **1. Repository Inheritance:** Rule: All repositories MUST extend `TenantAwareRepository<T>` and inject `RequestContextService`. Reason: This base class overrides `find`, `save`, and `createQueryBuilder` to automatically inject `where: { tenant_id }`.
- **2. One Entity - One Repository Rule:** Rule: Every `BaseTenantEntity` MUST have a dedicated `Repository` class extending `TenantAwareRepository`. Prohibited: Do NOT inject `Repository<T>` directly into Services. Prohibited: Do NOT create "Composite Repositories" that inject multiple standard `Repository<T>` instances (like the old `AuthRepository` or `ProductRepository`). Correction: Split them into dedicated repositories (`ProductVariantRepository`, `OtpRepository`) and inject those instead.
- **3. Database Views & Raw SQL:** Caution: The `TenantAwareRepository` cannot inject filters into raw SQL strings or View definitions. Requirement: You MUST manually handle `tenant_id` in `.query()` calls and `CREATE VIEW` statements.
- **Entity Inheritance:** All business entities MUST extend `BaseTenantEntity` (from `@core-database`). This ensures the `tenant_id` column is present and indexed. Exception: System-wide dictionaries or static data may extend `BaseModifiableEntity`.
- **Repository Pattern:** NEVER extend the standard TypeORM `Repository<T>`. ALWAYS extend `TenantAwareRepository<T>` and inject `RequestContextService`. ALWAYS decorate with `@Injectable({ scope: Scope.REQUEST })` to ensure the tenant context is derived from the current request.
- **Automatic Filtering:** The `TenantAwareRepository` automatically applies `tenant_id = :current_tenant` to all queries (`find`, `findOne`, `QueryBuilder`). Recursive Joins: It also automatically filters joined tables if they have a `tenant_id` column.
- **⚠️ Critical Cautions:** Raw SQL: If you use `.query('SELECT ...')`, you bypassed the security layer. YOU must manually add `WHERE tenant_id = $1`. Database Views: Views must include `tenant_id` in their definition (Select list and Group By) so the repository can filter them.