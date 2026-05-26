---
name: anvix-requirements
description: >-
  Read and maintain Anvix BRD and module user-stories aligned with the current
  backend implementation. Use when writing or updating requirements, user stories,
  API contracts, sprint scope, BA docs, or when implementing features and docs must
  match what is actually shipped (tenant, auth, RBAC, booking MVP).
---

# Anvix Requirements (BRD + User Stories)

## Use this skill when

- Creating or updating **business requirements**, **user stories**, or **API contracts**.
- Scoping a sprint from docs (not from memory).
- Implementing a module and need the **developer spec** for that feature.
- Reconciling docs with **current code** (mark ✅ / 🟡 / ⬜ accurately).
- Answering "what's built vs planned?" for the multi-tenant salon booking MVP.

## Required read order

| Order | Document | Role |
| --- | --- | --- |
| 1 | [implementation-baseline.md](./implementation-baseline.md) | **Source of truth for what exists in repo today** |
| 2 | `docs/requirements/user-stories/README.md` | Module index + implementation order |
| 3 | `docs/requirements/user-stories/{NN}-{module}.md` | Per-feature developer spec for active work |
| 4 | `docs/requirements/BRD-Salon-Booking-Platform.md` | Business context, KPIs, DB target, A/B, traceability |
| 5 | `docs/draft/Implementation TODO.md` | Engineering checklist (sync with user-story checkboxes) |
| 6 | `docs/requirements/Appointment-Domain-Challenges.md` | Double-booking, slots, TZ, payments, scale — mapped to phases |
| 7 | `docs/requirements/Calendar-Booking-Solutions.md` | High-difficulty problem → component solutions (TimezoneService, GiST, engine) |
| 8 | `docs/requirements/Booking-API-Flow.md` | Setup order, booking API catalog, resourceIds filters |

Optional by domain:

- Auth detail: `docs/auth-api-flow-diagram.md`
- Tenant rules: `libs/@anvix/documents/TENANT_GUIDE.md`
- Portal notes: `docs/portals/**`
- Product narrative: `docs/draft/Draft 1.2.md`

## Current implementation snapshot (2026-05-20)

**Shipped modules (controllers in `src/modules/`):**

| Module | Status | User-story file |
| --- | --- | --- |
| Platform tenant guard | 🟡 | `00-platform-tenant-security.md` |
| Tenant | ✅ | `01-tenant.md` |
| Auth | ✅ | `02-auth.md` |
| Users + Roles | ✅ | `03-users-rbac.md` |
| Profiler (dev) | ✅ | — (exempt from tenant guard) |

**Not shipped (spec only — do not document as implemented):**

`04` service/availability → `13` PO dashboard. No `booking`, `service`, `customer`, `staff`, `policy`, or `dashboard` controllers yet.

**Entities in DB today:** `tenant`, `user`, `role`, `token`, `otp`, `reset_password_token` only.

Full paths and API list: [implementation-baseline.md](./implementation-baseline.md).

## Multi-tenancy rule (non-negotiable in docs)

When writing requirements or API tables:

1. **Default:** every API requires `x-tenant` or `x-tenant-id` + validated context (`TenantGuard` global).
2. **Exempt:** `@TenantApi()` (tenant module) and `@AllowWithoutTenant()` (public auth, health, profiler).
3. **Auth split:** login/register/OTP = no tenant header; profile/change-password = **tenant required**.

Never specify "optional tenant" on tenant-owned resources unless BRD open question Q1/Q2 is explicitly resolved and recorded in §15 of the BRD.

## Workflow: implement from user stories

1. Open the module file under `docs/requirements/user-stories/`.
2. Confirm **Dependencies** and **Status** against [implementation-baseline.md](./implementation-baseline.md).
3. Implement using **anvix-module-generator** + **anvix-tenant-safety** + **anvix-migrations** skills.
4. Match **API contract** (method, path, DTO names, permissions) in the story file.
5. On merge, update:
   - User-story checkboxes and status line (✅ / 🟡).
   - `docs/draft/Implementation TODO.md` matching items.
   - [implementation-baseline.md](./implementation-baseline.md) if new controller/entity shipped.
   - BRD §10 / §12 only if net-new endpoints or tables (avoid duplicating full specs—link to user-story file).

## Workflow: write or extend requirements

### New feature in existing module

Edit the module's `docs/requirements/user-stories/NN-*.md`:

- Add `US-*` with Gherkin-style acceptance criteria.
- Add API table row + request/response field table.
- Add DB table/columns if new migration needed.
- Add **Definition of Done** items.

### New module

1. Add `docs/requirements/user-stories/NN-{name}.md` using the structure in `user-stories/README.md`.
2. Add row to `user-stories/README.md` index.
3. Add traceability row in BRD §13 (optional, one line).
4. Add phase items to `Implementation TODO.md`.

### BRD updates (light touch)

- **§3–8:** business/functional changes only.
- **§9:** epic summaries; link to user-story file for detail (do not duplicate full API lists).
- **§10–12:** platform-wide contracts and target schema; per-module APIs live in user stories.

## Status legend (use consistently)

| Mark | Meaning |
| --- | --- |
| ✅ | Implemented in backend; verify controller + migration exist |
| 🟡 | Partial (e.g. CRUD without wizard, guard without e2e tests) |
| ⬜ | Not implemented — spec/planned only |

**Verification rule:** Before marking ✅, grep `src/modules` and `libs/@anvix/server-core/database/entities` for the module controller/entity.

## User-story file template (abbreviated)

```markdown
# Module NN — {Name}
| Portal | Phase | Status | Controller | Service |
## Dependencies
## User stories (US-* + AC checkboxes)
## API contract
## Database
## Permissions
## Business rules
## Definition of Done
```

## Pairing with other skills

| Task | Skill |
| --- | --- |
| Scaffold/implement module | `anvix-module-generator` |
| Tenant isolation review | `anvix-tenant-safety` |
| Migrations | `anvix-migrations` |
| Frontend handoff API doc | `anvix-api-flow-diagram` |
| PR review vs standards | `anvix-code-review` |

## Anti-patterns

- Do not copy planned booking APIs into "implemented" sections without code.
- Do not create a second BRD per module; use user-stories for developer depth.
- Do not require `@UseGuards(TenantGuard)` per route — global guard + decorators only.
- Do not mark user stories ✅ without updating Implementation TODO / baseline when the team uses those trackers.

## Additional resources

- [implementation-baseline.md](./implementation-baseline.md) — living snapshot of shipped APIs and gaps
