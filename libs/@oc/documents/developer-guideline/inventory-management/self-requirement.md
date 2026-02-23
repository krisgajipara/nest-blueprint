# Inventory Management System – Full Functional Requirements & API List

## 1. Objective

Build an inventory management system that supports:

- Product-wise inventory
- Variant & variant-value combinations
- SKU-level stock and pricing
- Minimum Available Quantity (MAQ)–based alerts
- Controlled variant edits based on stock availability
- Price inheritance for newly generated SKUs

---

## 2. Core Concepts & Definitions

### 2.1 Category

Logical grouping of products (e.g., Clothes, Accessories).

### 2.2 Product

Base item definition under a category.

- Owns variants
- Defines tax & MAQ

### 2.3 Variant

A dimension of variation (Color, Size, Material).

### 2.4 Variant Value

Possible values for a variant (Red, Black, S, M).

### 2.5 SKU

A unique combination of variant values.

- Holds stock quantity
- Holds price

### 2.6 Minimum Available Quantity (MAQ)

- Defined at **product level**
- Applied to **each SKU**
- Used for low-stock alerts

---

## 3. Business Rules

### 3.1 Variant Lock Rule

- Variants or variant values **cannot be added, edited, or deleted** if:
    - Any SKU under the product has quantity > 0

### 3.2 SKU Generation Rule

- SKUs are generated using cartesian product of variant values

### 3.3 Price Inheritance Rule

When new variant values are added:

- If a new SKU partially matches an old SKU, inherit price
- Else price defaults to 0

### 3.4 Low Stock Rule

A SKU is low stock if:

```
sku.quantity < product.minimum_available_quantity
```

A product is low stock if **any SKU** is low stock.

---

## 4. Functional Modules & APIs

---

## 4.1 Category Management

### APIs

```http
GET    /categories
POST   /categories
PUT    /categories/{productCategoryId}
DELETE /categories/{productCategoryId}
```

### Rules

- Category cannot be deleted if products exist

---

## 4.2 Variant & Variant Value Management (Per Category)

### Variant APIs

```http
GET    /categories/{productCategoryId}/variants
POST   /categories/{productCategoryId}/variants
PUT    /variants/{variantId}
DELETE /variants/{variantId}
```

### Variant Value APIs

```http
GET    /variants/{variantId}/values
POST   /variants/{variantId}/values
PUT    /variant-values/{valueId}
DELETE /variant-values/{valueId}
```

### Rules

- Block modification if any SKU quantity > 0

---

## 4.3 Product Management

### Create Product

```http
POST /products
```

```json
{
    "productCategoryId": "uuid",
    "name": "Badminton Tshirt",
    "hsnCode": "6109",
    "minimumAvailableQuantity": 10,
    "cgst": 9,
    "sgst": 9
}
```

### Update Product

```http
PUT /products/{productId}
```

### Get Product

```http
GET /products/{productId}
```

---

## 4.4 SKU Generation & Variant Matrix

### Get Variant Matrix

```http
GET /products/{productId}/variant-matrix
```

### Generate / Regenerate SKUs

```http
POST /products/{productId}/skus
```

### Rules

- Must run in transaction
- Apply price inheritance logic

---

## 4.5 SKU Stock & Price Management

### Bulk Update

```http
PUT /products/{productId}/skus/bulk
```

### Apply Same Qty/Price to All

```http
PUT /products/{productId}/skus/apply-all
```

### Update Single SKU

```http
PUT /skus/{skuId}
```

---

## 4.6 Stock Movement (Ledger-Based)

### Stock IN

```http
POST /stock/in
```

### Stock OUT

```http
POST /stock/out
```

### Rules

- Stock never goes negative
- All movements are logged

---

## 4.7 Inventory Catalog (Listing & Filters)

```http
GET /products
```

### Query Params

```
?productCategoryId=
&variantValueIds=
&search=
&page=
&limit=
```

---

## 4.8 Inventory Dashboard

### Inventory Summary

```http
GET /inventory/summary
```

### Response Includes

- Total inventory value
- Low stock product count
- Low stock SKU count

---

## 4.9 Low Stock Alerts (MAQ-Based)

### Global Low Stock Alert

```http
GET /inventory/alerts/low-stock
```

### Product-Level Low Stock SKUs

```http
GET /products/{productId}/low-stock-skus
```

---

## 4.10 Validation & Status APIs

### Variant Edit Lock Status

```http
GET /products/{productId}/variant-lock-status
```

### MAQ Update

```http
PUT /products/{productId}/minimum-quantity
```

---

## 5. Non-Functional Requirements

- Transactions for SKU generation
- Indexes on:
    - sku.product_id
    - sku.quantity
    - product.minimum_available_quantity

- Pagination on all list APIs
- Role-based access (Admin vs Staff)

---

## 6. Future Enhancements

- Notifications (email / in-app)
- SKU-level reorder suggestions
- Purchase order integration
- Audit logs for pricing changes

---

## 7. Success Criteria

- Variant edits blocked correctly
- Accurate SKU price inheritance
- Real-time low-stock alerts
- Scalable SKU combinations

---

**This document is API-ready, DB-aligned, and UI-mapped.**
