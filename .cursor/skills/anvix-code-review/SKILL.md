---
name: anvix-code-review
description: Review Anvix backend code for architectural correctness, tenant isolation, DTO and Swagger compliance, permission wiring, and migration completeness. Use when reviewing PRs, generated code, or implementation diffs.
---

# Anvix Code Review

## Use This Skill When

- Reviewing code changes in this backend.
- Validating AI-generated module implementations.
- Running a merge-readiness check before commit or PR.

## Canonical Rules

Treat these as source of truth:

- `libs/@anvix/documents/dev-guidelines/coding-standards-v2.md`
- `libs/@anvix/documents/dev-guidelines/architecture-validation-rule-v2.md`

Use supporting references as needed:

- `libs/@anvix/documents/TENANT_GUIDE.md`
- `libs/@anvix/documents/dev-guidelines/coding-standards-rule/repository-standards.md`
- `libs/@anvix/documents/migrations.md`

## Review Order

1. Module boundaries and dependency direction.
2. DTO validation and response mapping quality.
3. Controller thinness and service business logic placement.
4. Repository design and tenant-aware behavior.
5. Permissions and guards.
6. Entity and migration consistency.
7. Swagger completeness.
8. Missing tests and residual risks.

## Critical Findings To Prioritize

- business logic in controllers
- raw entities returned from controllers
- missing request/response DTOs
- query DTO type mismatch (e.g., `@Get` query booleans/numbers not validated as `BooleanString` / `NumberString`)
- raw `@IsBoolean()` / `@IsNumber()` used where project `ValidateType` should be used
- query array fields not normalized (`?x=a` vs `?x=a&x=b`)
- tenant-owned repository not extending `TenantAwareRepository<T>`
- tenant-owned entity not using tenant-aware base entity
- raw SQL without tenant filtering
- missing migration for schema change
- missing guards/permission constants on protected routes
- UUID params without `ParseUUIDPipe`
- introduced circular dependency

## Report Format

Return findings first, ordered by severity:

1. **Critical**
2. **Medium**
3. **Open questions/assumptions**
4. **Brief change summary**

For each issue include:

- file path
- what is wrong
- violated rule
- required fix

If no issues:

- explicitly say no blocking issues found
- still mention test gaps or residual risk
