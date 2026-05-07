# Composing module generation prompts

1. Attach **`master-architecture-prompt.md`** (this folder) — it defines paths under **`libs/@anvix/`**, DTO rules, **`TenantAwareRepository` + `AsyncContextService`**, and pointers to finalized standards.
2. Add a domain add-on only when needed, e.g. **`inventory-module-prompt.md`**.
3. For edge cases, cite **`libs/@anvix/documents/dev-guidelines/coding-standards-v2.md`** explicitly.

**Example (two files):**

```text
libs/@anvix/documents/dev-guidelines/developer-guideline/master-architecture-prompt.md
libs/@anvix/documents/dev-guidelines/developer-guideline/inventory-module-prompt.md
```

Do not maintain a second full copy of the master rules inside other prompt files.

---

Last verified: 2026-05-07
