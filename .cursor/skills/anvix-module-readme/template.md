# {Module display name} Module

> Canonical module documentation for `{module}` — domain logic and persistence. HTTP layer: `src/modules/{http-module}/` (if different, note here).

**Last reviewed:** YYYY-MM-DD

---

## Overview

One short paragraph: what this module does in the salon booking platform and which portal/persona primarily uses it.

---

## Functional requirements

What business capabilities this module supports. Tie each item to requirements docs — do not duplicate full API specs here.

| Capability | Requirement source | Status |
| --- | --- | --- |
| {e.g. CRUD service catalog items} | [04-service-availability.md](../../../docs/requirements/user-stories/04-service-availability.md) — US-04.x | ✅ / 🟡 / ⬜ |
| {…} | {user-story file or BRD §} | {status} |

**User stories (summary):**

- **US-XX.Y** — {one-line acceptance focus}
- …

**Out of scope (handled elsewhere):**

- {e.g. booking slot assignment → booking module}

**Planned (not in repo):** *(omit section if none)*

- {capability listed in requirements but not implemented}

---

## Technical depth (logical)

How the module is structured and which cross-cutting rules apply. Describe **behavior and layers**, not every file.

### Architecture layers

```text
HTTP:     {ControllerName}  →  src/modules/{http-module}/{controller}.ts
Domain:   {ServiceName}     →  libs/@anvix/business-core/modules/{module}/{service}.ts
Data:     {RepositoryName} →  libs/@anvix/business-core/modules/{module}/{repository}.ts
Entity:   {EntityName}      →  libs/@anvix/server-core/database/entities/{entity}.entity.ts
```

### Request flow (typical)

1. Client → `{METHOD} {route prefix}` with `{x-tenant-id | exempt}`.
2. Guards: `{JwtAuthGuard, RoleGuard, TenantGuard, …}`.
3. Permission: `{permission keys}`.
4. Controller validates `{RequestDto}` → `{Service}` method.
5. Service: `{business rules summary}` → repository → `{ResponseDto}` / `AppResponse`.

### Tenant & data access

| Aspect | Value |
| --- | --- |
| Data classification | Tenant-owned / system-wide / shared reference |
| Repository base | `TenantAwareRepository` / standard repository / none |
| Tenant header | Required / exempt (`@TenantApi`, `@AllowWithoutTenant`) |

### Key business rules

- {Rule 1 — e.g. unique name per tenant + category}
- {Rule 2}

### Code map

| Concern | Path |
| --- | --- |
| Nest HTTP module | `src/modules/{http-module}/{http-module}.module.ts` |
| Domain module barrel | `libs/@anvix/business-core/modules/{module}/` |
| Permissions module key | `{ModuleNameEnum or MODULE_CONSTANTS value}` |
| API flow diagram | `docs/api flow diagrams/{name}-api-flow-diagram.md` — **keep in sync when APIs change** |

---

## Database tables

Tables this module **reads or writes** to deliver its functionality.

| Table | Entity | Role in this module | Tenant-scoped |
| --- | --- | --- | --- |
| `{table}` | `{Entity}` | Primary / FK lookup / junction | Yes / No |

**Relationships (relevant to this module):**

```text
{parent_table} 1 — * {child_table}  ({fk_column})
```

**Migrations:**

| Migration file | Change |
| --- | --- |
| `{timestamp-Description}.ts` | Created / altered `{table}` |

**Indexes & constraints (if non-obvious):**

- {e.g. unique (tenant_id, category_id, name) on `service`}

---

## Change impact

If this module changes, review these areas before merge.

### Inbound — modules/features that depend on this module

| Dependent | How it depends | Risk if you change |
| --- | --- | --- |
| `{module}` | Imports `{Service}` / queries `{table}` / FK from `{entity}` | {High/Medium/Low — brief} |

*If none found via import and FK analysis:* **No direct code dependents found** (downstream product features may still be planned in requirements).

### Outbound — this module depends on

| Dependency | Usage |
| --- | --- |
| `{module}` | {e.g. validates category exists before create service} |

### Schema & API surface

| Change type | Also update |
| --- | --- |
| Entity / column / FK | Migration under `libs/@anvix/server-core/database/migrations/`, dependent repositories |
| DTO / validation | Swagger on controller, **API flow diagram** (request/response examples, journey table) |
| Permission keys | `permissions.constant.ts`, `MODULE_CONSTANTS`, role seeds, diagram auth/permission notes |
| Removed endpoint | Callers (grep route path), **API flow diagram** (remove route, flows, feature mapping rows) |

### API flow diagram (frontend handoff)

| Item | Value |
| --- | --- |
| Diagram file | `{path from api-flow-diagram-map.md}` |
| Diagram version | `{e.g. 1.0}` |
| Last synced with code | YYYY-MM-DD |

**Must stay aligned with controller when APIs change:** base path, route list, DTO field tables, journey/screen matrix, permission keys, tenant headers, error flows, integration priority (if present).

Use **anvix-api-flow-diagram** to apply updates; do not leave stale paths or request bodies in the diagram.

### Documentation to sync

- [ ] User story status in `docs/requirements/user-stories/{file}.md`
- [ ] **API flow diagram** — mandatory on any HTTP/DTO/guard change (not optional)
- [ ] `.cursor/skills/anvix-requirements/implementation-baseline.md` (when shipping new controllers/entities)

---

## Related links

- Requirements: {links}
- API flow diagram: {link to docs/api flow diagrams/...}
- Tenant guide: `libs/@anvix/documents/TENANT_GUIDE.md`
- Migrations: `libs/@anvix/documents/migrations.md`
