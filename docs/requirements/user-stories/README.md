# User Stories — Developer Requirements (Module-wise)

Detailed, implementation-ready requirements per backend module. Use with [BRD](../BRD-Salon-Booking-Platform.md) for business context.

## How developers should use these docs

1. Pick a module file below (one feature area = one PR epic).
2. Implement in order: **Dependencies → DB migration → Entity/Repository → Service → DTOs → Controller → Permissions → Tests**.
3. Check **Definition of Done** at the bottom of each file before marking complete.
4. Cross-cutting rules: read [00-platform-tenant-security.md](./00-platform-tenant-security.md) first.

## Document structure (every module file)

| Section | Purpose |
| --- | --- |
| Overview | What to build and why |
| Status & code paths | What exists in repo today |
| Dependencies | Modules/migrations that must ship first |
| User stories | Story + acceptance criteria + tasks |
| API contract | Method, path, headers, DTOs, errors |
| Database | Tables, indexes, tenant rules |
| Permissions | `MODULE_CONSTANTS` + guard |
| Business rules | Validation logic developers must encode |
| DoD | Merge checklist |

## Module index

| # | Module | Portal | Phase | Status | File |
| --- | --- | --- | --- | --- | --- |
| 00 | Platform tenant & security | All | P0 | 🟡 | [00-platform-tenant-security.md](./00-platform-tenant-security.md) |
| 01 | Tenant management | Product Owner | P0 | ✅ | [01-tenant.md](./01-tenant.md) |
| 02 | Authentication | All | P0 | ✅ | [02-auth.md](./02-auth.md) |
| 03 | Users & RBAC (Roles) | Salon Admin | P0 | ✅ | [03-users-rbac.md](./03-users-rbac.md) |
| 04 | Service & availability | Salon Admin | P1 | ⬜ | [04-service-availability.md](./04-service-availability.md) |
| 05 | Booking operations | Salon Admin | P2 | ⬜ | [05-booking-operations.md](./05-booking-operations.md) |
| 06 | Payments & notifications | Customer + Admin | P3 | ⬜ | [06-payments-notifications.md](./06-payments-notifications.md) |
| 07 | Customer discovery & profile | Customer | P4 | ⬜ | [07-customer-discovery-profile.md](./07-customer-discovery-profile.md) |
| 08 | Customer self-service & history | Customer | P4 | ⬜ | [08-customer-self-service.md](./08-customer-self-service.md) |
| 09 | Staff daily agenda | Staff | P6 | ⬜ | [09-staff-daily-agenda.md](./09-staff-daily-agenda.md) |
| 10 | Staff waitlist & communication | Staff | P6 | ⬜ | [10-staff-waitlist-communication.md](./10-staff-waitlist-communication.md) |
| 11 | PO tenant onboarding (extended) | Product Owner | P7 | 🟡 | [11-po-tenant-onboarding.md](./11-po-tenant-onboarding.md) |
| 12 | PO policy & support | Product Owner | P7 | ⬜ | [12-po-policy-support.md](./12-po-policy-support.md) |
| 13 | PO health dashboard | Product Owner | P7 | ⬜ | [13-po-health-dashboard.md](./13-po-health-dashboard.md) |

## Suggested implementation order

```text
00 → 01 → 02 → 03 → 04 → 05 → 06
                              ↘ 07, 08 (parallel after 05)
                    05 → 09, 10 (parallel)
01 → 11, 12, 13 (PO features; can parallel with 04+)
```

## Related engineering docs

- [Implementation TODO](../../draft/Implementation%20TODO.md)
- [Auth API flow](../../auth-api-flow-diagram.md)
- [Tenant guide](../../../libs/@anvix/documents/TENANT_GUIDE.md)
- Portal feature notes: `docs/portals/**`
