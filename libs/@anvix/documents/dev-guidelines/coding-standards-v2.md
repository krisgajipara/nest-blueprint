# Coding Standards

This is the canonical coding standards document for the backend.

Last verified against repo: 2026-05-04

Use this document for code generation, code review, and AI-assisted module work. Older duplicate standards files under `dev-guidelines/coding-standards-rule/` have been removed after their useful content was merged here.

## 1. Folder Structure

- API controllers and Nest feature modules live in `src/modules/{module}`.
- Business services, repositories, and feature DTOs live in `libs/@anvix/business-core/modules/{module}`.
- Shared/common DTOs live in `libs/@anvix/business-core/dto/common-dto`.
- Entities, base entities, migrations, repositories, and subscribers live in `libs/@anvix/server-core/database`.
- Shared enums live in `libs/@anvix/server-core/enums`.
- Shared constants live in `libs/@anvix/server-core/constants`.
- Shared validators live in `libs/@anvix/server-core/custom-validators`.
- Shared decorators live in `libs/@anvix/server-core/custom-decorators`.
- Shared guards live in `libs/@anvix/server-core/custom-guards`.
- Shared infrastructure services live in `libs/@anvix/server-core/shared-modules`.
- Shared utilities live in `libs/@anvix/server-core/utilities`.

## 2. Imports

- Use `tsconfig.json` path aliases for cross-package imports.
- Avoid long relative imports across package boundaries.
- Avoid hardcoded absolute imports such as `libs/@anvix/...` inside TypeScript source.
- Re-export DTOs and modules through local `index.ts` files when a root alias import is expected.

Current aliases:

```text
@business-core-dto
@business-core-modules
@core-config
@core-constants
@core-custom-decorators
@core-custom-guards
@core-custom-validators
@core-database
@core-enums
@core-filters
@core-generic-services
@core-interceptors
@core-interfaces
@core-middleware
@core-shared-modules
@core-utilities
```

Relative imports are acceptable for nearby implementation details inside the same folder/package, especially where a symbol is not exported by an alias barrel. Example: current database entities import base entities using `../base-entities/...`.

## 3. DTOs

- Every API must use request and response DTOs.
- Feature DTOs should live under `libs/@anvix/business-core/modules/{module}/dto/request` and `dto/response`.
- Shared DTOs should live under `libs/@anvix/business-core/dto/common-dto`.
- Request DTOs validate incoming payload/query data.
- Response DTOs shape outgoing API data.
- Do not return raw entities directly from controllers.
- Response DTO constructors may map entity/repository data into API-safe shapes.
- Keep mapping in DTO constructors or focused mapper helpers; do not spread mapping logic across controllers.
- Do not create inline object shapes for nested response objects when a DTO class would be clearer.
- Re-export DTOs from request/response `index.ts` files and the feature `dto/index.ts`.

## 4. Validation

- Prefer custom validators from `@core-custom-validators`.
- Do not use `class-validator` decorators directly when an existing custom validator covers the need.
- For type checks, prefer `ValidateType()` with `FieldTypeEnum`.
- If a required validator does not exist, add it to `libs/@anvix/server-core/custom-validators`.
- Use dedicated query DTOs with `@Query()` for list/search endpoints.

Example:

```typescript
import { ValidateNotEmpty, ValidateType } from '@core-custom-validators';
import { FieldTypeEnum } from '@core-enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRequestDto {
    @ApiProperty({ description: 'User email address' })
    @ValidateNotEmpty({ constraints: { field: 'email' } })
    @ValidateType({ constraints: { field: 'email', type: FieldTypeEnum.String } })
    email: string;
}
```

## 5. Swagger

- Add Swagger metadata to every endpoint and DTO.
- Use `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`, and the project `ApiResponseStatus` decorator.
- Always pass the response DTO to `ApiResponseStatus` when the endpoint returns data.
- For DTO/object properties in `@ApiProperty()`, prefer `type` over large object examples.
- Add meaningful descriptions to DTO properties.

Example:

```typescript
@ApiResponseStatus('Get user by ID', [HttpStatus.OK, HttpStatus.NOT_FOUND], 'User', UserResponseDto)
```

For list endpoints, use the common response DTO pattern:

```typescript
@ApiResponseStatus('List users', [HttpStatus.OK], 'User', CommonSearchResponseDto, UserResponseDto)
```

## 6. Entities And Database

- Use UUID primary keys with `@PrimaryGeneratedColumn('uuid')` unless a custom identity is required.
- Use TypeORM entities under `libs/@anvix/server-core/database/entities`.
- Use soft delete for removable records.
- Define unique constraint names in constants such as `DatabaseUniqueKey`.
- Avoid hardcoded database constraint names.
- Use field length constants from `@core-constants` for string columns and matching DTO validation.
- Keep migrations under `libs/@anvix/server-core/database/migrations`.

Tenant-owned entities must extend one of:

- `BaseTenantModifiableEntity`
- `BaseTenantModifiableEntityWithoutIdentity`

System-wide entities such as `Tenant` should extend `BaseSystemModifiableEntity`.

## 7. Repositories

- Repositories handle direct database access and complex query construction.
- Services should not inject TypeORM `Repository<T>` directly for tenant-owned entities.
- Tenant-owned repositories must extend `TenantAwareRepository<T>`.
- Tenant-owned repositories must be request-scoped with `@Injectable({ scope: Scope.REQUEST })`.
- Tenant-owned repositories must inject `AsyncContextService` from `@core-generic-services`.
- Return only fields needed by the API. Do not select everything by habit.
- Use TypeORM QueryBuilder for complex queries.
- Use enums/constants instead of hardcoded strings.
- Avoid circular dependencies between repositories.

Example:

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

## 8. Services

- Services contain business logic.
- Controllers should call services and avoid business rules.
- Services should orchestrate repositories and shared services.
- Services should return `AppResponse` where that is the existing module pattern.
- Use success constants consistently.
- Do not perform database query construction in controllers.
- Keep transaction logic in services or repositories, depending on the existing module pattern.
- Use TypeORM `QueryRunner` for multi-step transactional writes.

## 9. Controllers And APIs

- Controllers handle HTTP request/response concerns only.
- Use RESTful resource names; prefer plural nouns such as `/users`.
- Use HTTP methods according to intent:
  - `GET` for reads
  - `POST` for create/actions
  - `PUT` or `PATCH` for updates
  - `DELETE` for deletes
- Use `ParseUUIDPipe` for UUID route parameters.
- Use dedicated request DTOs for body and query validation.
- Apply guards and `@ApiBearerAuth()` consistently on protected routes.
- Apply `@RequirePermissions()` where permission checks are required.

Example:

```typescript
@Get(':id')
async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getById(id);
}
```

## 10. List Endpoints

- List endpoints must support pagination.
- Add search/filter/sort support where the product workflow needs it.
- Use `CommonSearchResponseDto` for list responses.
- Repository methods should return `[items, total]` when using TypeORM pagination.
- Services should map entities into response DTOs.

Example service shape:

```typescript
const [users, total] = await this.userRepository.findUsers(request);
const data = users.map((user) => new UserResponseDto(user));
const response = new CommonSearchResponseDto(data, request.pageSize, request.pageNumber, total);
return new AppResponse(SuccessConstant.SuccessAction, { data: response }, { module: 'User', action: 'fetched' });
```

## 11. Error Handling

- Use NestJS exceptions for invalid flows.
- Use standard error keys from `libs/@anvix/server-core/utilities/i18n/en/error.json`.
- Prefer structured error payloads when module/action context matters.
- Avoid hardcoded user-facing error text in services.

Common error keys:

```text
ERR_MODULE_NOT_FOUND
ERR_MIN_LENGTH
ERR_MAX_LENGTH
ERR_REQUIRED
ERR_TYPE
ERR_IS_ENUM
ERR_DELETED
ERR_NOT_VALID
ERR_ALPHA_NUMERIC
ERR_UNIQUE_ARRAY_ITEM
ERR_ONLY_SPACE
ERR_MIN_VALUE
ERR_MAX_VALUE
```

## 12. Constants

- Put shared constants in `libs/@anvix/server-core/constants`.
- Use entity-specific constants for field lengths.
- Use permission constants from `permissions.constant.ts`.
- Use success constants from `success.constant.ts`.
- Do not scatter magic strings across controllers/services/repositories.

## 13. Permissions And Security

- Add new module names to `MODULE_CONSTANTS`.
- Add default module permissions to `DEFAULT_PERMISSIONS` if the module is permission-controlled.
- Use `@RequirePermissions()` on permission-protected endpoints.
- Use the guard pattern already used by the surrounding controller.
- Use `@ApiBearerAuth()` for bearer-token endpoints.
- Confirm product-owner/super-admin behavior before depending on bypass behavior.

## 14. Multi-Tenancy

- Tenant-owned data must use tenant-aware base entities.
- Tenant-owned repositories must extend `TenantAwareRepository<T>`.
- `TenantAwareRepository` filters normal repository/query-builder reads by tenant when `tenantId` exists.
- Raw SQL and database views must manually include tenant filtering.
- Use `createQueryBuilderUnfiltered()` only for intentional system-level operations.
- Never trust a caller-provided tenant ID without validating request context.

See `libs/@anvix/documents/TENANT_GUIDE.md` for the detailed tenant architecture.

## 15. Dependency Management

- Avoid circular dependencies.
- Do not use `forwardRef()` in repositories.
- Use `forwardRef()` in modules only as a last resort.
- If two services need each other, extract shared behavior into a third service/helper or use event-style coordination.
- Keep dependency direction clear:

```text
Controller -> Service -> Repository -> Entity
```

## 16. Async Code

- Use `async/await` for asynchronous operations.
- Do not mark a method `async` if it only returns another promise without awaiting.
- Keep asynchronous error handling clear and close to the operation that can fail.

## 17. Comments

- Add comments for classes and public methods where they clarify intent.
- Avoid comments that merely repeat the code.
- Prefer concise comments around business rules, security-sensitive logic, and non-obvious query behavior.

## 18. Before Finishing A Change

- Run the relevant build/lint/test command when practical.
- Update docs when folder structure, migrations, tenant behavior, API patterns, or standards change.
- Check for stale duplicate documentation before adding new standards files.


