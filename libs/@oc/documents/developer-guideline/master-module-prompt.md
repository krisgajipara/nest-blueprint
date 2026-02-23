```
"You are helping me build a NestJS backend. Follow these strict rules exactly.

--- PROJECT CONVENTIONS & FOLDER LAYOUT ---
1) Folder structure (must be followed exactly):
    - Core logic (entities, repositories, services, dtos, enums, migrations, shared modules) lives in:
      libs/@oc/server-core
    - API controllers & Nest modules live in:
      src/modules/{module}
    - Entities (TypeORM) ->:
      libs/@oc/server-core/database/entities
    - All entity relationships MUST have `cascade: true` to ensure referential integrity. **Note:** To prevent circular removals, `cascade: true` should only be set on one side of a relationship. For example, in a one-to-many relationship, set it on the "one" side, but not the "many" side.
    - Migrations ->:
      libs/@oc/server-core/database/migrations
    - Per-module business code (repository + service) ->:
      libs/@oc/business-core/modules/{module}/
        - {module}.repository.ts
        - {module}.service.ts
    - Controllers & Nest feature module ->:
      src/modules/{module}/{module}.controller.ts
      src/modules/{module}/{module}.module.ts
      (These modules will register their dependencies and be imported into app.module.ts)
    - Enums ->:
      libs/@oc/server-core/enums
    - Shared utilities, decorators, and shared modules ->:
      libs/@oc/server-core/utilities
      libs/@oc/server-core/shared-modules
    - Constants (entity field lengths, common business logic constants) ->:
      libs/@oc/server-core/constants
      - For entity string columns with length constraints, define constants for these lengths in `libs/@oc/server-core/constants` and reuse them in DTOs for validation.
      - Per entity there should be only one constant with having all length/constant values.
      - Constants should be named in PascalCase, e.g., `CustomerConstant`. Keys within constant objects should also be in PascalCase, e.g., `AddSuccessAction` instead of `ADD_SUCCESS_ACTION`.
      - **CRITICAL - Unique Constraints:**
        - Define key constants in `libs/@oc/server-core/constants/entity-key.constant.ts` as an enum named `DatabaseUniqueKey`
        - **Format:** `UK_{TABLE_NAME}_{FIELD1_FIELD2}` (all CAPITAL letters, underscore-separated)
        - Example: `USER_EMAIL_USER_TYPE = "UK_USER_EMAIL_USER_TYPE"`
        - **NEVER use hardcoded strings** for constraint names - always reference enum values from `DatabaseUniqueKey`
        - **CRITICAL:** When defining unique constraints in entities, ALWAYS use the standard format: `@Unique(DatabaseUniqueKey.EnumValue, ["field1", "field2"])`

2) DTO rules:
    - Every API MUST have DTOs split into:
      - request: create, update, filter/search (e.g. create-{module}.request.dto.ts)
      - response: single & list response DTOs (e.g. {module}.response.dto.ts)
    - DTOs go under: libs/@oc/business-core/modules/{module}/dto/{request|response}
    - **CRITICAL - Validation Standards:**
      - **NEVER use class-validator decorators** (@IsString, @IsEmail, @IsUUID, etc.)
      - **ALWAYS use custom validators** from `libs/@oc/server-core/custom-validators/`
      - **Type validation uses ONLY `ValidateType()`** with `FieldTypeEnum`:
        - Available types: `String`, `Number`, `NumberString`, `Boolean`, `BooleanString`, `Date`, `DateString`, `UUID`, `Array`
        - Example: `@ValidateType({ constraints: { field: 'userId', type: FieldTypeEnum.UUID } })`
    - **CRITICAL - Response DTO Standards:**
      - **NEVER create inline object types** in response DTOs
      - **ALWAYS use private DTO classes** for nested objects
      - **Response DTO constructors contain ONLY direct property mapping** (no business logic)
      - **NEVER use response DTOs as types** - always instantiate with constructor: `new ResponseDto(data)`
      - **ALL mapping logic MUST be in DTO constructors** - NOT in service layers
    - All DTOs within a module's request/response directories MUST be re-exported from an `index.ts` file in their respective directories. Additionally, an `index.ts` file at the `libs/@oc/business-core/modules/{module}/dto/` level MUST re-export these `request` and `response` `index.ts` files.
    - When importing DTOs, always use the defined tsconfig path aliases (e.g., from `@business-core-modules`).
    - Response DTOs MUST contain mapping logic from entities or other data sources within their constructors to keep service layers clean. The service layer will pass the object received from the repository directly to the response DTO's constructor for mapping.

3) Naming & IDs:
   - Use **UUID** for primary keys (TypeORM: @PrimaryGeneratedColumn('uuid')).
   - Use clear kebab-case filenames and PascalCase for class names.

--- TECH STACK & PATTERNS ---
4) Use:
   - NestJS + TypeScript
   - PostgreSQL + TypeORM (entities & repositories)
   - Environment variables MUST be accessed via NestJS Config module (e.g., `ConfigService`), NEVER directly through `process.env`.
   - class-validator + class-transformer for DTO validation
   - Swagger decorators for API docs (@ApiTags, @ApiOperation, @ApiResponse, @ApiProperty)
   - Enums for statuses (stored as Postgres enum or string enum in TypeORM)
   - Standardized API response wrapper using `ApiResponseStatus` decorator (from `libs/@oc/server-core/custom-decorators/api-response.decorator.ts`).
   - **CRITICAL:** ALWAYS pass the response DTO as the 4th parameter to `ApiResponseStatus` - this is mandatory for Swagger to display response schema correctly.
   - For search/list endpoints, pass `CommonSearchResponseDto` as 4th parameter and entity DTO as 5th parameter for proper generics support.
   - Pass only the module-specific response DTO (not wrapped in `AppResponse<>`), ensure all possible HTTP status codes passed - the decorator will automatically wrap it in the AppResponse schema for Swagger documentation.
   - Signature: `ApiResponseStatus(description: string, statuses: HttpStatus[], module: string, response: YourResponseDto, genericType?: YourEntityDto)`
   - Examples:
     - Single entity: `@ApiResponseStatus('Get user by ID', [HttpStatus.OK, HttpStatus.NOT_FOUND], 'User', UserResponseDto)`
     - Search results: `@ApiResponseStatus('List users', [HttpStatus.OK], 'User', CommonSearchResponseDto, UserResponseDto)`

5) Controller / Service / Repository responsibilities:
   -   **Controllers**: only receive/validate input DTOs, call service methods, return `AppResponse<{module-response-dto}>` (no business logic). When APIs require query parameters, always use dedicated request DTOs with `@Query()` instead of individual parameters (global ValidationPipe handles validation).
   -   **Services**: contain business logic, orchestrate repositories & other services (e.g., translation, cache). All methods should return `AppResponse<{module-response-dto}>`. When returning a response to a controller, services MUST use the `new AppResponse(SuccessConstant.AddSuccessAction, { data }, { module: "ModuleName" })` syntax for specific actions, or `new AppResponse(SuccessConstant.SuccessAction, { data }, { module: "ModuleName", action: "actionName" })` for generic actions.
   - **Repositories**: direct DB access (TypeORM); complex queries, filters, pagination done here.

--- MUST-HAVE FEATURES (applies to list endpoints) ---
6) All list endpoints must implement:
   - Search (string matching on designated fields)
   - Filtering (filter DTO with explicit fields, e.g., status, category, minPrice, maxPrice)
   - Pagination (limit, offset)
   - Sorting (sortBy, sortOrder)
   - Return shape: `{ data: [...], total: number, limit, offset }` (use CommonSearchResponseDto)
   - **Search API Implementation - STRICT RULE:**
       - **Controller Decorator:** Use `CommonSearchResponseDto` as 4th parameter and entity DTO as 5th parameter in `ApiResponseStatus`
       - **Return Type:** `AppResponse<CommonSearchResponseDto<EntityDto>>`
       - **Service Response:** Instantiate `new CommonSearchResponseDto<EntityDto>(results, pageSize, page, total)`

7) Soft delete:
   - For removable entities use soft-delete pattern (base-modifiable entity).
   - `DELETE` endpoint should mark REMOVED or set a deletedAt timestamp; do NOT hard-delete unless explicitly requested.
   - NEVER use TypeORM's `remove()` or `delete()` methods directly for removable entities; ALWAYS use soft-delete functionality (e.g., `softRemove()`).

8) Error handling & validation:
    - Use global ValidationPipe.
    - Services should throw NestJS HttpExceptions for invalid flows (e.g., NotFoundException).
    - Controllers must convert service results to response DTOs;
    - **CRITICAL - Standardized Error Messages:**
      - **ALWAYS use standardized error messages** from `libs/@oc/server-core/utilities/i18n/en/error.json`
      - **Pattern:** `throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: "User" })`
      - **Available Error Keys:**
        - `ERR_MODULE_NOT_FOUND` - Resource not found
        - `ERR_MIN_LENGTH`/`ERR_MAX_LENGTH` - Length validation
        - `ERR_REQUIRED` - Required fields
        - `ERR_TYPE`/`ERR_IS_ENUM` - Type validation
        - `ERR_DELETED` - Deleted resources
        - `ERR_NOT_VALID` - General validation
        - `ERR_EMAIL_NOT_FOUND` - Email not registered
        - `ERR_INVALID_CREDENTIALS` - Wrong login credentials

--- STYLE & QUALITY ---
9) Code quality:
   - Provide Swagger docs for every endpoint, utilizing `ApiResponseStatus` for comprehensive response documentation.
   - Add inline comments in generated files describing the purpose of methods/classes.
   - **CRITICAL - Import Rules:**
     - **ALWAYS use tsConfig path aliases** for ALL imports
     - **FORBIDDEN:** Relative imports (e.g., `../../../module/file`)
     - **FORBIDDEN:** Hardcoded absolute paths (e.g., `libs/@oc/...`)
     - **REQUIRED:** tsConfig aliases (e.g., `@business-core-modules`)
     - All DTOs and modules must be re-exported through proper `index.ts` files
     - Common aliases: `@business-core-modules`, `@business-core-dto`, `@core-database`, `@core-enums`, `@core-utilities`, `@core-custom-validators`, `@core-custom-decorators`
   - Use async/await; handle transactions where necessary (TypeORM QueryRunner) for multi-step changes (e.g., booking creation that updates user status).
   - **Precise Async Usage:** Only declare methods as `async` when they actually perform asynchronous operations (contain `await`). Remove `async` keyword from methods that just return Promises directly.

10) Reusability & extension:
   - Keep modules self-contained so they can be moved to multi-tenant later.
   - Place translation keys/messages in translation module (if using i18n).
   - Keep heavy utility code in libs/@oc/server-core/utilities or shared-modules.

--- WHEN GENERATING A MODULE ---
Now generate code for the `{ModuleName}` module. Follow the exact structure above and produce these files (unless module-specific files differ):

  - libs/@oc/server-core/database/entities/{module}.entity.ts
    - Inherit from `BaseModifiableEntity` (for created_at, updated_at, created_by, updated_by) and `Identity` (for primary key). Do not manually add primary key or audit columns.
  - libs/@oc/business-core/modules/{module}/{module}.repository.ts
    - Extend TypeORM Repository<{Module}>, implement pagination & sorting based on `CommonSearchRequestDto`
  - libs/@oc/business-core/modules/{module}/{module}.service.ts
    - Expose methods: create, update, delete(soft), findById, findList(commonSearchRequestDto). All methods should return `AppResponse<{module-response-dto}>`.
    - Keep business logic here (no DB-specific SQL; call repository)
  - libs/@oc/business-core/modules/{module}/dto/request/*
    - create-{module}.request.dto.ts
    - update-{module}.request.dto.ts
    - search-{module}.request.dto.ts (inherits from `CommonSearchRequestDto`)
  - libs/@oc/business-core/modules/{module}/dto/response/*
    - {module}.response.dto.ts
  - src/modules/{module}/{module}.controller.ts
    - Implement CRUD + list/search endpoints with Swagger documentation, validation, and proper utilization of `ApiResponseStatus` decorator for all possible HTTP status codes.
    - **CRITICAL:** ALWAYS pass the response DTO as the 4th parameter to `ApiResponseStatus` (e.g., `UserResponseDto`) - never omit this parameter for Swagger documentation.
    - For search/list endpoints, pass `CommonSearchResponseDto` as 4th parameter and entity DTO as 5th parameter for proper generics support.
    - Pass only the module-specific response DTO (not wrapped in `AppResponse<>`) - the decorator will automatically wrap it in the AppResponse schema.
  - src/modules/{module}/{module}.module.ts
    - Import TypeOrmModule.forFeature([...entities]) if needed and export controller

--- PERMISSIONS & SECURITY ---
11) **CRITICAL - Permissions System:**
  - **ALWAYS update permissions** when adding a new module
  - Add the new module constant to `MODULE_CONSTANTS` in `libs/@oc/server-core/constants/permissions.constant.ts`
  - Add the module to `DEFAULT_PERMISSIONS` array with full CRUD permissions (read, write, edit, delete)
  - **CRITICAL:** Update controllers to use `@RequirePermissions` decorator with appropriate module and permission constants
  - **CRITICAL:** Ensure guards are applied: `@UseGuards(RolesGuard, AuthGuard)` and `@ApiBearerAuth()` on all protected endpoints

--- EXTRA NOTES (module-specific):
- All DTOs must use proper validator decorators and include example properties for Swagger via @ApiProperty.
- **CRITICAL - Logging Integration:**
  - Implement centralized logging using NestJS Logger and GenerateLogPrefix utility
  - Add `readonly #logger: Logger = new Logger(ClassName.name);` as a private readonly property in service classes
  - Use `GenerateLogPrefix` from `@core-utilities` for consistent log prefixes in method calls
  - Add debug logs for key operations (entry points, cache hits/misses, successful operations)
  - Add error logs for exceptions with meaningful context
  - Do not log on every minor step to avoid log noise - focus on important business operations, cache interactions, and error scenarios
- **CRITICAL - Caching Integration:**
  - For findById/details API endpoints, implement caching using AppCacheService
  - Inject AppCacheService in the service class
  - In the findById method, first check cache using a key like `{module}:{id}`
  - If cached data exists, return it directly
  - If not cached, proceed with normal repository call, then cache the response for 5 minutes (ttl=5)
  - Use GetCacheKey utility from @core-utilities for consistent key generation
- **Logging Integration**: Implement centralized logging using NestJS Logger and GenerateLogPrefix utility:
  - Add `readonly #logger: Logger = new Logger(ClassName.name);` as a private readonly property in service classes.
  - Use `GenerateLogPrefix` from `@core-utilities` for consistent log prefixes in method calls.
  - Add debug logs for key operations (entry points, cache hits/misses, successful operations).
  - Add error logs for exceptions with meaningful context.
  - Do not log on every minor step to avoid log noise - focus on important business operations, cache interactions, and error scenarios.
- **Caching Integration**: For findById/details API endpoints, implement caching using AppCacheService:
  - Inject AppCacheService in the service class.
  - In the findById method, first check cache using a key like `{module}:{id}`.
  - If cached data exists, return it directly.
  - If not cached, proceed with normal repository call, then cache the response for 5 minutes (ttl=5).
  - Use GetCacheKey utility from @core-utilities for consistent key generation.

"

Now generate code for the User module. Use the module-specific requirements below:

"Master Prompt: Generate User Module for NestJS Suit Rental Admin Panel (Layered Architecture, Login Page Requirements Enforced)



📁 Location & Structure:



Entity (Database Layer):

libs/@oc/server-core/database/entities/user.entity.ts
// Represents the database table structure for user accounts
Business Logic Layer:

libs/@oc/business-core/modules/user/

user.repository.ts // Handles DB queries using TypeORM
user.service.ts // Business logic, calls repository
📁dto

📁request // Input validation for APIs

create-user.request.dto.ts
update-user.request.dto.ts
list-user.request.dto.ts
login-user.request.dto.ts
forgot-password.request.dto.ts
reset-password.request.dto.ts
📁response // Output structure for APIs

user.response.dto.ts
login-response.dto.ts
API Layer:

src/modules/user/

user.controller.ts // Defines API routes & Swagger decorators
user.module.ts // Declares module, imports service & controller


Entity Fields (user.entity.ts):

id (uuid, primary key)
first_name (string)
last_name (string)
email (string, unique)
password (string)
phone_number (string, nullable)
role (enum → ADMIN, CUSTOMER, etc.)
status (enum → ACTIVE, INACTIVE, PENDING_VERIFICATION)
created_at (timestamp)
updated_at (timestamp)


Requirements:

Follow Controller → Service → Repository → Entity layered pattern
Use TypeScript + NestJS + TypeORM best practices
- Use **CustomValidator** for DTOs, validation uses ONLY `ValidateType()` with `FieldTypeEnum` - NEVER @IsUUID, @IsString, @IsNumber, @IsDate, etc.
Use Swagger decorators (@ApiTags, @ApiResponse, @ApiProperty) for documentation
Password should be hashed before saving to DB


Endpoints (user.controller.ts):

POST /users/register → Register a new user
POST /users/login → User login (returns JWT token)
GET /users/:id → Get user by ID
PUT /users/:id → Update user details
DELETE /users/:id → Soft delete user (set status = INACTIVE)
GET /users → List all users (with search, filter, pagination, sorting)
POST /users/forgot-password → Initiate password reset (sends email with token)
POST /users/reset-password → Complete password reset (uses token)
GET /users/profile → Get current user's profile (requires authentication)
PUT /users/profile → Update current user's profile (requires authentication)


Login Page & Validation Requirements (Enforced in login-user.request.dto.ts and login endpoint):



Email Field:

Required, max 50 characters, no spaces, no emojis, only valid email format (e.g., user@example.com)
Only "@" as special character allowed
Not case-sensitive
Error messages:

If empty: "Email is required."
If invalid format or contains emojis: "Enter a valid email."
If not registered: "No account found with this email."
If exceeds 50 chars: "Email cannot exceed 50 characters."
Password Field:

Required, max 20 characters, no emojis
Error messages:

If empty: "Password is required."
If exceeds 20 chars: "Password cannot exceed 20 characters."
General:

On invalid credentials: "Invalid email or password. Please try again."
All error messages must be returned in the API response as specified above.
Password must be hashed before saving or comparing.
JWT authentication for protected routes (e.g., /users/profile)
Soft delete: mark status = INACTIVE, do not hard delete
All list/search endpoints must support search, filter, pagination, sorting


Rules & Notes:

**CRITICAL:** Use **CustomValidator** for DTOs, validation uses ONLY `ValidateType()` with `FieldTypeEnum` - NEVER @IsUUID, @IsString, @IsNumber, @IsDate, etc.
Include Swagger decorators for all endpoints and DTOs.
Ensure password hashing for new user registration and password reset.
Implement JWT authentication for protected routes.
Return code separately in files: entity.ts, repository.ts, service.ts, dto/request/.ts, dto/response/.ts, controller.ts, module.ts


Definition of Done:

All required fields and labels are implemented as per specifications.
Validations and error messages are displayed and returned correctly.
Input constraints, formatting rules, and character limits are enforced for both email and password.
Functional elements (Login endpoint, Forgot Password, Password reset) behave as expected.
Successful authentication returns JWT and user info; failed authentication returns correct error message."

Requirements:
- Follow the exact architecture, folder structure, and rules from the master architecture prompt.
- Generate code in separate files:
  - libs/@oc/server-core/database/entities/{module}.entity.ts
  - libs/@oc/business-core/modules/{module}/{module}.repository.ts
  - libs/@oc/business-core/modules/{module}/{module}.service.ts
  - libs/@oc/business-core/modules/{module}/dto/request/*.dto.ts
  - libs/@oc/business-core/modules/{module}/dto/response/*.dto.ts
  - src/modules/{module}/{module}.controller.ts
  - src/modules/{module}/{module}.module.ts
- Use tsconfig path aliases for imports where needed (e.g., "@core-custom-decorators", "@core-database" )
- For entity field lengths, always use constants defined in `libs/@oc/server-core/constants` for both entity and DTO validation.
- Constants should be named in PascalCase, e.g., `CustomerConstant`, `SuitConstant`. Keys within constant objects should also be in PascalCase, e.g., `AddSuccessAction` instead of `ADD_SUCCESS_ACTION`.
- When returning responses from services, use `new AppResponse(SuccessConstant.AddSuccessAction, { data }, { module: "ModuleName" })` for specific actions, or `new AppResponse(SuccessConstant.SuccessAction, { data }, { module: "ModuleName", action: "actionName" })` for generic actions.
- Controllers must use dedicated request DTOs for query parameters with `@Query()` syntax instead of individual parameters (global ValidationPipe handles validation).
- Include comments in code explaining purpose of classes and methods
- For soft-delete functionality, always use TypeORM's softRemove() method.

# Use this prompt like below

gemini generate module \
  --from-file libs/@oc/docs/dev-guidelines/master-architecture-prompt.md \
  --from-file libs/@oc/docs/dev-guidelines/example-user-module.md \
```
