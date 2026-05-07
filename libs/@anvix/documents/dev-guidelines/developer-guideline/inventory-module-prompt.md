# Inventory domain prompt (add-on)

Use with **`master-architecture-prompt.md`**. Paths and **`TenantAwareRepository` + `AsyncContextService`** rules are defined there and in **`TENANT_GUIDE.md`**.

**Compose for AI:**

```text
libs/@anvix/documents/dev-guidelines/developer-guideline/master-architecture-prompt.md
libs/@anvix/documents/dev-guidelines/developer-guideline/inventory-module-prompt.md
```

---

## Domain overview

- Categories; category-scoped variants and variant values; products; SKUs; stock; MAQ alerts.
- Variants are **per category** only; product inherits variant structure from category; SKU = one combination of variant values; stock/price at SKU level; MAQ at product level.

## Modules to generate (each with full layering)

1. Category  
2. CategoryVariant  
3. CategoryVariantValue  
4. Product  
5. ProductVariant (SKU)  
6. VariantStock  

(Plus any join/mapping entity the design needs, e.g. SKU ↔ variant value.)

Each module: entities under `libs/@anvix/server-core/database/entities/`, domain under `libs/@anvix/business-core/modules/{name}/`, HTTP under `src/modules/{name}/`. Tenant-owned repos: **`TenantAwareRepository`** + **`AsyncContextService`** from **`@core-generic-services`**.

## Entity rules (summary)

- **Category:** id, name (unique), audit/soft delete per project bases.
- **CategoryVariant:** fk category; unique (category + name); block edits if products in category have SKU stock > 0.
- **CategoryVariantValue:** fk variant; unique per variant; block edits if SKU uses value and stock > 0.
- **Product:** fk category; name, description, hsn_code, minimum_available_quantity; category immutable once SKUs exist.
- **ProductVariant (SKU):** fk product; sku_code unique; price; one row per variant-value combo; validate against category variants; price inheritance rule as per product spec.
- **Variant / SKU mapping table:** one value per variant dimension per SKU; unique (sku + variant).
- **VariantStock:** fk SKU; quantity, cost_price, selling_price; transactional updates; MAQ evaluation.

## APIs (high level)

- Category / variant / value / product / SKU / stock CRUD + lists (search, filter, pagination, sort) where applicable.
- Product filter by variant values: **AND** across dimensions; same SKU must satisfy all selected values.
- MAQ alert listing: SKUs where quantity < product.minimum_available_quantity; group/include category and variant info.
- Permissions: register modules in `permissions.constant.ts` when APIs are permission-gated; `@RequirePermissions` + correct guards.

## Technical

- Custom validators only (project standard); constants for lengths; `error.json` keys; transactions (`QueryRunner`) for SKU creation and stock mutations.

---

Last verified: 2026-05-07
