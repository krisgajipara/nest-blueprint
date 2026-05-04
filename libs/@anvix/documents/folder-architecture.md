# Folder Architecture

This document explains the backend folder hierarchy and what each folder or file is consumed for. Module boilerplate files such as `*.module.ts` and barrel files such as `index.ts` are intentionally omitted unless they are important to runtime behavior.

Last verified against repo: 2026-05-04

```text
backend/
|-- config/                                      # Application configuration consumed during bootstrap
|   |-- env/                                     # Environment files consumed by ConfigModule
|   |   `-- development.env                      # Development environment values
|   |-- configuration.ts                         # Central configuration factory consumed by app startup
|   `-- validation.ts                            # Environment validation schema consumed before boot
|-- docs/                                        # Product, portal, and API flow documentation consumed by teams
|   |-- draft/                                   # Draft planning documents
|   |-- portals/                                 # Portal-specific product documentation
|   |   |-- customer/                            # Customer self-service, discovery, and booking flows
|   |   |-- product-owner/                       # Tenant onboarding, policy support, and platform health docs
|   |   |-- salon-admin/                         # Salon admin role, service, and booking operation docs
|   |   `-- staff-view/                          # Staff daily agenda and communication docs
|   |-- auth-api-flow-diagram.md                 # Auth API flow reference
|   |-- role-api-flow-diagram.md                 # Role API flow reference
|   `-- user-api-flow-diagram.md                 # User API flow reference
|-- libs/                                        # Shared packages consumed by the Nest application
|   `-- @anvix/
|       |-- business-core/                       # Business/domain logic consumed by API controllers
|       |   |-- dto/                             # Shared DTOs consumed across domain modules
|       |   |   `-- common-dto/                  # Common API DTOs used by multiple features
|       |   |       |-- error/                   # Error response DTOs consumed by Swagger/API responses
|       |   |       |-- app-response.dto.ts      # Standard API response wrapper DTO
|       |   |       |-- common-dropdown.request.dto.ts
|       |   |       |-- common-dropdown.response.dto.ts
|       |   |       |-- common-search-request.dto.ts
|       |   |       |-- common-search-response.dto.ts
|       |   |       |-- file-upload.dto.ts       # File upload DTO consumed by upload endpoints
|       |   |       `-- generic-cache.request.dto.ts
|       |   `-- modules/                         # Domain modules consumed by src/modules controllers
|       |       |-- auth/                        # Authentication domain logic
|       |       |   |-- dto/                     # Auth request/response DTOs
|       |       |   |   |-- request/             # Login, register, OTP, and password request DTOs
|       |       |   |   `-- response/            # Auth response DTOs
|       |       |   |-- auth.repository.ts       # Auth persistence queries
|       |       |   |-- auth.service.ts          # Auth workflow and business rules
|       |       |   |-- otp.repository.ts        # OTP persistence queries
|       |       |   |-- reset-password-token.repository.ts
|       |       |   `-- token.repository.ts      # Access/refresh token persistence queries
|       |       |-- role/                        # Role and permission domain logic
|       |       |   |-- dto/                     # Role request/response DTOs
|       |       |   |   |-- request/             # Create, update, list, assign, and permission check DTOs
|       |       |   |   `-- response/            # Role response DTOs
|       |       |   |-- role.repository.ts       # Role persistence queries
|       |       |   `-- role.service.ts          # Role and permission business rules
|       |       |-- tenant/                      # Tenant domain logic
|       |       |   |-- dto/                     # Tenant request/response/config DTOs
|       |       |   |   |-- request/             # Create, update, and list tenant DTOs
|       |       |   |   `-- response/            # Tenant public, dropdown, and detail response DTOs
|       |       |   |-- tenant.repository.ts     # Tenant persistence queries
|       |       |   `-- tenant.service.ts        # Tenant onboarding and management rules
|       |       `-- user/                        # User domain logic
|       |           |-- dto/                     # User request/response DTOs
|       |           |   |-- request/             # Create, update, list, and dropdown request DTOs
|       |           |   `-- response/            # User response DTOs
|       |           |-- user.repository.ts       # User persistence queries
|       |           `-- user.service.ts          # User management business rules
|       |-- documents/                           # Internal architecture and engineering docs
|       |   |-- dev-guidelines/                  # Coding standards and implementation guides
|       |   |   |-- coding-standards-rule/       # Detailed architecture, coding, and repository rules
|       |   |   |-- architecture-validation-rule-v2.md
|       |   |   |-- ai-module-generation.md
|       |   |   |-- boilerplate-setup-guide.md
|       |   |   |-- coding-standards-v2.md
|       |   |   `-- profiling-implementation-prompt.md
|       |   |-- README.md                      # Documents index
|       |   |-- DOCUMENTATION_TODO.md          # Documentation cleanup tracker
|       |   |-- folder-architecture.md          # This folder structure reference
|       |   |-- migrations.md                   # Migration workflow reference
|       |   `-- TENANT_GUIDE.md                 # Tenant implementation guide
|       `-- server-core/                         # Infrastructure layer consumed by app and business-core
|           |-- assets/                          # Static profiler dashboard assets
|           |   |-- profiler-dashboard.html       # Profiler dashboard page served by profiler routes
|           |   `-- profiler-dashboard.js         # Profiler dashboard client logic
|           |-- config/                          # Shared infrastructure configuration
|           |   |-- mail.config.ts                # Mail service configuration
|           |   |-- swagger.config.ts             # Swagger/OpenAPI configuration
|           |   `-- typeorm.config.ts             # Runtime TypeORM configuration
|           |-- constants/                       # Shared constant values consumed across the backend
|           |   |-- cache-key.constant.ts         # Cache key names
|           |   |-- entity-key.constant.ts        # Entity key constants
|           |   |-- entity.constant.ts            # Entity name constants
|           |   |-- permissions.constant.ts       # Permission definitions
|           |   |-- success.constant.ts           # Success message keys
|           |   `-- tenant.constant.ts            # Tenant constants
|           |-- context/                         # Async request context storage
|           |   `-- context.storage.ts            # AsyncLocalStorage container consumed by context services
|           |-- custom-decorators/               # Reusable decorators consumed by controllers and DTOs
|           |   |-- api-response.decorator.ts     # Standard Swagger/API response decorator
|           |   |-- field-validator.decorator.ts  # Field validation decorator
|           |   |-- get-user.decorator.ts         # Current user extraction decorator
|           |   `-- require-permissions.decorator.ts
|           |-- custom-guards/                   # Route guards consumed by protected endpoints
|           |   |-- auth-role.guard.ts            # Combined auth/role guard
|           |   |-- jwt-auth.guard.ts             # JWT authentication guard
|           |   `-- role.guard.ts                 # Role/permission authorization guard
|           |-- custom-validators/               # Reusable validation decorators consumed by DTOs
|           |   |-- validate-active-record.ts
|           |   |-- validate-alpha-numeric.ts
|           |   |-- validate-check-only-space.ts
|           |   |-- validate-date-not-future.ts
|           |   |-- validate-email.ts
|           |   |-- validate-enum-type.ts
|           |   |-- validate-file-size.ts
|           |   |-- validate-file-type.ts
|           |   |-- validate-max-length.ts
|           |   |-- validate-max-value.ts
|           |   |-- validate-min-length.ts
|           |   |-- validate-min-value.ts
|           |   |-- validate-not-empty.ts
|           |   |-- validate-optional.ts
|           |   |-- validate-type.ts
|           |   `-- validate-unique-array-item.ts
|           |-- database/                        # Persistence layer consumed by TypeORM and repositories
|           |   |-- base-entities/               # Base classes consumed by concrete entities
|           |   |-- entities/                    # User, tenant, role, token, OTP, and reset token entities
|           |   |-- migrations/                  # Database schema changes and seeders
|           |   |   |-- database-changes/          # Schema migrations consumed by migration scripts
|           |   |   `-- seeders/                  # Seed data migrations consumed by migration scripts
|           |   |-- repositories/                # Shared tenant-aware repository helpers
|           |   |-- subscribers/                 # Audit and tenant TypeORM event subscribers
|           |   `-- data-source.ts               # TypeORM CLI data source
|           |-- email-templates/                 # Handlebars templates consumed by mailer service
|           |   |-- forgot-password.hbs           # Forgot password email template
|           |   `-- user-onboarding.hbs           # User onboarding email template
|           |-- enums/                           # Shared enum definitions consumed by entities, DTOs, and services
|           |-- filters/                         # Global exception handling
|           |   `-- all-exceptions.filter.ts     # Catch-all exception formatter
|           |-- generic-service/                 # Cross-cutting request context services
|           |   |-- async-context.service.ts      # Async context service consumed by middleware and downstream services
|           |   |-- audit-context.service.ts      # Audit metadata context service
|           |   `-- request-context.service.ts    # Request-scoped context service
|           |-- interceptors/                    # Nest interceptors consumed by application pipeline
|           |   |-- profiler.interceptor.ts       # Request profiling interceptor
|           |   `-- req-res.interceptor.ts        # Request/response formatting and logging interceptor
|           |-- interfaces/                      # Shared TypeScript contracts
|           |   |-- app-response.interface.ts
|           |   `-- dynamic-validation-option.interface.ts
|           |-- middleware/                      # Request middleware consumed by Nest bootstrap
|           |   |-- async-context.middleware.ts    # Initializes async request context
|           |   |-- audit.middleware.ts            # Captures audit metadata
|           |   |-- language.middleware.ts         # Resolves request language
|           |   |-- swagger-auth.middleware.ts     # Protects Swagger access
|           |   `-- tenant-context.middleware.ts  # Resolves tenant context
|           |-- shared-modules/                  # Reusable infrastructure services
|           |   |-- cache/                        # Cache service consumed by business services
|           |   |-- context/                      # App context service consumed across request lifecycle
|           |   |-- jwt/                          # JWT service consumed by auth flows
|           |   |-- mailer/                       # Email sender consumed by notification flows
|           |   |-- permission/                   # Permission service consumed by guards/business logic
|           |   |-- profiler/                     # Profiling service consumed by profiler endpoints/interceptor
|           |   `-- s3/                           # S3 storage service consumed by file workflows
|           `-- utilities/                       # Shared helper functions consumed across packages
|               |-- exceptions/                  # Database and Sentry exception helpers
|               |-- i18n/                        # Translation JSON files consumed by translation utility
|               |-- app-aws-secrets.utility.ts   # AWS secrets helper
|               |-- cache.utility.ts             # Cache helper
|               |-- file-filters.utility.ts      # Upload file filter helper
|               |-- generate-otp.utility.ts      # OTP generator
|               |-- logger.utility.ts            # Logger helper
|               |-- module-name-mapper.utility.ts
|               `-- translation.utility.ts       # Translation resolver
|-- requirements/                                # Business requirement documents consumed by planning and delivery
|-- scripts/                                     # Developer and CI automation
|   `-- genai-code-review.js                     # AI code review automation script
|-- src/                                         # Nest presentation/runtime entry layer
|   |-- modules/                                 # API controllers that consume business-core services
|   |   |-- auth/                                # Auth HTTP routes
|   |   |-- profiler/                            # Profiler HTTP routes and dashboard entry
|   |   |-- role/                                # Role HTTP routes
|   |   |-- tenant/                              # Tenant HTTP routes
|   |   `-- user/                                # User HTTP routes
|   |-- app-cluster.service.ts                   # Optional cluster startup support
|   |-- app.controller.ts                        # Root controller consumed by basic app routes
|   `-- main.ts                                  # Nest bootstrap and middleware setup
|-- docker-compose.yml                           # Local Docker service orchestration
|-- Dockerfile                                   # Backend container build recipe
|-- eslint.config.js                             # ESLint rules consumed by lint scripts
|-- example.env                                  # Environment template copied to .env
|-- nest-cli.json                                # Nest CLI configuration
|-- package.json                                 # npm scripts and dependencies
|-- package-lock.json                            # Locked npm dependency tree
|-- tsconfig.build.json                          # TypeScript build configuration
`-- tsconfig.json                                # Base TypeScript configuration
```
