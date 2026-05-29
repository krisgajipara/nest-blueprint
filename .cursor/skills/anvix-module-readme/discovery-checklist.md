# Module README — Discovery Checklist

Use while investigating a module before filling [template.md](./template.md).

---

## 1. Resolve module identity

- [ ] **Domain folder:** `libs/@anvix/business-core/modules/{name}/`
- [ ] **HTTP folder:** `src/modules/{name}/` (name may differ, e.g. `service-category`, `stylist`)
- [ ] **Nest wiring:** `src/app.module.ts` imports for `{Name}Module`
- [ ] **Barrel exports:** `libs/@anvix/business-core/modules/index.ts`

---

## 2. Functional requirements

- [ ] Open [module-requirements-map.md](./module-requirements-map.md) for the user-story file(s).
- [ ] Read **Overview**, **User stories**, **Business rules**, **API contract** in that file.
- [ ] Compare **Status & code paths** in the user story vs actual controller methods.
- [ ] Check portal docs under `docs/portals/**` only when they add persona context not in user stories.
- [ ] Record ✅ implemented, 🟡 partial, ⬜ spec-only.

---

## 3. Technical depth (logical)

Extract from code (read controller → service → repository):

- [ ] **Endpoints:** HTTP method + path + DTO class names from controller decorators.
- [ ] **Guards / decorators:** `@UseGuards`, `@RequirePermissions`, `@TenantApi`, `@AllowWithoutTenant`.
- [ ] **Service methods:** validation, orchestration, calls to other modules' services.
- [ ] **Repository:** `TenantAwareRepository` vs plain; custom query methods; raw SQL (note tenant filter).
- [ ] **Response mapping:** which `*ResponseDto` constructors are used.
- [ ] **Cross-cutting:** cache (`AppCacheModule`), `AppPermissionService`, events, schedulers.
- [ ] Summarize as a flow diagram in prose or a short `text` block — not a file listing.

---

## 4. Database tables

- [ ] List entities imported in repository or `TypeOrmModule.forFeature([...])` in Nest module.
- [ ] For each entity file, record `@Entity("table_name")` and base class (`BaseTenantModifiableEntity`, etc.).
- [ ] Follow `@ManyToOne` / `@OneToMany` / `@JoinColumn` for related tables touched in queries.
- [ ] Grep migrations: `libs/@anvix/server-core/database/migrations/` for table name strings.
- [ ] Note junction tables (e.g. `service_staff_mapping`) even if logic lives in a sibling domain folder.

**Grep helpers (run from repo root):**

```bash
# Entity table name
rg '@Entity\("' libs/@anvix/server-core/database/entities/{entity}.entity.ts

# Who imports this module's service
rg '{Module}Service|{module}.service' libs src --glob '*.ts'

# FK references to entity/table
rg '{Entity}|"{table}"' libs src --glob '*.ts'
```

---

## 5. Change impact

### 5a Inbound dependents (who uses this module)

- [ ] Grep imports of `{module}` service/repository/DTO paths.
- [ ] Grep `imports: [...]` in `src/modules/**/*.module.ts` for modules importing this feature's module.
- [ ] Entity relations: other entities with FK to this module's tables.
- [ ] Permission checks elsewhere referencing this module's permission keys.
- [ ] Future requirements: user stories listing this module under **Dependencies**.

### 5b Outbound dependencies (what this module uses)

- [ ] Constructor injections in service/repository.
- [ ] `imports` in Nest `*.module.ts`.
- [ ] FK columns pointing to other tables.

### 5c Change-type matrix

For each typical change, list concrete follow-ups:

| You change… | Check… |
| --- | --- |
| DTO field | Validation, Swagger, response mapping, breaking API clients |
| Entity column | Migration, repository queries, response DTO, seeders |
| Permission | Constants, default roles, `@RequirePermissions` on routes |
| Delete table/entity | FK constraints, dependent modules, booking/appointment specs |

---

## 6. API flow diagram (when HTTP API changed)

Skip this section only if the change has **no** client-visible HTTP impact (internal service/repository only).

- [ ] Resolve diagram path: [api-flow-diagram-map.md](./api-flow-diagram-map.md).
- [ ] Export current routes from controller (`@Get`, `@Post`, path strings, guards, `@RequirePermissions`).
- [ ] Compare to diagram: Frontend handoff / journey table / feature-to-API mapping / error flows.
- [ ] Update affected sections using **anvix-api-flow-diagram** (full prompt: `libs/@anvix/documents/dev-guidelines/developer-guideline/api-flow-diagram-prompt.md`).
- [ ] Update request/response JSON examples and enum values to match DTOs.
- [ ] Remove or mark deprecated flows for deleted endpoints.
- [ ] Bump diagram version or add a short changelog entry at the top.
- [ ] If no diagram exists for a new module, create one before marking the PR docs-complete.

**Controller vs diagram diff checklist:**

| Check | Controller source | Diagram section |
| --- | --- | --- |
| Paths & methods | `*.controller.ts` | Journey table, endpoint index, ASCII flows |
| Body/query params | `dto/request/*.ts` | Request examples, validation notes |
| Response shape | `dto/response/*.ts` | Success examples, `AppResponse.data` |
| Permissions | `@RequirePermissions` | Auth columns, integration priority |
| Tenant | guards / middleware | Header table, flow notes |
| Errors | service throws / `error.json` keys | Error handling flow |

---

## 7. Validate and write

- [ ] Copy [template.md](./template.md) to the module README path.
- [ ] Replace placeholders; remove optional sections that are empty.
- [ ] Set **Last reviewed** to today.
- [ ] API flow diagram synced if HTTP surface changed.
- [ ] Run skill **quality gate** from [SKILL.md](./SKILL.md).
