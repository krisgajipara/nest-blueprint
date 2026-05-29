# Module → API flow diagram mapping

**Canonical location:** `docs/api flow diagrams/{name}-api-flow-diagram.md`

When a module's HTTP API changes, update the diagram file(s) below in the **same PR** as the code (unless the user asked to skip docs). Use skill **anvix-api-flow-diagram** for structure and quality checklist.

| Domain / HTTP module | API flow diagram file | Notes |
| --- | --- | --- |
| `user` | [user-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/user-api-flow-diagram.md) | All `/v1/users` routes |
| `role` | [role-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/role-api-flow-diagram.md) | All `/v1/roles` routes |
| `tenant` | [tenant-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/tenant-api-flow-diagram.md) | Tenant module routes |
| `auth` | [auth-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/auth-api-flow-diagram.md) | Public + authenticated auth flows |
| `service-category` | [service-catalog-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/service-catalog-api-flow-diagram.md) | Shared doc — categories section |
| `service` | [service-catalog-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/service-catalog-api-flow-diagram.md) | Shared doc — services + multipart |
| `service-staff-mapping` | [service-catalog-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/service-catalog-api-flow-diagram.md) | Shared doc — `/services/:serviceId/staff` |
| `stylist` | [stylist-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/stylist-api-flow-diagram.md) | `/v1/stylists`, stylist skills, `experienceYears` |
| `skill` | [stylist-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/stylist-api-flow-diagram.md) | `/v1/skills` master CRUD |
| `stylist-skill-mapping` | [stylist-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/stylist-api-flow-diagram.md) | `PUT /stylists/:stylistId/skills` |
| `service-skill-mapping` | [service-catalog-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/service-catalog-api-flow-diagram.md) | `PUT /services/:serviceId/skills` |
| `service-staff-mapping` | [service-catalog-api-flow-diagram.md](../../../docs/api%20flow%20diagrams/service-catalog-api-flow-diagram.md) | `/services/:serviceId/staff` |
| `profiler` | — | Dev-only; no frontend handoff diagram |

**Legacy duplicates at `docs/*-api-flow-diagram.md` (repo root):** If both root and `docs/api flow diagrams/` exist for the same module, treat **`docs/api flow diagrams/`** as canonical and either update both in lockstep or remove the stale copy in a separate cleanup PR.

**New module with no diagram yet:** Create `docs/api flow diagrams/{module}-api-flow-diagram.md` using **anvix-api-flow-diagram** and link it from the module README.
