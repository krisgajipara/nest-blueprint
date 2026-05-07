# Example: user-area modules (reference for prompts)

**Do not treat this as the full architecture spec.** Use **`master-architecture-prompt.md`** + finalized **`coding-standards-v2.md`**.

In this project, **auth** and **user** are usually split:

| Area        | HTTP layer              | Domain layer |
|------------|-------------------------|--------------|
| Login, OTP, register, password | `src/modules/auth/`     | `libs/@anvix/business-core/modules/auth/` |
| User CRUD, listings            | `src/modules/user/`     | `libs/@anvix/business-core/modules/user/` |

## Repository pattern (tenant-owned user data)

- Entity: e.g. `libs/@anvix/server-core/database/entities/user.entity.ts` — tenant-aware base per **`TENANT_GUIDE.md`**.
- Repository: extend **`TenantAwareRepository<User>`**, **`@Injectable({ scope: Scope.REQUEST })`**, inject **`AsyncContextService`** from **`@core-generic-services`**, pass into `super(...)`.

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
        @Inject() asyncContextService: AsyncContextService
    ) {
        super(repository.target, repository.manager, repository.queryRunner, asyncContextService);
    }
}
```

---

Last verified: 2026-05-07
