# Health Dashboard Module

## Features
- **Adoption Metrics Overview:** tracks active salons, bookings per day, retention, and onboarding pendings to gauge platform traction.
- **Regional Booking KPIs:** aggregates confirmed vs. pending bookings, revenue forecast, and peak hour heatmaps for performance visibility.
- **SLA & Infrastructure Alerts:** monitors API latency, WebSocket session counts, and tenant-specific queue lengths to spot degradation.
- **Compliance & Escalation View:** highlights tenants violating policies, pending document approvals, or license expirations for quick correction.
- **Actionable Drilldowns:** quick-actions open tenant detail, surface nudges, or launch the support queue when manual follow-up is needed.

## Flow & Related Modules
- **Health monitoring flow:** booking events and tenant status updates feed into the telemetry/monitoring module, which aggregates KPIs and surfaces alerts on the dashboard. Related modules: booking event stream, telemetry/alerts service, tenant metadata store.
- **Tenant issue drilldown:** clicking any KPIs opens the tenant detail view, cross-linked with the onboarding module and policy library, and launches support tickets (support queue module) for manual follow-up.
- **Policy sync:** SLA violations reference rules defined in the policy module and the document compliance system, so a tenant flagged for missing documents or policy breaches can be remediated through linked workflows.

## APIs
- **GET /dashboards/tenants-health:** aggregates adoption metrics (active salons, bookings/day, retention) and onboarding pendings to power the adoption tiles.
- **GET /dashboards/bookings-kpis:** returns confirmed vs. pending bookings, revenue forecasts, and peak-hour heatmap data per region for the KPI panels.
- **GET /alerts/sla:** surfaces SLA alerts (API latency breaches, WebSocket counts, queue backlogs) that feed the infrastructure alert widget.
- **GET /support/escalations:** lists compliance or booking escalations tied to tenants so product owner agents can take quick action.
- **POST /support/escalations/:id/assign:** assigns an escalation to ops/engineering with severity tags and automatically opens the support queue entry referenced in the dashboard.
