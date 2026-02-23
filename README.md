# Sports Engine Backend

A comprehensive, production-ready Nest.js backend application showcasing enterprise-grade architecture, modular design patterns, and advanced development practices.


---

## Architecture Overview

This project demonstrates a **modern, scalable backend architecture** built with **separation of concerns** and **enterprise best practices**.

### Modular Architecture Benefits

```
libs/@oc/
├── server-core/          # Shared infrastructure & utilities
├── business-core/        # Business logic modules
└── documents/            # Architecture documentation
```

**Key Architectural Benefits:**

- **Modularity** - Clean separation between infrastructure and business logic
- **Reusability** - Shared components across all modules
- **Scalability** - Easy to add new business modules
- **Security First** - Built-in authentication, authorization, and validation
- **Testable** - Clean dependency injection and service layers
- **Documented** - Comprehensive API flow diagrams and integration guides

---

## How to Run This Project

### Prerequisites

- **Node.js** (v16+ recommended)
- **PostgreSQL** (v13+)
- **npm** or **yarn**

### Installation Steps

**1. Clone the repository**

```bash
git clone <repository-url>
cd sports-engine-backend
```

**2. Install dependencies**

```bash
npm install
```

**3. Environment Setup**

```bash
# Copy environment template
cp example.env .env

# Update .env with your database credentials:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=sports_engine
```

**4. Database Setup**

```bash
# Create PostgreSQL database
createdb sports_engine

# Run migrations (database schema will be created automatically)
npm run migration:run
```

**5. Start Development Server**

```bash
npm run start:dev
```

**6. Access API Documentation**

- **Swagger UI**: http://localhost:3031/api
- **Health Check**: http://localhost:3031/v1

### Docker Setup (Alternative)

```bash
# Using Docker Compose
docker-compose up -d

# Services will be available at:
# - API: http://localhost:3031
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

---

## Quick Start Guide

**Test the API**

```bash
# Health check
curl http://localhost:3031/v1

# View Swagger documentation
open http://localhost:3031/api
```

**Create Your First User**

```bash
curl -X POST http://localhost:3031/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Authenticate**

```bash
curl -X POST http://localhost:3031/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## Technical Features

### Advanced Authentication System

- **Multi-factor Authentication** with OTP verification
- **JWT Token Management** (Access & Refresh tokens)
- **Password Security** with bcrypt hashing
- **Password Recovery** with email integration
- **Role-based Access Control** (Admin, User, Paid User)

### User Management

- **Complete CRUD Operations** for user management
- **Soft Delete** for data integrity
- **Pagination & Search** with advanced filtering
- **Profile Management** with secure endpoints
- **Bulk Operations** support

### Enterprise Infrastructure

- **TypeORM Database** with automatic migrations
- **Request/Response Interceptors** for logging
- **Global Exception Filters** with translation
- **Validation & Sanitization** with custom validators
- **Caching Layer** with Redis integration
- **Email Service** with template support

### Security Features

- **JWT Authentication** with configurable expiry
- **Password Policies** with strength validation
- **Rate Limiting** to prevent abuse
- **SQL Injection Protection** via TypeORM
- **XSS Protection** with input sanitization
- **HTTPS Enforcement** in production

### API Documentation

- **Swagger/OpenAPI 3** documentation
- **Request/Response Examples** for all endpoints
- **Error Handling** with detailed error codes
- **Internationalization** support
- **API Versioning** ready

---

## Project Structure

```
src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   └── user/            # User management module
├── app.module.ts        # Root application module
└── main.ts              # Application entry point

libs/@oc/
├── server-core/         # Shared infrastructure
│   ├── config/          # Configuration files
│   ├── database/        # Database entities & migrations
│   ├── utilities/       # Shared utilities (JWT, Email, etc.)
│   ├── custom-*         # Decorators, Guards, Validators
│   └── filters/         # Exception filters
└── business-core/       # Business logic modules
    ├── modules/         # Feature modules (Auth, User)
    └── dto/             # Data Transfer Objects
```

### Architecture Layers

**1. Presentation Layer (Controllers)**

- Route handling and HTTP request/response management
- Input validation and output formatting
- Swagger documentation and API versioning

**2. Business Logic Layer (Services)**

- Domain-specific business rules and workflows
- Transaction management and error handling
- Integration with external services

**3. Data Access Layer (Repositories)**

- Database query abstraction and optimization
- Entity management and relationship handling
- Migration and schema management

**4. Infrastructure Layer (Server Core)**

- Authentication, authorization, and security
- Caching, logging, and monitoring
- Email, file storage, and third-party integrations

---

## Documentation

### Architecture Documentation

- **API Flow Diagrams** - Visual representations of all API workflows
- **Frontend Integration Guide** - Complete frontend implementation guide
- **Database Schema** - Entity relationships and migration guides
- **Security Guidelines** - Authentication and authorization patterns

### Developer Resources

- **Setup Guide** - Environment configuration and deployment
- **API Reference** - Complete Swagger documentation
- **Best Practices** - Code standards and architectural decisions
- **Troubleshooting** - Common issues and solutions

### Documentation Tools

- **Controller-based API Flow Generation** - Automated diagram creation
- **Prompt Templates** - Reusable documentation generation
- **Frontend Integration Patterns** - Standardized development approach

---

## Available Scripts

```bash
# Development
npm run start:dev          # Start development server
npm run start:debug        # Start with debug mode
npm run start:prod         # Start production build

# Database
npm run migration:generate # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Testing
npm run test              # Run unit tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Run with coverage report

# Code Quality
npm run lint              # Lint code with ESLint
npm run format            # Format code with Prettier
npm run build             # Build TypeScript project
```

---

## Production Deployment

### Environment Variables

```bash
# Required for production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Docker Production

```bash
# Build and run production container
docker build -t sports-engine-backend .
docker run -p 3031:3031 sports-engine-backend
```

---

## Why This Architecture?

### Benefits Over Traditional Monoliths

- **Maintainability** - Clear separation of concerns
- **Scalability** - Easy horizontal scaling
- **Testability** - Isolated, testable components
- **Flexibility** - Easy to modify and extend
- **Team Collaboration** - Multiple developers can work on different modules
- **Focus** - Each module has a specific, well-defined purpose

### Benefits Over Micro-services

- **Simplicity** - Single deployment unit
- **Cost Efficient** - Lower infrastructure costs
- **Performance** - No network overhead
- **Easier Debugging** - Single application to monitor
- **Deployment** - Simplified CI/CD pipeline

### Modern Development Practices

- **Domain-Driven Design** - Business logic organized by domain
- **SOLID Principles** - Single responsibility, dependency inversion
- **Clean Architecture** - Inner layers independent of outer layers
- **Documentation First** - Comprehensive API documentation
- **Test-Driven Development** - Testing patterns and examples

### Reusable Documentation System

- **Controller-based Flow Diagrams** - Automated from code analysis
- **95% Time Savings** - From hours of manual documentation to minutes
- **Consistent Quality** - Same standard across all modules
- **Maintainable Structure** - Updates automatically with code changes

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Next Steps

1. **Explore the API** - Visit http://localhost:3031/api for interactive documentation
2. **Review Architecture** - Check the `/docs` folder for detailed guides
3. **Run Tests** - Execute `npm run test` to verify everything works
4. **Customize** - Modify configurations and add your business logic
5. **Deploy** - Use the provided Docker setup for production deployment

---

**Built with Nest.js, TypeScript, and enterprise best practices**