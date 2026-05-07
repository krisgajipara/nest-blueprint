# Prompt-based development

Use **`master-architecture-prompt.md`** in this folder together with the finalized docs under `libs/@anvix/documents/` (coding standards, `TENANT_GUIDE.md`, migrations).

See **`prompt-based-development.png`** for the high-level flow.

**Tenant-aware code generation:** repositories extend **`TenantAwareRepository`** and inject **`AsyncContextService`** from **`@core-generic-services`** (see `master-architecture-prompt.md`).

---

Last verified: 2026-05-07
