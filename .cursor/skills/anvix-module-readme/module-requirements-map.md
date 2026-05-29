# Module → Requirements mapping

Use when filling **Functional requirements** in module READMEs. Link to user-story files; read the file for story IDs and API detail.

| Business-core / domain module | HTTP module (`src/modules`) | Primary user-story doc | BRD / notes |
| --- | --- | --- | --- |
| `tenant` | `tenant` | [01-tenant.md](../../../docs/requirements/user-stories/01-tenant.md) | Platform tenant lifecycle |
| `auth` | `auth` | [02-auth.md](../../../docs/requirements/user-stories/02-auth.md) | Login, OTP, tokens |
| `user` | `user` | [03-users-rbac.md](../../../docs/requirements/user-stories/03-users-rbac.md) | Salon users |
| `role` | `role` | [03-users-rbac.md](../../../docs/requirements/user-stories/03-users-rbac.md) | RBAC, permissions JSON |
| `service-category` | `service-category` | [04-service-availability.md](../../../docs/requirements/user-stories/04-service-availability.md) | Catalog grouping |
| `service` | `service` | [04-service-availability.md](../../../docs/requirements/user-stories/04-service-availability.md) | Services CRUD |
| `service-staff-mapping` | `service` (staff routes) | [04-service-availability.md](../../../docs/requirements/user-stories/04-service-availability.md) | Staff ↔ service assignment |
| `stylist` | `stylist` | [04-service-availability.md](../../../docs/requirements/user-stories/04-service-availability.md) | Staff/stylist personas (verify stories) |
| `salon-service` | `salon-service` | [04-service-availability.md](../../../docs/requirements/user-stories/04-service-availability.md) | Legacy/alternate naming — confirm vs `service` in code |
| — | `profiler` | — | Dev-only; no BRD module |
| — | (platform) | [00-platform-tenant-security.md](../../../docs/requirements/user-stories/00-platform-tenant-security.md) | Cross-cutting; not a business-core folder |

**Planned modules (requirements only — README should mark ⬜ until shipped):**

| Planned area | User-story doc |
| --- | --- |
| Booking | [05-booking-operations.md](../../../docs/requirements/user-stories/05-booking-operations.md) |
| Payments / notifications | [06-payments-notifications.md](../../../docs/requirements/user-stories/06-payments-notifications.md) |
| Customer | [07-customer-discovery-profile.md](../../../docs/requirements/user-stories/07-customer-discovery-profile.md), [08-customer-self-service.md](../../../docs/requirements/user-stories/08-customer-self-service.md) |
| Staff agenda | [09-staff-daily-agenda.md](../../../docs/requirements/user-stories/09-staff-daily-agenda.md) |
| PO features | [11-po-tenant-onboarding.md](../../../docs/requirements/user-stories/11-po-tenant-onboarding.md) — [13-po-health-dashboard.md](../../../docs/requirements/user-stories/13-po-health-dashboard.md) |

When a domain folder is not listed, search `docs/requirements/user-stories/README.md` and grep the module name in `docs/requirements/`.

**API flow diagrams (sync on HTTP changes):** [api-flow-diagram-map.md](./api-flow-diagram-map.md)

**Index:** [docs/requirements/user-stories/README.md](../../../docs/requirements/user-stories/README.md)
