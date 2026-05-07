# Auth module — prompt add-on (Anvix)

Use with **`master-architecture-prompt.md`**. Detailed rules live in the finalized **`coding-standards-v2.md`** and **`TENANT_GUIDE.md`**.

## Code references

- `src/modules/auth/auth.controller.ts`
- `libs/@anvix/business-core/modules/auth/`

## When extending auth

- DTOs: custom validators + `ValidateType()` / `FieldTypeEnum` per project standards — not ad hoc `class-validator` where the codebase uses custom validators.
- **`TenantAwareRepository`** repos (if any in auth stack): inject **`AsyncContextService`** from **`@core-generic-services`** into `super(...)`, request-scoped.
- Guards: `JwtAuthGuard` / `RoleGuard` / `AuthRoleGuard` — mirror neighboring controllers (see `TENANT_GUIDE.md`).

---

Last verified: 2026-05-07
