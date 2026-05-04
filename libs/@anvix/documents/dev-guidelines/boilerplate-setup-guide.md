# NestJS Boilerplate Setup Guide

**Version:** 1.0  
**Last Updated:** 2026-01-06

---

## Overview

This boilerplate demonstrates a **production-ready NestJS application architecture** following enterprise-grade coding standards. The User module serves as the reference implementation showcasing all architectural patterns and best practices.

### Key Features

✅ **Clean Architecture** - Strict separation of concerns (Controller → Service → Repository)  
✅ **Type Safety** - Full TypeScript type coverage with zero `any` types  
✅ **Custom Validation** - No class-validator dependencies, custom validators for consistency  
✅ **DTO Standards** - Response mapping in constructors, proper encapsulation  
✅ **Path Aliases** - No relative imports, clean tsConfig path aliases throughout  
✅ **Error Handling** - Standardized error messages with i18n support  
✅ **Swagger Documentation** - Complete API documentation out of the box  
✅ **Caching** - Built-in Redis caching with automatic cache invalidation  
✅ **Security** - UUID validation, authentication guards, permission system ready

---

## Architecture Patterns

### Module Structure

```
src/modules/{module}/          # API Layer
├── {module}.controller.ts      # HTTP endpoints only
└── {module}.module.ts          # NestJS module definition

libs/@oc/business-core/modules/{module}/  # Business Logic Layer
├── dto/
│   ├── request/                # Input validation DTOs
│   └── response/               # Output transformation DTOs
├── {module}.service.ts         # Business logic orchestration
└── {module}.repository.ts      # Data access layer

libs/@oc/server-core/database/
├── entities/                   # TypeORM entities
└── migrations/                 # Database migrations
```

### Layer Responsibilities

#### 1. **Controller Layer**
- Handle HTTP requests/responses
- Validate input using DTOs
- Call service methods
- Return responses
- **NO business logic**
- **NO DTO instantiation**

```typescript
// ✅ Good - Delegates to service
async findAll(@Query() query: ListUserRequestDto): Promise<AppResponse<CommonSearchResponseDto<UserResponseDto>>> {
    return this.userService.findList(query);
}

// ❌ Bad - Business logic in controller
async findAll(@Query() query: ListUserRequestDto) {
    const users = await this.userService.findList(query);
    if (users.data.length === 0) {
        throw new NotFoundException();  // Wrong layer!
    }
    return users;
}
```

#### 2. **Service Layer**
- Contains all business logic
- Orchestrates repositories and other services
- Returns `AppResponse` objects
- Provides internal methods for cross-module communication
- **Strongly typed** - no `any` types

```typescript
// ✅ Good - Type safe and returns AppResponse
async create(createUserData: CreateUserRequestDto): Promise<AppResponse<UserResponseDto>> {
    const existingUser = await this.userRepository.findByEmail(createUserData.email);
    if (existingUser) {
        throw new BadRequestException({ message: "ERR_EMAIL_EXISTS" });
    }
    const user = this.userRepository.create({ ...createUserData, status: UserStatus.ACTIVE });
    const savedUser = await this.userRepository.save(user);
    return new AppResponse(SuccessConstant.AddSuccessAction, new UserResponseDto(savedUser), {
        module: MapToModuleName(ModuleName.USER)
    });
}

// Internal method for other services (returns raw entity)
async findUserByEmail(email: string, userType?: UserTypeEnum): Promise<User | null> {
    return this.userRepository.findByEmail(email, userType);
}
```

#### 3. **Repository Layer**
- Direct database access
- Complex queries using QueryBuilder
- **Selective field returns** - never return all columns
- Semantic method names

```typescript
// ✅ Good - Selective fields
async findById(id: string): Promise<User | null> {
    return this.createQueryBuilder("user")
        .select([
            "user.id",
            "user.firstName",
            "user.lastName",
            "user.email",
            // ... only needed fields
        ])
        .where("user.id = :id", { id })
        .getOne();
}
```

#### 4. **DTO Layer**
- Request DTOs: Input validation
- Response DTOs: Output transformation
- **All mapping logic in DTO constructors**
- Use custom validators from `@core-custom-validators`

```typescript
// ✅ Good - Mapping in constructor
export class UserResponseDto {
    constructor(user: User) {
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        // ... explicit field mapping
        // Password/salt intentionally excluded
    }
}
```

---

## Using This Boilerplate

### 1. Creating a New Module

Follow the User module pattern:

```bash
# 1. Create API module structure
src/modules/product/
├── product.controller.ts
└── product.module.ts

# 2. Create business logic structure
libs/@oc/business-core/modules/product/
├── dto/
│   ├── request/
│   │   ├── create-product.request.dto.ts
│   │   ├── update-product.request.dto.ts
│   │   └── list-product.request.dto.ts
│   ├── response/
│   │   └── product.response.dto.ts
│   └── index.ts
├── product.service.ts
├── product.repository.ts
└── index.ts

# 3. Create database entity
libs/@oc/server-core/database/entities/
└── product.entity.ts
```

### 2. Module Checklist

When creating a new module, ensure:

**Entity:**
- [ ] Extends `BaseModifiableEntity` or `BaseModifiableEntityWithoutIdentity`
- [ ] Uses `@PrimaryGeneratedColumn('uuid')`
- [ ] Uses constants for field lengths (from `@core-constants`)
- [ ] Uses `DatabaseUniqueKey` enum for unique constraints
- [ ] Includes relationships with `cascade: true`

**Repository:**
- [ ] Extends `Repository<T>` with proper constructor
- [ ] Uses `@Injectable()` decorator
- [ ] All methods return selective fields (use `.select()`)
- [ ] Complex queries use QueryBuilder
- [ ] Uses enums instead of hardcoded strings

**Service:**
- [ ] Uses `@Injectable()` decorator
- [ ] All parameters strongly typed (no `any`)
- [ ] Returns `AppResponse` for API methods
- [ ] Provides internal methods for cross-module use
- [ ] Uses `Logger` with `GenerateLogPrefix`
- [ ] Implements caching where appropriate

**Controller:**
- [ ] Uses proper HTTP decorators (`@Get`, `@Post`, `@Put`, `@Delete`)
- [ ] All routes documented with Swagger decorators
- [ ] Uses `@ApiResponseStatus` with 4th parameter (Response DTO)
- [ ] Uses `ParseUUIDPipe` for UUID parameters
- [ ] Uses `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth()`
- [ ] Strongly typed return types

**DTOs:**
- [ ] Request DTOs use custom validators only
- [ ] Response DTOs map in constructor
- [ ] All exports through `index.ts`
- [ ] Nested objects use private DTO classes
- [ ] Swagger decorators on all properties

**Module Definition:**
- [ ] Exports **only** the Service (never Repository)
- [ ] Imports required modules
- [ ] Registers entities via `TypeOrmModule.forFeature([])`

---

## Validation Standards

### Custom Validators

**Always use custom validators from `@core-custom-validators`:**

```typescript
// ❌ WRONG - class-validator
import { IsString, IsEmail, IsUUID } from 'class-validator';

@IsString()
@IsEmail()
firstName: string;

// ✅ CORRECT - custom validators
import { ValidateType, ValidateEmail, ValidateNotEmpty } from '@core-custom-validators';
import { FieldTypeEnum } from '@core-enums';

@ValidateNotEmpty({ constraints: { field: 'First name' } })
@ValidateType({ constraints: { field: 'firstName', type: FieldTypeEnum.String } })
firstName: string;

@ValidateEmail({ constraints: { field: 'Email' } })
email: string;
```

### Available Custom Validators

- `@ValidateType()` - Type validation (String, Number, UUID, Date, etc.)
- `@ValidateNotEmpty()` - Required field validation
- `@ValidateOptional()` - Optional field marker
- `@ValidateEmail()` - Email format validation
- `@ValidateMinLength()` / `@ValidateMaxLength()` - String length
- `@ValidateMinValue()` / `@ValidateMaxValue()` - Number range
- `@ValidateEnumType()` - Enum validation
- `@ValidateFileType()` / `@ValidateFileSize()` - File validation
- `@ValidateAlphaNumeric()` - Alphanumeric validation
- `@ValidateUniqueArrayItem()` - Array uniqueness

---

## Import Standards

**ALWAYS use tsConfig path aliases:**

```typescript
// ❌ WRONG - Relative imports
import { User } from '../../../server-core/database/entities/user.entity';
import { CreateUserDto } from '../../dto/request/create-user.dto';

// ✅ CORRECT - Path aliases
import { User } from '@core-database';
import { CreateUserRequestDto } from '@business-core-modules';
```

### Available Path Aliases

| Alias | Path | Usage |
|-------|------|-------|
| `@business-core-dto` | `libs/@oc/business-core/dto` | Common DTOs |
| `@business-core-modules` | `libs/@oc/business-core/modules` | Business modules |
| `@core-database` | `libs/@oc/server-core/database` | Entities, migrations |
| `@core-enums` | `libs/@oc/server-core/enums` | Enums |
| `@core-constants` | `libs/@oc/server-core/constants` | Constants |
| `@core-utilities` | `libs/@oc/server-core/utilities` | Utility functions |
| `@core-custom-validators` | `libs/@oc/server-core/custom-validators` | Validators |
| `@core-custom-decorators` | `libs/@oc/server-core/custom-decorators` | Decorators |
| `@core-custom-guards` | `libs/@oc/server-core/custom-guards` | Guards |
| `@core-shared-modules` | `libs/@oc/server-core/shared-modules` | Shared modules |

---

## Response Standards

### AppResponse Structure

```typescript
// Service returns AppResponse
return new AppResponse(
    SuccessConstant.AddSuccessAction,  // Message constant
    new UserResponseDto(savedUser),     // Data (DTO instance)
    { module: MapToModuleName(ModuleName.USER) }  // Context
);
```

### Success Messages

```typescript
// Specific actions
SuccessConstant.AddSuccessAction      // "User has been added successfully"
SuccessConstant.UpdateSuccessAction   // "User has been updated successfully"
SuccessConstant.RemoveSuccessAction   // "User has been removed successfully"
SuccessConstant.DetailFetch           // "User details fetched successfully"
SuccessConstant.ListFetch             // "User list fetched successfully"

// Generic action
SuccessConstant.SuccessAction         // Use with { module: 'Entity', action: 'verb' }
```

### List Endpoints

**Always return `CommonSearchResponseDto`:**

```typescript
async findList(searchRequest: ListUserRequestDto): Promise<AppResponse<CommonSearchResponseDto<UserResponseDto>>> {
    const [users, total] = await this.userRepository.findUsers(searchRequest);
    
    const userDtos = users.map(user => new UserResponseDto(user));
    
    const response = new CommonSearchResponseDto(
        userDtos,
        searchRequest.pageSize || 10,
        searchRequest.pageNumber || 1,
        total
    );
    
    return new AppResponse(SuccessConstant.ListFetch, response, { 
        module: MapToModuleName(ModuleName.USER) 
    });
}
```

**Swagger Documentation:**
```typescript
@ApiResponseStatus(
    "List all users with pagination, search, and filters",
    [HttpStatus.OK, HttpStatus.BAD_REQUEST],
    USER_MODULE_NAME,
    CommonSearchResponseDto,      // 4th parameter
    UserResponseDto               // 5th parameter (generic type)
)
```

---

## Database Standards

### Entity Definition

```typescript
@Entity("user")
@Unique(DatabaseUniqueKey.UserEmailUserType, ["email", "userType", "deletedAt"])
export class User extends BaseModifiableEntityWithoutIdentity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "varchar",
        length: UserEntityConstant.FirstNameMaxLength,
        name: "first_name",
        nullable: false
    })
    firstName: string;

    @Column({
        type: "enum",
        enum: UserStatus,
        name: "status",
        nullable: false,
        default: UserStatus.ACTIVE
    })
    status: UserStatus;
}
```

### Migration Naming

```
database-changes/     # Schema changes
├── 1700000000000-initial-setup.ts
└── 1700000000001-add-user-role.ts

seeds/               # Data seeds
└── 1700000002000-SEED-super-admin-user.ts

functions/           # Database functions
└── 1700000001001-FUNCTION-add-dashboard-kpis.ts
```

---

## Error Handling

### Standard Error Keys

```typescript
// Use standardized error keys from error.json
throw new BadRequestException({ 
    message: "ERR_EMAIL_EXISTS" 
});

throw new NotFoundException({ 
    message: "ERR_MODULE_NOT_FOUND", 
    module: MapToModuleName(ModuleName.USER) 
});
```

**Available Error Keys:**
- `ERR_MODULE_NOT_FOUND`
- `ERR_EMAIL_EXISTS`
- `ERR_MIN_LENGTH`
- `ERR_MAX_LENGTH`
- `ERR_REQUIRED`
- `ERR_TYPE`
- `ERR_IS_ENUM`
- `ERR_DELETED`
- `ERR_NOT_VALID`
- `ERR_ALPHA_NUMERIC`
- `ERR_UNIQUE_ARRAY_ITEM`
- `ERR_ONLY_SPACE`
- `ERR_MIN_VALUE`
- `ERR_MAX_VALUE`

---

## Testing Your Module

### Compilation Check
```bash
npm run build
```

### Run Validation Audit
Use the validation standards from `architecture-validation-rule-v2.md` and `coding-standards-v2.md` to check:

1. ✅ Module boundaries (only Service exported)
2. ✅ DTO standards (custom validators, constructor mapping)
3. ✅ Type safety (no `any` types)
4. ✅ Import paths (tsConfig aliases only)
5. ✅ Response structure (AppResponse with DTOs)
6. ✅ Error handling (standard error keys)

---

## Quick Reference: Do's and Don'ts

### ✅ DO

- Use custom validators from `@core-custom-validators`
- Map all data in Response DTO constructors
- Export only Services from modules
- Use `AppResponse` for all service methods
- Use path aliases for all imports
- Return selective fields from repositories
- Use `ParseUUIDPipe` for UUID parameters
- Document all endpoints with Swagger
- Use constants for field lengths and messages
- Provide internal methods for cross-module communication

### ❌ DON'T

- Use class-validator type decorators (`@IsString`, `@IsUUID`, etc.)
- Use `any` type anywhere
- Export Repositories from modules
- Use relative imports (`../../`)
- Return all entity fields from repositories
- Put business logic in controllers
- Transform data in services (belongs in DTOs)
- Use hardcoded strings for error messages
- Instantiate DTOs in controllers
- Use `Object.assign()` in DTO constructors

---

## Next Steps

1. **Study the User Module** - Review all files to understand patterns
2. **Create Your First Module** - Follow the checklist above
3. **Run Validation** - Use the validation rules to check compliance
4. **Iterate** - Refine based on feedback

Happy coding! 🚀
