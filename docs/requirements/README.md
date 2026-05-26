# Requirements Documentation

| Document | Purpose |
| --- | --- |
| [BRD — Salon Booking Platform (Multi-Tenant)](./BRD-Salon-Booking-Platform.md) | End-to-end BA pack: BRD → user stories → API contracts → A/B tests → DB design |
| **[User stories (developer specs)](./user-stories/README.md)** | **Module/feature-wise requirements: stories, APIs, DB, DoD** |
| [Appointment domain challenges × Anvix](./Appointment-Domain-Challenges.md) | Real-world booking problems mapped to MVP phases and technical choices |
| **[DB design — booking & calendar (multi-tenant)](./DB-Design-Booking-Calendar.md)** | **Tables, per-tenant calendar, features, API map (start here for implementation)** |
| **[Calendar & booking solutions](./Calendar-Booking-Solutions.md)** | **How to solve TZ, overlap (GiST), slot gen, day-off, DST, buffers, real-time, etc.** |
| **[Availability Calculation Engine](./Availability-Engine.md)** | **Unified pipeline: schedules, holidays, leaves, buffers, TZ, overlaps, resources, concurrency** |
| **[Booking API flow & endpoint catalog](./Booking-API-Flow.md)** | **Setup order, resource view, `resourceIds` filters, full API list** |

**Audience:** Product, Engineering, QA, Design, Operations.

**How to use**

- **Developers:** Open [`user-stories/`](./user-stories/README.md) → pick your module → implement against API + DB + DoD sections.
- **Product / BA:** BRD §1–3 for context; user-stories for sprint breakdown.
- **QA:** Acceptance criteria + test hints in each module file.
- **Agents:** Use Cursor skill `anvix-requirements` (`.cursor/skills/anvix-requirements/SKILL.md`) to align BRD/user-stories with the current codebase.
