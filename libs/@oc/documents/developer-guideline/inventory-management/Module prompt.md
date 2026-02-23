Module prompt

1️⃣ PRODUCT CATEGORY MODULE PROMPT
Generate the Category module for the Inventory system.
Module Name: Category
Responsibilities:

- Manage product categories (e.g., Clothes, Shoes)
- Acts as root for category-scoped variants

Entity: PRODUCT Category
Fields:

- id (uuid)
- name (string, unique)
- created_at
- updated_at
- deleted_at

Business Rules:

- Category name must be unique
- Category cannot be deleted if products exist under it

APIs:

- POST /product-categories
- GET /product-categories/:id
- PUT /product-categories/:id
- DELETE /product-categories/:id (soft delete)
- GET /product-categories (search, pagination, sorting)

Permissions:

- PRODUCT_CATEGORY_READ
- PRODUCT_CATEGORY_WRITE
- PRODUCT_CATEGORY_EDIT
- PRODUCT_CATEGORY_DELETE

Category modules must:

Follow master architecture rules strictly
Use custom validators only
Support search, filter, pagination, sorting
Use soft delete (deleted_at)
Register permissions
Include logging and caching where applicable

---

2️⃣ PRODUCT CATEGORY VARIANT MODULE PROMPT
Generate the ProductCategoryVariant module.

Module Name: ProductCategoryVariant
Responsibilities:

- Define variants per category (Size, Color, Material)

Entity: ProductCategoryVariant
Fields:

- id (uuid)
- product_category_id (fk → Category)
- name (string)
- created_at
- updated_at
- deleted_at

Business Rules:

- Unique per category (product_category_id + name)
- Cannot add/update/delete if ANY SKU under category has stock > 0

APIs:

- POST /product-category-variants
- GET /product-category-variants/:id
- PUT /product-category-variants/:id
- DELETE /product-category-variants/:id
- GET /product-category-variants (filter by product_category_id)

Permissions:

- PRODUCT_CATEGORY_VARIANT_READ
- PRODUCT_CATEGORY_VARIANT_WRITE
- PRODUCT_CATEGORY_VARIANT_EDIT
- PRODUCT_CATEGORY_VARIANT_DELETE

Category modules must:

Follow master architecture rules strictly
Use custom validators only
Support search, filter, pagination, sorting
Use soft delete (deleted_at)
Register permissions
Include logging and caching where applicable

---

3️⃣ CATEGORY VARIANT VALUE MODULE PROMPT

Generate the ProductCategoryVariantValue module.

Module Name: ProductCategoryVariantValue

Responsibilities:

- Manage allowed values for category variants

Entity: ProductCategoryVariantValue
Fields:

- id (uuid)
- category_variant_id (fk)
- value (string)
- created_at
- updated_at
- deleted_at

Business Rules:

- Unique per variant (category_variant_id + value)
- Cannot modify if used by any SKU with stock > 0

APIs:

- POST /category-variant-values
- GET /category-variant-values/:id
- PUT /category-variant-values/:id
- DELETE /category-variant-values/:id
- GET /category-variant-values (filter by category_variant_id)

Permissions:

- PRODUCT_CATEGORY_VARIANT_VALUE_READ
- PRODUCT_CATEGORY_VARIANT_VALUE_WRITE
- PRODUCT_CATEGORY_VARIANT_VALUE_EDIT
- PRODUCT_CATEGORY_VARIANT_VALUE_DELETE

Modules must:

Follow master architecture rules strictly
Use custom validators only
Support search, filter, pagination, sorting
Use soft delete (deleted_at)
Register permissions
Include logging and caching where applicable

---

4️⃣ PRODUCT MODULE PROMPT
Generate the Product module.

Module Name: Product

Responsibilities:

- Manage base product information
- Define MAQ (Minimum Available Quantity)

Entity: Product
Fields:

- id (uuid)
- product_category_id (fk)
- name (string)
- description (text)
- hsn_code (string)
- minimum_available_quantity (number)
- created_at
- updated_at
- deleted_at

Business Rules:

- Category cannot be changed once SKUs exist
- MAQ applied per SKU for alerts

APIs:

- POST /products
- GET /products/:id
- PUT /products/:id
- DELETE /products/:id
- GET /products (search, filter by category, pagination)

Permissions:

- PRODUCT_READ
- PRODUCT_WRITE
- PRODUCT_EDIT
- PRODUCT_DELETE

Modules must:

Follow master architecture rules strictly
Use custom validators only
Support search, filter, pagination, sorting
Use soft delete (deleted_at)
Register permissions
Include logging and caching where applicable

---

5️⃣ PRODUCT VARIANT (SKU) MODULE PROMPT
Generate the ProductVariant (SKU) module.

Module Name: ProductVariant

Responsibilities:

- Generate and manage SKUs
- Handle variant combinations and pricing

Entity: ProductVariant
Fields:

- id (uuid)
- product_id (fk)
- sku_code (unique)
- price (number)
- created_at
- updated_at
- deleted_at

Business Rules:

- One SKU per unique variant combination
- Validate allowed category variants
- New SKU price inherits from closest existing SKU
- SKU cannot be deleted if stock > 0

APIs:

- POST /product-variants/generate
- GET /product-variants/:id
- PUT /product-variants/:id/price
- DELETE /product-variants/:id
- GET /product-variants (filter by product_id)

Permissions:

- PRODUCT_VARIANT_READ
- PRODUCT_VARIANT_WRITE
- PRODUCT_VARIANT_EDIT
- PRODUCT_VARIANT_DELETE

Modules must:

Follow master architecture rules strictly
Use custom validators only
Support search, filter, pagination, sorting
Use soft delete (deleted_at)
Register permissions
Include logging and caching where applicable

---

6️⃣ VARIANT STOCK MODULE PROMPT
Generate the VariantStock module.

Module Name: VariantStock

Responsibilities:

- Manage stock per SKU
- Maintain stock consistency and MAQ alerts

Entity: VariantStock
Fields:

- id (uuid)
- variant_id (fk → ProductVariant)
- quantity (number)
- cost_price (number)
- selling_price (number)
- updated_at

Business Rules:

- Stock updates must be transactional
- Quantity cannot go below zero
- Update MAQ alert status on change

APIs:

- POST /variant-stock/add
- POST /variant-stock/reduce
- POST /variant-stock/adjust
- GET /variant-stock/low-stock-alerts

Permissions:

- VARIANT_STOCK_READ
- VARIANT_STOCK_WRITE
- VARIANT_STOCK_EDIT

Modules must:

Follow master architecture rules strictly
Use custom validators only
Support search, filter, pagination, sorting
Use soft delete (deleted_at)
Register permissions
Include logging and caching where applicable
