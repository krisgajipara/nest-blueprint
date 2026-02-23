# Coding Standards Rule Book

This document outlines the coding standards and conventions to be followed in this project.

## 1. Folder Structure

- **Core Logic:** All core logic including entities, repositories, services, DTOs, enums, migrations, and shared modules are located in `libs/@oc/server-core`.
- **API Controllers & Modules:** API controllers and Nest modules are located in `src/modules/{module}`.
- **Entities:** TypeORM entities are located in `libs/@oc/server-core/database/entities`.
- **Migrations:** Database migrations are located in `libs/@oc/server-core/database/migrations`.
- **Business Logic:** Per-module business code (repository and service) is located in `libs/@oc/business-core/modules/{module}/`.
- **Controllers & Feature Modules:** Controllers and Nest feature modules are located in `src/modules/{module}/`.
- **DTOs:** Data Transfer Objects are located within each module's folder at `libs/@oc/business-core/modules/{module}/dto/{request|response}`.
- **Enums:** Enums are located in `libs/@oc/server-core/enums`.
- **Shared Utilities & Decorators:** Shared utilities, decorators, and shared modules are located in `libs/@oc/server-core/utilities` and `libs/@oc/server-core/shared-modules`.
- **Constants:** Constants for entity field lengths and other business logic are located in `libs/@oc/server-core/constants`.

## 2. DTOs (Data Transfer Objects)

- **Separation:** Every API must have DTOs separated into `request` and `response` folders.
- **Validation:** **STRICTLY** prioritize custom validators from `libs/@oc/server-core/custom-validators/`. **NEVER use class-validator** decorators. If a custom validator doesn't exist for your validation need, it must be added to the custom validators library.
- **Type Validation - STRICT RULE:**
    - **NEVER** use class-validator type decorators: `@IsUUID()`, `@IsDateString()`, `@IsDate()`, `@IsBooleanString()`, `@IsBoolean()`, `@IsNumberString()`, `@IsNumber()`, `@IsString()`
    - **ALWAYS** use `ValidateType()` custom validator with appropriate `FieldTypeEnum` value
    - Available types: `String`, `Number`, `NumberString`, `Boolean`, `BooleanString`, `Date`, `DateString`, `UUID`, `Array`

    ```typescript
    // ❌ WRONG - class-validator type decorators
    @IsUUID()
    userId: string;

    @IsString()
    name: string;

    // ✅ CORRECT - ValidateType with FieldTypeEnum
    @ValidateType({ constraints: { field: 'userId', type: FieldTypeEnum.UUID } })
    userId: string;

    @ValidateType({ constraints: { field: 'name', type: FieldTypeEnum.String } })
    name: string;
    ```

- **Response DTOs Schema:** **NEVER** create inline object types in response DTOs. Create private DTO classes for nested objects instead.

    ```typescript
    // ❌ WRONG - Inline object type
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: Role;
    };

    // ✅ CORRECT - Private DTO class
    private userDto?: UserResponseDto;
    ```

- **Response DTOs Constructor:** Response DTOs must contain mapping logic from entities within their constructors. **DO NOT use entity methods or business logic in constructors** - only direct property mapping.
- **Response DTOs Instantiation:** **CRITICAL - Do NOT use response DTOs as types when instantiating them.** Always instantiate response DTOs directly using their constructor with mapping logic.

    ```typescript
    // ❌ WRONG - Using DTO as type
    const response: OtpLeftTimeResponseDto = { remainingTime };

    // ✅ CORRECT - Instantiating with constructor
    const response = new OtpLeftTimeResponseDto(remainingTime);
    ```

- **Mapping Logic Location:** All mapping logic MUST be done exclusively in the DTO's constructor. **DO NOT perform mapping or transformation in service layers.** The service layer should pass raw data directly to the DTO constructor.
- **Repository to DTO Mapping:** Response DTOs must contain mapping logic from entities within their constructors. The service layer will pass the object received from the repository directly to the response DTO's constructor for mapping (pass the whole object, not individual properties).
- **Exports:** All DTOs within a module's `request` and `response` directories must be re-exported from an `index.ts` file in their respective directories and then from a `dto/index.ts` file.
- **Imports:** Always use tsconfig path aliases for importing DTOs (e.g., from `@business-core-modules`).
- **Swagger:** All DTOs must use proper validator decorators for Swagger via `@ApiProperty`.
    - **STRICT RULE - @ApiProperty Usage for DTO/Object Types:**
        - When the property type is a DTO class or Object, **NEVER** use `example` property in `@ApiProperty()` decorator
        - **ALWAYS** use `type` property and assign the appropriate DTO class or TypeScript type
        - **ALWAYS** provide meaningful `description` for API documentation

        ```typescript
        // ❌ WRONG - Using example for DTO/Object types
        @ApiProperty({
            description: "Array of product variant updates",
            example: [
                {
                    productVariantId: "123e4567-e89b-12d3-a456-426614174000",
                    price: 25.0,
                    availableQuantity: 100
                }
            ]
        })
        updates: ProductVariantPriceAvailabilityUpdateDto[];

        // ✅ CORRECT - Using type for DTO/Object types
        @ApiProperty({
            description: "Array of product variant updates",
            type: [ProductVariantPriceAvailabilityUpdateDto]
        })
        updates: ProductVariantPriceAvailabilityUpdateDto[];

        // ✅ CORRECT - For single DTO objects
        @ApiProperty({
            description: "Product variant details",
            type: ProductVariantResponseDto
        })
        productVariant: ProductVariantResponseDto;
        ```

## 3. Entities & Database

- **Primary Keys:** Use UUID for primary keys (`@PrimaryGeneratedColumn('uuid')`).
- **Relationships:** All entity relationships must use `cascade: true`.
- **Soft Deletes:** Use a soft-delete pattern for removable entities. Do not hard-delete. Use `softRemove()` instead of `remove()` or `delete()`.
- **Base Entities:** Entities should inherit from `BaseModifiableEntity` and `Identity` where applicable (UUID is the default primary key type).
- **Unique Constraints:**
    - Define unique constraint keys in `libs/@oc/server-core/constants/entity-key.constant.ts` as an enum named `DatabaseUniqueKey`.
    - **Format:** `UK_{TABLE_NAME}_{FIELD1_FIELD2}` (all CAPITAL letters, fields separated by underscores).
    - Never use hardcoded strings for constraint names - always reference enum values from `DatabaseUniqueKey`.
    - **CRITICAL:** ALWAYS use the standard format: `@Unique(DatabaseUniqueKey.EnumValue, ["field1", "field2"])`.

        ```typescript
        // DatabaseUniqueKey enum example
        export enum DatabaseUniqueKey {
          UserEmailUserType = "UK_USER_EMAIL_USER_TYPE"
        }

        // Entity usage example
        @Unique(DatabaseUniqueKey.UserEmailUserType, ["email", "userType"])
        ```

## 4. Naming Conventions

- **Files:** Use kebab-case for filenames (e.g., `user-module.ts`).
- **Classes:** Use PascalCase for class names (e.g., `UserModule`).

## 5. Technology Stack & Patterns

- **Framework:** Use NestJS and TypeScript.
- **Database:** Use PostgreSQL and TypeORM.
- **Environment Variables:** Access environment variables only through the NestJS `ConfigService`.
- **API Documentation:** Use Swagger for API documentation (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`).
- **API Response:** Use the standardized API response wrapper `ApiResponseStatus` decorator for all endpoints.
    - **CRITICAL - Response DTO Parameter:** ALWAYS pass the response DTO as the 4th parameter to `ApiResponseStatus`. This is mandatory for Swagger to display the correct response schema.
    - Pass only the module-specific response DTO (not wrapped in `AppResponse<>`).
    - Signature: `ApiResponseStatus(description: string, statuses: HttpStatus[], module: string, response: YourResponseDto)`

    ```typescript
    // ❌ WRONG - Missing response DTO parameter
    @ApiResponseStatus('Get user by ID', [HttpStatus.OK], 'User')

    // ✅ CORRECT - Response DTO passed as 4th parameter
    @ApiResponseStatus('Get user by ID', [HttpStatus.OK, HttpStatus.NOT_FOUND], 'User', UserResponseDto)
    ```

- **Enums:** Use enums for statuses, stored as Postgres enums or string enums in TypeORM.

## 6. API & Endpoints

- **Responsibilities:**
    - **Controllers:** Handle incoming requests, validate input DTOs, call service methods, and return responses. No business logic. When APIs require query parameters, always use dedicated request DTOs with `@Query()` instead of individual parameters (global ValidationPipe handles validation).
    - **Services:** Contain all business logic, orchestrate repositories and other services. Return `AppResponse` objects using the `new AppResponse(SuccessConstant.AddSuccessAction, { data }, { module: "ModuleName" })` syntax for specific actions, or `new AppResponse(SuccessConstant.SuccessAction, { data }, { module: "ModuleName", action: "actionName" })` for generic actions. **Only use the third parameter when using SuccessConstant.** For other success messages, omit the third parameter.
    - **Repositories:** Handle direct database access and complex queries. **SELECTIVELY RETURN DATA** - never return all fields from repository level. Return only what the API needs for optimal performance.
- **Query Builder:** Use TypeORM Query Builder with managers where possible for complex queries. **ALWAYS use defined ENUMs** instead of hardcoded strings.

    ```typescript
    // ❌ WRONG
    orderBy: "DESC";

    // ✅ CORRECT
    orderBy: OrderDirection.DESC;
    ```

- **List Endpoints:** All list endpoints must implement searching, filtering, pagination, and sorting.
- **Return Shape:** List endpoints should return data in the shape `{ data: [...], total: number, limit, offset }` using `CommonSearchResponseDto`.
- **Search API Implementation - STRICT RULE:**
    - **Controller Decorator:** Use `CommonSearchResponseDto` as 4th parameter and entity DTO as 5th parameter in `ApiResponseStatus`
    - **Return Type:** `AppResponse<CommonSearchResponseDto<EntityDto>>`
    - **Service Response:** Instantiate `new CommonSearchResponseDto<EntityDto>(results, pageSize, page, total)`

    ```typescript
    // ✅ CORRECT - Controller
    @ApiResponseStatus('List entities', [HttpStatus.OK], 'Entity', CommonSearchResponseDto, EntityResponseDto)
    async findAll(): Promise<AppResponse<CommonSearchResponseDto<EntityResponseDto>>> {
        return this.service.findList(query);
    }

    // ✅ CORRECT - Service
    async findList(): Promise<AppResponse<CommonSearchResponseDto<EntityResponseDto>>> {
        const [entities, total] = await this.repository.findList(request);
        const results = entities.map(e => new EntityResponseDto(e));
        const response = new CommonSearchResponseDto<EntityResponseDto>(
            results, request.pageSize || 10, request.pageNumber || 1, total
        );
        return new AppResponse(SuccessConstant.ListFetch, response, { module: 'Entity' });
    }
    ```

## 7. Error Handling & Validation

- **Validation Pipe:** Use the global `ValidationPipe`.
- **Exceptions:** Services should throw NestJS `HttpExceptions` for invalid flows.
- **Standardized Error Messages:** Use standardized error messages from error.json for consistency.

    ```typescript
    // ❌ WRONG
    throw new NotFoundException("User not found");

    // ✅ CORRECT
    throw new NotFoundException({ message: "ERR_MODULE_NOT_FOUND", module: "User" });
    ```

- **Available Error Keys:** Use appropriate error keys from `libs/@oc/server-core/utilities/i18n/en/error.json`:
    - `ERR_MODULE_NOT_FOUND` - Resource not found
    - `ERR_MIN_LENGTH` - Minimum length validation
    - `ERR_MAX_LENGTH` - Maximum length validation
    - `ERR_REQUIRED` - Required field validation
    - `ERR_TYPE` - Type validation
    - `ERR_IS_ENUM` - Enum validation
    - `ERR_DELETED` - Deleted resource
    - `ERR_NOT_VALID` - General validation
    - `ERR_ALPHA_NUMERIC` - Alpha-numeric validation
    - `ERR_UNIQUE_ARRAY_ITEM` - Array uniqueness
    - `ERR_ONLY_SPACE` - Space-only validation
    - `ERR_MIN_VALUE` / `ERR_MAX_VALUE` - Value range validation

## 8. Code Quality & Style

- **Swagger:** Provide Swagger documentation for every endpoint.
- **Comments:** Add inline comments to describe the purpose of methods and classes.
- **CRITICAL - Import Rules:** NEVER use relative paths or hardcoded absolute paths. ALWAYS use tsConfig path aliases for ALL imports.
    - ❌ **FORBIDDEN - Relative paths:** `import { UserDto } from '../../../business-core/modules/user/dto/response/user.response.dto'`
    - ❌ **FORBIDDEN - Hardcoded paths:** `import { UserDto } from 'libs/@oc/business-core/modules/user/dto/response/user.response.dto'`
    - ✅ **REQUIRED - tsConfig aliases:** `import { CourtResponseDto, CreateCourtRequestDto } from '@business-core-modules'`
    - All DTOs and modules must be properly re-exported through `index.ts` files to enable clean imports from root aliases.
    - Common aliases: `@business-core-modules`, `@business-core-dto`, `@core-database`, `@core-enums`, `@core-utilities`, `@core-custom-validators`, `@core-custom-decorators`
- **Asynchronous Code:** Use `async/await` for all asynchronous operations.
    - **Precise Async Usage:** Only declare methods as `async` when they actually perform asynchronous operations (contain `await`). Remove `async` keyword from methods that just return Promises directly.

    ```typescript
    // ❌ WRONG - Unnecessary async (just returns Promise)
    async resetPassword(dto: ResetPasswordDto): Promise<any> {
        return this.authService.resetPassword(dto);  // No await here
    }

    // ✅ CORRECT - Remove async when just returning Promise
    resetPassword(dto: ResetPasswordDto): Promise<any> {
        return this.authService.resetPassword(dto);  // Still returns Promise
    }

    // ✅ CORRECT - Keep async when using await
    async fetchData(): Promise<DataDto> {
        const result = await this.apiCall();  // Has await
        return this.processData(result);
    }

    // ✅ CORRECT - Synchronous methods (no async needed)
    getConfig(): ConfigDto {
        return this.config;
    }
    ```

- **AppResponse Usage:** The third parameter controls dynamic message generation.
    - **Module only:** `{ module: 'Entity' }` → "Entity list fetched successfully"
    - **Module + Action:** `{ module: 'Entity', action: 'created' }` → "Entity has been created successfully"
    - **Omit parameter:** For custom messages or when SuccessConstant provides exact text

- **Transactions:** Use TypeORM's `QueryRunner` for multi-step database changes.

## 9. Constants

- **Location:** Constants for entity field lengths and common business logic should be in `libs/@oc/server-core/constants`.
- **Usage:** For entity string columns with length constraints, define constants for these lengths and reuse them in DTOs for validation.
- **Structure:** Per entity, there should be only one constant file containing all length/constant values.
- **Naming:** Constants should be named in PascalCase, e.g., `CustomerConstant`. Keys within constant objects should also be in PascalCase, e.g., `AddSuccessAction` instead of `ADD_SUCCESS_ACTION`.
- **AppResponse Usage:** When services return `AppResponse`, the first parameter must be from `SuccessConstant`. For specific actions like create/update/delete, use predefined constants (e.g., `SuccessConstant.AddSuccessAction`). For generic actions, use `SuccessConstant.SuccessAction` and pass both `module` and `action` as the third parameter to generate messages like "{module} has been {action} successfully."

## 10. Reusability & Modularity

- **Self-Contained Modules:** Keep modules self-contained.
- **Translations:** Place translation keys and messages in the translation module.
- **Utilities:** Place heavy utility code in `libs/@oc/server-core/utilities` or `shared-modules`.

## 11. Dependency Management & Circular Dependencies

### 🚫 **STRICT RULE: No Circular Dependencies**

Circular dependencies (A depends on B, B depends on A) are a sign of poor architectural design and are **STRICTLY PROHIBITED**.

- **Repositories:**
    - **NEVER** use `forwardRef()` in repositories.
    - Repositories should be "leaf" nodes or depend only on lower-level repositories in a strict DAG (Directed Acyclic Graph).
    - **One-way Flow:** Service → Facade Repository → Base Repository → Entity.

- **Services:**
    - Avoid circular service dependencies (`UserService` needs `AuthService` needs `UserService`).
    - **Solution:** Extract shared logic into a third service or utility, or use event-based communication.

- **Modules:**
    - Use `forwardRef()` in Modules **only as a last resort** for loose coupling between feature modules.

## 12. REST API Standards

- **Resource Naming:** Use nouns for resource URLs, not verbs. Resources should generally be plural.
    - **Good:** `/users`, `/products/{productId}`
    - **Bad:** `/getUsers`, `/createProduct`, `/user/{userId}/order`
- **HTTP Methods:** Use HTTP methods correctly to indicate the action on a resource:
    - `GET`: Retrieve a resource or a list of resources.
    - `POST`: Create a new resource.
    - `PUT` / `PATCH`: Update an existing resource.
    - `DELETE`: Delete a resource.
- **HTTP Status Codes:** Return standard HTTP status codes to indicate the outcome of a request:
    - `200 OK`: Successful `GET`, `PUT`, `PATCH`.
    - `201 Created`: Successful `POST`.
    - `204 No Content`: Successful `DELETE`.
    - `400 Bad Request`: Invalid request payload (e.g., validation error).
    - `401 Unauthorized`: Missing or invalid authentication.
    - `403 Forbidden`: The user is not permitted to access this resource.
    - `404 Not Found`: The requested resource does not exist.
- **API Versioning:** Implement API versioning (e.g., `/api/v1/users`) to allow for API evolution without breaking existing clients.

## 12. Permissions & Security

### 🔒 **STRICT RULE: UUID Validation Pipes**

**MANDATORY REQUIREMENT - NO EXCEPTIONS ALLOWED**

All NestJS controller route parameters that accept UUID values **MUST** use the `ParseUUIDPipe` for validation.

#### ✅ **Correct Implementation**

```typescript
import { ParseUUIDPipe } from "@nestjs/common";

// ✅ REQUIRED: Always use ParseUUIDPipe for UUID parameters
@Get(":id")
async getById(@Param("id", ParseUUIDPipe) id: string) {
    return t
```

#### ❌ **Incorrect Implementation - NOT ALLOWED**

```typescript
// ❌ FORBIDDEN: Never accept raw string UUID parameters
@Get(":id")
async getById(@Param("id") id: string) { // VIOLATION!
    return this.service.getById(id);
}
```

When adding a new module, **ALWAYS** update the permissions system:

- **Module Constants:** Add the new module constant to `MODULE_CONSTANTS` in `libs/@oc/server-core/constants/permissions.constant.ts`
- **Default Permissions:** Add the module to `DEFAULT_PERMISSIONS` array with full CRUD permissions (read, write, edit, delete)
- **Controller Decorators:** Update controllers to use `@RequirePermissions` decorator with appropriate module and permission constants
- **Guards:** Ensure guards are applied: `@UseGuards(RolesGuard, AuthGuard)` and `@ApiBearerAuth()`

**Example:**

```typescript
@ApiBearerAuth()
@UseGuards(RolesGuard, AuthGuard)
@RequirePermissions(MODULE_CONSTANTS.COURT, PERMISSION_CONSTANTS.READ)
async findAll() { ... }
```

## 13. Multi-Tenancy Standards

### 🛡️ **Secure by Default**

#### 1. Repository Inheritance

- **Rule**: All repositories MUST extend `TenantAwareRepository<T>` and inject `RequestContextService`.
- **Reason**: This base class overrides `find`, `save`, and `createQueryBuilder` to automatically inject `where: { tenant_id }`.

#### 2. One Entity - One Repository Rule

- **Rule**: Every `BaseTenantEntity` MUST have a dedicated `Repository` class extending `TenantAwareRepository`.
- **Prohibited**: Do NOT inject `Repository<T>` directly into Services.
- **Prohibited**: Do NOT create "Composite Repositories" that inject multiple standard `Repository<T>` instances (like the old `AuthRepository` or `ProductRepository`).
- **Correction**: Split them into dedicated repositories (`ProductVariantRepository`, `OtpRepository`) and inject those instead.

#### 3. Database Views & Raw SQL

- **Caution**: The `TenantAwareRepository` cannot inject filters into raw SQL strings or View definitions.
- **Requirement**: You MUST manually handle `tenant_id` in `.query()` calls and `CREATE VIEW` statements.

Our application uses a strict multi-tenancy model where data isolation is enforced at the repository layer. Developers must adhere to these rules to prevent cross-tenant data leaks.

- **Entity Inheritance:**
    - All business entities **MUST** extend `BaseTenantEntity` (from `@core-database`).
    - This ensures the `tenant_id` column is present and indexed.
    - **Exception:** System-wide dictionaries or static data may extend `BaseModifiableEntity`.

    ```typescript
    // ✅ CORRECT
    @Entity()
    export class Tournament extends BaseTenantEntity { ... }
    ```

- **Repository Pattern:**
    - **NEVER** extend the standard TypeORM `Repository<T>`.
    - **ALWAYS** extend `TenantAwareRepository<T>` and inject `RequestContextService`.
    - **ALWAYS** decorate with `@Injectable({ scope: Scope.REQUEST })` to ensure the tenant context is derived from the current request.

    ```typescript
    // ✅ CORRECT
    @Injectable({ scope: Scope.REQUEST })
    export class TournamentRepository extends TenantAwareRepository<Tournament> {
        constructor(
            @InjectRepository(Tournament) repo: Repository<Tournament>,
            @Inject() context: RequestContextService
        ) {
            super(repo.target, repo.manager, repo.queryRunner, context);
        }
    }
    ```

- **Automatic Filtering:**
    - The `TenantAwareRepository` automatically applies `tenant_id = :current_tenant` to all queries (`find`, `findOne`, `QueryBuilder`).
    - **Recursive Joins:** It also automatically filters joined tables if they have a `tenant_id` column.

- **⚠️ Critical Cautions:**
    - **Raw SQL:** If you use `.query('SELECT ...')`, you bypassed the security layer. **YOU** must manually add `WHERE tenant_id = $1`.
    - **Database Views:** Views must include `tenant_id` in their definition (Select list and Group By) so the repository can filter them.
