Master Prompt: Generate User Module for NestJS Suit Rental Admin Panel (Layered Architecture, Login Page Requirements Enforced)

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
Use custom validators type validation uses ONLY `ValidateType()` with `FieldTypeEnum` - NEVER @IsUUID, @IsString, @IsNumber, @IsDate, etc.
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

Use ClassValidator decorators for all DTOs, especially for login and registration.
Include Swagger decorators for all endpoints and DTOs.
Ensure password hashing for new user registration and password reset.
Implement JWT authentication for protected routes.
Return code separately in files: entity.ts, repository.ts, service.ts, dto/request/.ts, dto/response/.ts, controller.ts, module.ts

Definition of Done:

All required fields and labels are implemented as per specifications.
Validations and error messages are displayed and returned correctly.
Input constraints, formatting rules, and character limits are enforced for both email and password.
Functional elements (Login endpoint, Forgot Password, Password reset) behave as expected.
Successful authentication returns JWT and user info; failed authentication returns correct error message.
