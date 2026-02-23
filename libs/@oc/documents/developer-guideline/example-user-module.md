Generate the User module for NestJS Suit Rental Admin Panel using layered architecture.

📁 Location & Structure:

- Entity (Database Layer):
    - libs/@oc/server-core/database/entities/user.entity.ts

// Represents the database table structure for user accounts

- Business Logic Layer:
    - libs/@oc/business-core/modules/user/
        - user.repository.ts // Handles DB queries using TypeORM
        - user.service.ts // Business logic, calls repository
        - 📁dto
            - 📁request // Input validation for APIs
                - create-user.request.dto.ts
                - update-user.request.dto.ts
                - list-user.request.dto.ts
                - login-user.request.dto.ts
                - forgot-password.request.dto.ts
                - reset-password.request.dto.ts
            - 📁response // Output structure for APIs
                - user.response.dto.ts
                - login-response.dto.ts

- API Layer:
    - src/modules/user/
        - user.controller.ts // Defines API routes & Swagger decorators
        - user.module.ts // Declares module, imports service & controller

Entity Fields (user.entity.ts):

- id (uuid, primary key)
- first_name (string)
- last_name (string)
- email (string, unique)
- password (string)
- phone_number (string, nullable)
- role (enum → ADMIN, CUSTOMER, etc.)
- status (enum → ACTIVE, INACTIVE, PENDING_VERIFICATION)
- created_at (timestamp)
- updated_at (timestamp)

Requirements:

- Follow **Controller → Service → Repository → Entity** layered pattern
- Use **TypeScript + NestJS + TypeORM** best practices
- Use **CustomValidator** for DTOs, validation uses ONLY `ValidateType()` with `FieldTypeEnum` - NEVER @IsUUID, @IsString, @IsNumber, @IsDate, etc.
- Use **Swagger decorators** (@ApiTags, @ApiResponse, @ApiProperty) for documentation
- Password should be hashed before saving to DB.

Endpoints (user.controller.ts):

1. POST /users/register → Register a new user
2. POST /users/login → User login (returns JWT token)
3. GET /users/:id → Get user by ID
4. PUT /users/:id → Update user details
5. DELETE /users/:id → Soft delete user (set status = INACTIVE)
6. GET /users → List all users (with search, filter, pagination, sorting)
7. POST /users/forgot-password → Initiate password reset (sends email with token)
8. POST /users/reset-password → Complete password reset (uses token)
9. GET /users/profile → Get current user's profile (requires authentication)
10. PUT /users/profile → Update current user's profile (requires authentication)

Rules & Notes:

- Soft delete: mark status = INACTIVE, do not hard delete
- Follow Controller → Service → Repository → Entity pattern
- Use ClassValidator decorators for DTOs
- Include Swagger decorators for documentation
- All list/search endpoints must support search, filter, pagination, sorting
- Ensure password hashing for new user registration and password reset.
- Implement JWT authentication for protected routes (e.g., /users/profile).
- Return code separately in files: entity.ts, repository.ts, service.ts, dto/request/_.ts, dto/response/_.ts, controller.ts, module.ts
