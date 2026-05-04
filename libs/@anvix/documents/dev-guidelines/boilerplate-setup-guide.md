# NestJS Boilerplate Setup Guide

This guide explains how to create or update backend modules using the current Anvix architecture.

Last verified against repo: 2026-05-04

Use these documents together:

- `libs/@anvix/documents/folder-architecture.md`
- `libs/@anvix/documents/TENANT_GUIDE.md`
- `libs/@anvix/documents/migrations.md`
- `libs/@anvix/documents/dev-guidelines/coding-standards-v2.md`
- `libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md`

## Architecture

```text
src/modules/{module}/                         # API/presentation layer
|-- {module}.controller.ts                     # HTTP routes only
`-- {module}.module.ts                         # Nest module wiring

libs/@anvix/business-core/modules/{module}/    # Business/domain layer
|-- dto/
|   |-- request/                               # Request DTOs
|   `-- response/                              # Response DTOs
|-- {module}.repository.ts                     # Data access
|-- {module}.service.ts                        # Business logic
`-- index.ts                                   # Public exports

libs/@anvix/server-core/database/
|-- entities/                                  # TypeORM entities
`-- migrations/
    |-- database-changes/                      # Schema migrations
    `-- seeders/                               # Seed data migrations
```

## Layer Responsibilities

### Controller Layer

Controllers:

- define routes
- receive request DTOs
- apply guards and permissions
- define Swagger metadata
- call service methods
- return service responses

Controllers must not:

- contain business logic
- build database queries
- instantiate response DTOs
- perform complex data mapping

### Service Layer

Services:

- contain business rules
- orchestrate repositories and shared services
- return `AppResponse` for API-facing methods where that is the module pattern
- expose internal methods for cross-module service-to-service use when needed
- manage transactions for multi-step writes when needed

### Repository Layer

Repositories:

- perform database access
- use QueryBuilder for complex reads
- select only fields needed by the use case
- use semantic method names
- extend `TenantAwareRepository<T>` for tenant-owned entities

### DTO Layer

DTOs:

- validate request input
- shape response output
- keep response mapping explicit
- avoid leaking sensitive entity fields
- include Swagger metadata

## New Module Workflow

Use this order for a new module:

1. Define the entity in `libs/@anvix/server-core/database/entities`.
2. Export the entity from `entities/index.ts` if it needs alias imports.
3. Add constants/enums if needed.
4. Add request DTOs under `libs/@anvix/business-core/modules/{module}/dto/request`.
5. Add response DTOs under `libs/@anvix/business-core/modules/{module}/dto/response`.
6. Add the repository under `libs/@anvix/business-core/modules/{module}`.
7. Add the service under `libs/@anvix/business-core/modules/{module}`.
8. Add controller and module files under `src/modules/{module}`.
9. Wire module imports/exports.
10. Add permissions to `permissions.constant.ts` if the module is protected by permissions.
11. Generate or create migrations.
12. Update docs when folder structure, APIs, tenant behavior, or migration behavior changes.
13. Run build/lint/tests where practical.

## Example Folder Shape

```text
src/modules/booking/
|-- booking.controller.ts
`-- booking.module.ts

libs/@anvix/business-core/modules/booking/
|-- dto/
|   |-- request/
|   |   |-- create-booking.request.dto.ts
|   |   |-- list-booking.request.dto.ts
|   |   `-- update-booking.request.dto.ts
|   `-- response/
|       `-- booking.response.dto.ts
|-- booking.repository.ts
|-- booking.service.ts
`-- index.ts

libs/@anvix/server-core/database/entities/
`-- booking.entity.ts
```

## Entity Checklist

- [ ] Entity is in `libs/@anvix/server-core/database/entities`.
- [ ] Tenant-owned entity extends `BaseTenantModifiableEntity` or `BaseTenantModifiableEntityWithoutIdentity`.
- [ ] System-wide entity extends `BaseSystemModifiableEntity` or another non-tenant base entity.
- [ ] UUID primary key is used unless a custom key is required.
- [ ] String lengths use constants from `@core-constants` where available.
- [ ] Unique constraints use shared names such as `DatabaseUniqueKey`.
- [ ] Relationships define join columns where needed.
- [ ] Entity is exported from `entities/index.ts` if imported through `@core-database`.

Example:

```typescript
import { BookingEntityConstant } from '@core-constants';
import { Column, Entity } from 'typeorm';
import { BaseTenantModifiableEntity } from '../base-entities/base-tenant-modifiable-entity';

@Entity('booking')
export class Booking extends BaseTenantModifiableEntity {
    @Column({
        type: 'varchar',
        length: BookingEntityConstant.TitleMaxLength,
        name: 'title',
        nullable: false
    })
    title: string;
}
```

## Repository Checklist

- [ ] Tenant-owned repository extends `TenantAwareRepository<T>`.
- [ ] Tenant-owned repository uses `@Injectable({ scope: Scope.REQUEST })`.
- [ ] Repository injects `RequestContextService` from `@core-shared-modules`.
- [ ] Repository methods return selective fields.
- [ ] Sort fields are whitelisted.
- [ ] Raw SQL manually filters by `tenant_id`.
- [ ] Repository does not call services.

Example:

```typescript
import { Booking, TenantAwareRepository } from '@core-database';
import { RequestContextService } from '@core-shared-modules';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class BookingRepository extends TenantAwareRepository<Booking> {
    constructor(
        @InjectRepository(Booking)
        repository: Repository<Booking>,
        @Inject() requestContextService: RequestContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, requestContextService);
    }
}
```

## Service Checklist

- [ ] Service is injectable.
- [ ] Service contains business rules.
- [ ] Service depends on repositories and shared services.
- [ ] API-facing methods return typed `AppResponse`.
- [ ] Internal methods return raw data only when used by other services.
- [ ] Error keys come from standard translation keys.
- [ ] Multi-step writes use transactions when needed.

## Controller Checklist

- [ ] Controller uses RESTful routes.
- [ ] Protected controller/routes use the correct guard.
- [ ] Protected routes use `@ApiBearerAuth()`.
- [ ] Permission-protected routes use `@RequirePermissions()`.
- [ ] UUID route params use `ParseUUIDPipe`.
- [ ] Request body/query uses DTOs.
- [ ] Responses use `ApiResponseStatus`.
- [ ] Controller delegates to service without business logic.

## DTO Checklist

- [ ] Request DTOs use custom validators from `@core-custom-validators`.
- [ ] Request DTOs include Swagger property decorators.
- [ ] Response DTOs map fields explicitly.
- [ ] Response DTOs exclude sensitive fields.
- [ ] Nested response objects use DTO classes where useful.
- [ ] DTOs are exported through local `index.ts` files.

## Import Aliases

Use aliases from `tsconfig.json` for cross-package imports:

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

Relative imports are acceptable for nearby files that are not exported through an alias barrel. Current entity base classes are imported relatively from `../base-entities/...`.

## List Endpoint Pattern

Repository:

```typescript
async findBookings(request: ListBookingRequestDto): Promise<[Booking[], number]> {
    const qb = this.createQueryBuilder('booking').select([
        'booking.id',
        'booking.title',
        'booking.createdAt'
    ]);

    const SORT_MAP: Record<string, string> = {
        title: 'booking.title',
        createdAt: 'booking.createdAt'
    };

    const orderByField = SORT_MAP[request.sortBy] ?? 'booking.createdAt';
    qb.orderBy(orderByField, request.sortDirection);

    return qb.getManyAndCount();
}
```

Service:

```typescript
async findList(request: ListBookingRequestDto): Promise<AppResponse<CommonSearchResponseDto<BookingResponseDto>>> {
    const [bookings, total] = await this.bookingRepository.findBookings(request);
    const data = bookings.map((booking) => new BookingResponseDto(booking));
    const response = new CommonSearchResponseDto(data, request.pageSize, request.pageNumber, total);

    return new AppResponse(SuccessConstant.SuccessAction, { data: response }, {
        module: 'Booking',
        action: 'fetched'
    });
}
```

## Migration Workflow

Schema migrations go under:

```text
libs/@anvix/server-core/database/migrations/database-changes/
```

Seeders go under:

```text
libs/@anvix/server-core/database/migrations/seeders/
```

Generate schema migration:

```bash
npm run migration:generate --name=database-changes/AddBookingTable
```

Create manual schema migration:

```bash
npm run typeorm -- migration:create libs/@anvix/server-core/database/migrations/database-changes/CreateBookingTable
```

Apply migrations:

```bash
npm run migration:run
```

See `libs/@anvix/documents/migrations.md` for the full migration guide.

## Validation

Before finishing a module:

- [ ] Review `coding-standards-v2.md`.
- [ ] Review `architecture-validation-rule-v2.md`.
- [ ] Run `npm run build` when a database connection is available and applying migrations is intended.
- [ ] Run `npm run lint` where practical.
- [ ] Update `folder-architecture.md` when structure changes.
- [ ] Update API/docs when public behavior changes.

## Do

- Use custom validators.
- Use request and response DTOs.
- Keep controllers thin.
- Keep business logic in services.
- Keep database access in repositories.
- Use tenant-aware repositories for tenant-owned data.
- Use path aliases for cross-package imports.
- Use constants/enums instead of magic strings.
- Add migrations for schema changes.

## Do Not

- Put business logic in controllers.
- Return raw entities from controllers.
- Inject repositories across module boundaries.
- Use direct TypeORM repositories in services for tenant-owned entities.
- Use raw SQL without tenant filtering.
- Add duplicate standards documents.
- Use old migration folder names unless those folders/scripts are actually added.
