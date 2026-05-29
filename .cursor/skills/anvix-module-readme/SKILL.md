---
name: anvix-module-readme
description: >-
  Generate or refresh per-module README.md files documenting functional requirements,
  logical architecture, database tables, change-impact areas, and keep related API flow
  diagrams in sync when HTTP APIs change. Use when the user asks for module README,
  module documentation, impact analysis docs, onboarding docs, or when implementing or
  changing module endpoints (update matching docs/api flow diagrams/*-api-flow-diagram.md).
---

# Anvix Module README Generator

## Use this skill when

- Creating or updating `README.md` for a backend module.
- Onboarding developers to what a module does and what breaks when it changes.
- After shipping or materially changing a module (sync README **and** API flow diagram in the same PR when practical).
- After any change to a module's HTTP API (routes, DTOs, auth, permissions, errors visible to clients).

## README placement

| Module type | Primary `README.md` path |
| --- | --- |
| Standard domain module | `libs/@anvix/business-core/modules/{module}/README.md` |
| HTTP-only (e.g. profiler) | `src/modules/{module}/README.md` |
| Split HTTP names (e.g. `service-category`) | Domain README at business-core path; note HTTP folder in **Code map** |

Do **not** duplicate two full READMEs for the same feature. One canonical README; cross-link the other layer in **Code map**.

## Required read order (before writing)

1. Module source: `libs/@anvix/business-core/modules/{module}/` and `src/modules/{module}/` (if present).
2. Entities: `libs/@anvix/server-core/database/entities/*.entity.ts` used by the module.
3. Requirements: `docs/requirements/user-stories/` — map via [module-requirements-map.md](./module-requirements-map.md).
4. API flow diagram: resolve path via [api-flow-diagram-map.md](./api-flow-diagram-map.md); read current diagram before editing.
5. BRD §10/§12 for planned-only context when needed.
6. For accuracy baseline: `.cursor/skills/anvix-requirements/implementation-baseline.md` when status is unclear.

## Discovery workflow

Copy this checklist while investigating:

```
Module README progress — {module}:
- [ ] Identify module folder name(s) in business-core and src/modules
- [ ] List controllers, routes, permissions
- [ ] List services, repositories, cross-module injections
- [ ] Map entities → @Entity("table_name") → migrations
- [ ] Map functional requirements (user stories + BRD)
- [ ] Document logical flow (request → guard → service → repo → DB)
- [ ] Find inbound dependents (grep imports, TypeORM relations, Nest modules)
- [ ] Find outbound dependencies (what this module imports)
- [ ] Draft README from template; mark unknowns as TBD
- [ ] If HTTP API changed: update API flow diagram (see below)
```

Detailed steps: [discovery-checklist.md](./discovery-checklist.md).

## API flow diagram sync (mandatory when HTTP surface changes)

Whenever a module's **public HTTP contract** changes, update the related API flow diagram in the **same change set** as the code. Do not only update the module README.

**Triggers — update the diagram when any of these change:**

- Route added, removed, or renamed (method, path, path params)
- Request or response DTO fields, validation, or enums exposed to clients
- Auth guards, `@RequirePermissions`, or tenant-header requirements
- Success/error envelope, status codes, or i18n error keys referenced in journeys
- Multipart, headers, or content-type expectations

**Skip diagram update only when:** internal refactor with **no** client-visible HTTP/DTO/guard change (still refresh README if logical depth or tables changed).

**How to update:**

1. Resolve file: [api-flow-diagram-map.md](./api-flow-diagram-map.md).
2. Diff `src/modules/{module}/*.controller.ts` and DTOs against the diagram (paths, journey table, feature mapping, error flows).
3. Apply skill **anvix-api-flow-diagram** — follow `libs/@anvix/documents/dev-guidelines/developer-guideline/api-flow-diagram-prompt.md` and run its quality checklist.
4. Bump diagram **Version** or changelog section if the doc has one.
5. Link the diagram from the module README **Related links** and **Code map**.

**Example:** User module `POST /v1/users` body gains a field → update `docs/api flow diagrams/user-api-flow-diagram.md` (request JSON, journey table, and any affected ASCII flows).

## What each README section must answer

Use [template.md](./template.md). Every section is mandatory unless marked optional in the template.

| Section | User brief |
| --- | --- |
| **Functional requirements** | What business capabilities this module supports; link user-story files and story IDs; note ✅ shipped vs ⬜ planned only in code |
| **Technical depth (logical)** | Layers used (controller → service → repository → entity), tenant model, guards/permissions, key business rules, shared services — **no** line-by-line file dump |
| **Database tables** | Physical table names from `@Entity(...)`, ownership (tenant vs system), FK relationships, migrations that introduced/changed them |
| **Change impact** | If this module changes, what else may break: dependent modules, tables/APIs, permissions, migrations, docs, future booking flows |

Evidence over speculation: if grep shows no dependents, say **No direct code dependents found** rather than inventing consumers.

## Writing rules

- **Implementations win** over stale user stories; call out doc drift explicitly.
- Use present tense for shipped behavior; future tense for planned-only items in a short **Planned (not in repo)** subsection.
- Table names: use `@Entity` string (e.g. `service`), not TypeScript class names.
- Permissions: cite `MODULE_CONSTANTS` / `@RequirePermissions` keys from the controller.
- Keep README scannable: bullets and tables; aim for one to three screens unless the module is large.
- Update **Last reviewed** date (ISO `YYYY-MM-DD`) at the bottom on every refresh.

## Batch generation

When the user asks for all modules:

1. List folders under `libs/@anvix/business-core/modules/` (skip `index.ts`-only roots).
2. Add HTTP-only modules under `src/modules/` missing from business-core.
3. Generate or refresh one README per module using the workflow above.
4. Report a summary table: module | README path | created/updated/skipped | blockers.

## After module implementation (anvix-module-generator)

When finishing module work from **anvix-module-generator**, add or update this module's README unless the user asked to skip docs. If controllers or API DTOs changed, also update the API flow diagram per [api-flow-diagram-map.md](./api-flow-diagram-map.md). Minimum updates: new tables, new permissions, new dependents, and diagram sections touched by the API diff.

## Quality gate (before finishing)

- [ ] All four user brief areas are covered and non-empty (or explicitly N/A with reason).
- [ ] Functional links point to real files under `docs/requirements/`.
- [ ] Every listed table exists in an entity file or migration.
- [ ] Change impact lists were verified via import grep and entity relations.
- [ ] Code map paths match the repo (no `libs/@oc/`).
- [ ] If HTTP API changed: matching API flow diagram updated (or new file created) and README links to it.
- [ ] Diagram content matches controller + DTOs (not placeholder paths).

## Additional resources

- README skeleton: [template.md](./template.md)
- Investigation steps: [discovery-checklist.md](./discovery-checklist.md)
- User-story index mapping: [module-requirements-map.md](./module-requirements-map.md)
- Module → diagram paths: [api-flow-diagram-map.md](./api-flow-diagram-map.md)
- Diagram authoring: `.cursor/skills/anvix-api-flow-diagram/SKILL.md`
