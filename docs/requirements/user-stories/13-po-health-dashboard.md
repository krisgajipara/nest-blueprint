# Module 13 — Product Owner: Health Dashboard

| Field | Value |
| --- | --- |
| **Portal** | Product Owner |
| **Phase** | P7 |
| **Status** | ⬜ Not implemented |
| **Portal spec** | `docs/portals/product-owner/health-dashboard.md` |
| **Depends on** | Modules 01, 05, 11, 12 |

---

## Overview

Aggregated KPIs and alerts for platform operators: adoption, booking performance, SLA breaches, compliance flags.

---

## User stories

### US-DASH-001 — Tenant health tiles

**Acceptance criteria**

- [ ] `GET /dashboards/tenants-health` — `{ activeSalons, bookingsPerDay, retentionRate, onboardingPendingCount }`.
- [ ] Query params: `region`, `from`, `to`.
- [ ] Data from materialized aggregates or nightly rollups (document choice in ADR).

---

### US-DASH-002 — Booking KPIs

- [ ] `GET /dashboards/bookings-kpis` — confirmed vs pending, revenue forecast, peak hour heatmap by region.
- [ ] Uses `booking` + `payment` tables; tenant_id grouped only in aggregate exports (no PII in PO view).

---

### US-DASH-003 — SLA alerts

- [ ] `GET /alerts/sla` — API latency, notification queue depth, failed payment rate.
- [ ] Integrate with existing profiler metrics where possible (`ProfilerService`).

---

### US-DASH-004 — Drill-down to support

- [ ] `POST /support/escalations/:id/assign` — `{ assigneeId, team: ops|engineering }`.
- [ ] Dashboard widget links to Module 12 queue.

---

## API contract

| Method | Path | Response highlights |
| --- | --- | --- |
| GET | `/dashboards/tenants-health` | adoption metrics |
| GET | `/dashboards/bookings-kpis` | KPI + heatmap array |
| GET | `/alerts/sla` | alert[] with severity |
| POST | `/support/escalations/:id/assign` | escalation id |

All `@TenantApi()` + PO role.

---

## Analytics tables (suggested)

### `booking_daily_rollup`

| Column | Notes |
| --- | --- |
| `tenant_id` | |
| `date` | |
| `confirmed_count` | |
| `cancelled_count` | |
| `revenue_total` | |

Populated by cron from `booking` events.

---

## Performance

| NFR | Target |
| --- | --- |
| Dashboard GET | P95 < 1.5s with 90d rollups |
| Rollup job | Completes within 5 min of midnight tenant TZ |

---

## Definition of Done

- [ ] PO role cannot see individual customer phone numbers in aggregates.
- [ ] Drill-down respects tenant isolation when opening tenant detail (Module 01 GET).
- [ ] Empty state when no tenants onboarded.
