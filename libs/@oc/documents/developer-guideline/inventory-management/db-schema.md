# Inventory Management – Database Schema (Category‑Scoped Variants)

> **Design principle**
>
> - Variants and variant values are **scoped to Category** (NOT global)
> - Products inherit variants from their category
> - SKUs represent concrete variant combinations
> - Stock & price are managed at SKU level
> - MAQ (Minimum Available Quantity) is defined at Product level and evaluated per SKU

---

## 1. `categories`

Stores product categories (e.g., Clothes, Shoes).

```sql
CREATE TABLE categories (
    id          UUID PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL
);
```

---

## 2. `category_variants`

Defines variants available for a category (e.g., Size, Color).

```sql
CREATE TABLE category_variants (
    id           UUID PRIMARY KEY,
    product_category_id  UUID NOT NULL REFERENCES categories(id),
    name         VARCHAR(100) NOT NULL,
        UNIQUE (product_category_id, name)
);
```

**Example**

- Clothes → Size, Color
- Shoes → Size, Color

---

## 3. `category_variant_values`

Stores allowed values per category variant.

```sql
CREATE TABLE category_variant_values (
    id                    UUID PRIMARY KEY,
    category_variant_id   UUID NOT NULL REFERENCES category_variants(id),
    value                 VARCHAR(100) NOT NULL,
        UNIQUE (category_variant_id, value)
);
```

**Example**

- Size → S, XS, M, L, XL
- Color → Red, Blue, White

---

## 4. `products`

Base product definition under a category.

```sql
CREATE TABLE products (
    id                           UUID PRIMARY KEY,
    product_category_id                  UUID NOT NULL REFERENCES categories(id),
    name                         VARCHAR(255) NOT NULL,
    description                  TEXT,
    hsn_code                     VARCHAR(50),
    base_price                   NUMERIC(10,2),
    minimum_available_quantity   INT DEFAULT 0,
    cgst                         NUMERIC(5,2),
    sgst                         NUMERIC(5,2),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL
);
```

---

## 5. `product_variants` (SKUs)

Each row represents one SKU (one variant combination).

```sql
CREATE TABLE product_variants (
    id            UUID PRIMARY KEY,
    product_id    UUID NOT NULL REFERENCES products(id),
    sku_code      VARCHAR(100) UNIQUE NOT NULL,
    variant_name  VARCHAR(255),
    price         NUMERIC(10,2),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL
);
```

---

## 6. `variant_attribute_values`

Maps SKUs to their category‑scoped variant values.

```sql
CREATE TABLE variant_attribute_values (
    id                          UUID PRIMARY KEY,
    product_variant_id          UUID NOT NULL REFERENCES product_variants(id),
    category_variant_id         UUID NOT NULL REFERENCES category_variants(id),
    category_variant_value_id   UUID NOT NULL REFERENCES category_variant_values(id),
    UNIQUE (product_variant_id, category_variant_id)
);
```

**Example: Red‑M‑Cotton SKU**

| SKU | Variant | Value |
| --- | ------- | ----- |
| V1  | Color   | Red   |
| V1  | Size    | M     |

---

## 7. `variant_stock`

Stores stock & cost per SKU.

```sql
CREATE TABLE variant_stock (
    id            UUID PRIMARY KEY,
    variant_id    UUID NOT NULL REFERENCES product_variants(id),
    quantity      INT NOT NULL DEFAULT 0,
    cost_price    NUMERIC(10,2),
    selling_price NUMERIC(10,2),
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. `stock_movements` (Optional but Recommended)

Ledger table for audit‑safe stock tracking.

```sql
CREATE TABLE stock_movements (
    id            UUID PRIMARY KEY,
    variant_id    UUID NOT NULL REFERENCES product_variants(id),
    movement_type VARCHAR(30), -- purchase, sale, adjust, return
    quantity      INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL
);
```

---

## 9. Key Business Rules (DB‑Aligned)

- ❌ Variant / variant‑value edits **blocked** if any SKU quantity > 0
- ✅ MAQ stored in `products`, evaluated per SKU
- ✅ Low‑stock alert if `variant_stock.quantity < products.minimum_available_quantity`
- ✅ SKUs are unique per product & variant combination
- ✅ Variant price inheritance supported during SKU generation

---

## 10. ER Relationship Overview

```
Category
 └── Category Variants
      └── Category Variant Values
           └── Product
                └── SKU (Product Variants)
                     └── Variant Attribute Values
                          └── Variant Stock
```

---

🚀 Performance Optimization (Optional but Recommended)
Indexes
CREATE INDEX idx_vav_variant_value
ON variant_attribute_values(category_variant_value_id);

        CREATE INDEX idx_pv_product
        ON product_variants(product_id);

🧠 Alternative (If You Want Even Faster Reads)
Store a sku_signature:
RED|S|COTTON

**This schema is final, UI‑aligned, and production‑ready.**
