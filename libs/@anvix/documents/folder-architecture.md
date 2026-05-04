└── 📁libs
    └── 📁@oc
        └── 📁business-core
            ├── 📁dto
            │   ├── 📁common-dto
            │   │   ├── app-response.dto.ts                                 # Standard API response wrapper
            │   │   ├── common-dropdown.request.dto.ts                     # Dropdown request DTO
            │   │   ├── common-dropdown.response.dto.ts                    # Dropdown response DTO
            │   │   ├── common-search-request.dto.ts                        # Pagination and filtering
            │   │   ├── common-search-response.dto.ts                       # Paginated response format
            │   │   ├── file-upload.dto.ts                                  # File upload handling
            │   │   ├── generic-cache.request.dto.ts                        # Cache management
            │   │   ├── index.ts                                            # Common DTO exports
            │   │   └── 📁error
            │   │       ├── index.ts                                        # Error DTO exports
            │   │       ├── internal-server-error.response.dto.ts          # Internal server error response
            │   │       └── unauthorized.response.dto.ts                    # Unauthorized error response
            │   └── index.ts                                                # DTO exports
            ├── 📁modules                                                   # Business logic per module
            │   ├── 📁auth
            │   │   ├── auth.repository.ts                                  # Authentication repository
            │   │   ├── auth.service.ts                                     # Authentication service
            │   │   ├── index.ts                                            # Auth module exports
            │   │   ├── otp.repository.ts                                   # OTP repository
            │   │   ├── reset-password-token.repository.ts                 # Reset password token repository
            │   │   ├── token.repository.ts                                # Token repository
            │   │   └── 📁dto
            │   │       ├── index.ts                                        # Auth DTO exports
            │   │       ├── 📁request
            │   │       │   ├── base-email-request.dto.ts                   # Base email request
            │   │       │   ├── change-password.request.dto.ts              # Change password request
            │   │       │   ├── forgot-password.request.dto.ts              # Forgot password request
            │   │       │   ├── index.ts                                    # Auth request DTO exports
            │   │       │   ├── login.request.dto.ts                        # Login request
            │   │       │   ├── otp-left-time.request.dto.ts                # OTP left time request
            │   │       │   ├── otp-verify.request.dto.ts                   # OTP verify request
            │   │       │   ├── register.request.dto.ts                     # Register request
            │   │       │   ├── resend-otp.request.dto.ts                   # Resend OTP request
            │   │       │   └── reset-password.request.dto.ts               # Reset password request
            │   │       └── 📁response
            │   │           ├── auth-response.dto.ts                        # Auth response
            │   │           └── index.ts                                    # Auth response DTO exports
            │   ├── 📁user
            │   │   ├── index.ts                                            # User module exports
            │   │   ├── user.repository.ts                                  # User repository
            │   │   ├── user.service.ts                                     # User service
            │   │   └── 📁dto
            │   │       ├── index.ts                                        # User DTO exports
            │   │       ├── 📁request
            │   │       │   ├── create-user.request.dto.ts                  # Create user request
            │   │       │   ├── index.ts                                    # User request DTO exports
            │   │       │   ├── list-user.request.dto.ts                    # List user request
            │   │       │   ├── update-user.request.dto.ts                  # Update user request
            │   │       │   └── user-dropdown.request.dto.ts                # User dropdown request
            │   │       └── 📁response
            │   │           ├── index.ts                                    # User response DTO exports
            │   │           ├── user-kpi.response.dto.ts                    # User KPI response
            │   │           ├── user-plan-detail.response.dto.ts            # User plan detail response
            │   │           ├── user-plan.response.dto.ts                   # User plan response
            │   │           └── user.response.dto.ts                        # User response
            │   └── index.ts                                                # Module exports
            └── index.ts                                                    # Business core exports
        └── 📁documents
            ├── 📁dev-guidelines
            │   ├── architecture-validation-rule-v2.md                     # Architecture validation rules
            │   ├── boilerplate-setup-guide.md                             # Boilerplate setup guide
            │   ├── coding-standards-v2.md                                 # Coding standards
            │   └── 📁coding-standards-rule
            │       ├── architecture-validation-rule.md                    # Architecture validation rule
            │       ├── coding-standards.md                                # Coding standards
            │       └── repository-standards.md                            # Repository standards
            ├── folder-architecture.md                                     # This file - project structure
            └── migrations.md                                              # Database migration guide
        └── 📁server-core
            ├── 📁config
            │   ├── index.ts                                                # Config exports
            │   ├── mail.config.ts                                          # Email service config
            │   ├── swagger.config.ts                                       # API documentation config
            │   └── typeorm.config.ts                                       # Database config
            └── 📁constants                                                 # Constant store
            │   ├── attachment.constant.ts                                  # Attachment constants
            │   ├── entity-key.constant.ts                                  # Entity key constants
            │   ├── entity.constant.ts                                      # Entity constants
            │   ├── index.ts                                                # Constants exports
            │   ├── permissions.constant.ts                                 # Permissions constants
            │   └── success.constant.ts                                     # Success constants
            ├── 📁custom-decorators
            │   ├── api-response.decorator.ts                               # Response formatting
            │   ├── field-validator.decorator.ts                            # Field validation decorator
            │   ├── get-user.decorator.ts                                   # User extraction from request
            │   └── index.ts                                                # Decorator exports
            ├── 📁custom-guards
            │   ├── index.ts                                                # Guard exports
            │   └── jwt-auth.guard.ts                                       # JWT authentication guard
            ├── 📁custom-validators
            │   ├── custom-validator.module.ts                              # Validator module setup
            │   ├── index.ts                                                # Validator exports
            │   ├── validate-active-record.ts                               # Check if record is active
            │   ├── validate-alpha-numeric.ts                               # Alphanumeric validation
            │   ├── validate-check-only-space.ts                            # Prevent space-only input
            │   ├── validate-date-not-future.ts                             # Date not future validation
            │   ├── validate-email.ts                                       # Email format validation
            │   ├── validate-enum-type.ts                                   # Enum value validation
            │   ├── validate-file-size.ts                                   # File size validation
            │   ├── validate-file-type.ts                                   # File type validation
            │   ├── validate-max-length.ts                                  # Maximum length validation
            │   ├── validate-max-value.ts                                   # Maximum value validation
            │   ├── validate-min-length.ts                                  # Minimum length validation
            │   ├── validate-min-value.ts                                   # Minimum value validation
            │   ├── validate-not-empty.ts                                   # Required field validation
            │   ├── validate-optional.ts                                    # Optional field validation
            │   ├── validate-type.ts                                        # Data type validation
            │   └── validate-unique-array-item.ts                           # Unique array item validation
            └── 📁database
                ├── 📁base-entities
                │   ├── base-creatable-entity.ts                            # Base entity with creation tracking
                │   ├── base-modifiable-entity.ts                           # Base entity with modification tracking
                │   ├── base-modifiable-without-identity-entity.ts          # Base entity without identity
                │   └── identity.ts                                         # Identity management
                ├── 📁entities
                │   ├── index.ts                                            # Entity exports
                │   ├── otp.entity.ts                                       # OTP entity
                │   ├── reset-password-token.entity.ts                      # Reset password token entity
                │   ├── token.entity.ts                                     # Token entity
                │   └── user.entity.ts                                      # User entity
                ├── 📁migrations
                │   ├── 📁database-changes
                │   │   └── 1700000000000-initial-tenant-setup.ts          # Initial tenant setup migration
                │   └── 📁seeds
                │       └── 1700000002000-SEED-super-admin-user.ts          # Super admin user seed
                ├── 📁subscribers
                │   └── audit.subscriber.ts                                 # Audit subscriber
                ├── data-source.ts                                          # TypeORM configuration
                └── index.ts                                                # Database exports
            └── 📁email-templates
                ├── forgot-password.hbs                                     # Forgot password email template
                └── user-onboarding.hbs                                     # User onboarding email template
            └── 📁enums                                                     # All enums
                ├── field-type.enum.ts                                     # Field type enum
                ├── id-proof-type.enum.ts                                  # ID proof type enum
                ├── index.ts                                               # Enum exports
                ├── module-name.enum.ts                                    # Module name enum
                ├── order-direction.enum.ts                                # Order direction enum
                ├── otp-type.enum.ts                                       # OTP type enum
                ├── payment-method.enum.ts                                 # Payment method enum
                ├── payment-status.enum.ts                                 # Payment status enum
                ├── salary-payment-type.enum.ts                            # Salary payment type enum
                ├── show-payment-status.enum.ts                            # Show payment status enum
                ├── translation-file.enum.ts                               # Translation file enum
                ├── user-status.enum.ts                                    # User status enum
                └── user-type.enum.ts                                      # User type enum
            └── 📁filters                                                   # Filters
                ├── all-exceptions.filter.ts                                # Catch all exceptions
                └── index.ts                                               # Filter exports
            └── 📁generic-service
                ├── audit-context.service.ts                               # Audit context service
                └── index.ts                                               # Generic service exports
            └── 📁interceptors                                              # Interceptors
                ├── index.ts                                               # Interceptor exports
                └── req-res.interceptor.ts                                  # Request response interceptor
            └── 📁interfaces                                                # Interfaces
                ├── app-response.interface.ts                              # App response interface
                ├── dynamic-validation-option.interface.ts                 # Dynamic validation option interface
                └── index.ts                                               # Interface exports
            └── 📁middleware                                                # Middleware
                ├── audit.middleware.ts                                    # Audit middleware
                ├── index.ts                                               # Middleware exports
                └── language.middleware.ts                                  # Language middleware
            └── 📁shared-modules                                            # Shared modules
                ├── 📁cache
                │   ├── app-cache.module.ts                                # Cache module
                │   └── app-cache.service.ts                               # Cache service
                ├── 📁jwt
                │   ├── app-jwt.module.ts                                  # JWT module
                │   └── app-jwt.service.ts                                 # JWT service
                ├── 📁mailer
                │   ├── app-mailer.module.ts                               # Mailer module
                │   └── app-mailer.service.ts                              # Mailer service
                ├── 📁s3
                │   ├── app-s3.module.ts                                   # S3 module
                │   └── app-s3.service.ts                                  # S3 service
                ├── index.ts                                               # Shared modules exports
                └── shared.module.ts                                       # Shared module
            └── 📁utilities                                                 # Utilities
                ├── cache.utility.ts                                       # Cache utility
                ├── 📁exceptions
                │   ├── database-exception.utility.ts                      # Database exception utility
                │   └── sentry-exception.utility.ts                        # Sentry exception utility
                ├── generate-otp.utility.ts                                # OTP generation utility
                ├── 📁i18n
                │   └── 📁en
                │       ├── error.json                                     # Error messages
                │       └── success.json                                  # Success messages
                ├── index.ts                                               # Utility exports
                ├── logger.utility.ts                                      # Logger utility
                ├── module-name-mapper.utility.ts                          # Module name mapper utility
                ├── README.md                                              # Utility documentation
                └── translation.utility.ts                                 # Translation utility
            └── index.ts                                                    # Server core exports
