# Salon Management Module – Category & Services Requirement Document

## 1. Module Overview

This module manages:

* Service Categories
* Salon Services

The system should support:

* Add / Edit / Delete operations
* Active / Inactive management
* Search, Filters, Sorting
* Pagination
* Gender-wise categorization
* Service pricing and duration management

---

# 2. CATEGORY MANAGEMENT

## 2.1 Category List Screen

### Purpose

Display all available salon service categories.

### Features

* List all categories
* Search category by name
* Toggle Active / Inactive status
* Pagination support
* Add Category button
* Edit Category option

### Table Columns

| Field         | Description              |
| ------------- | ------------------------ |
| Category Name | Name of category         |
| Gender        | Male / Female / Unisex   |
| Status        | Active / Inactive toggle |
| Created Date  | Optional                 |
| Actions       | Edit / Delete            |

### Functional Requirements

* Search should work instantly by category name
* Pagination configurable (10 / 25 / 50 records)
* Status toggle updates without page refresh
* Prevent duplicate category names
* Soft delete preferred instead of permanent delete

---

## 2.2 Add / Edit Category

### Fields

| Field         | Type     | Validation             |
| ------------- | -------- | ---------------------- |
| Category Name | Text     | Required, unique       |
| Gender        | Dropdown | Male / Female / Unisex |
| Status        | Toggle   | Default Active         |

### Sample Categories

* Hair
* Beard
* Nail
* Beauty & Skin Care
* Spa & Relaxation
* Makeup
* Facial
* Massage
* Waxing
* Bridal Services

### Validation Rules

* Category name required
* Max character limit: 100
* No special duplicate names
* Gender mandatory

---

# 3. SERVICE MANAGEMENT

## 3.1 Service List Screen

### Purpose

Manage all salon services under categories.

### Features

* List all services
* Filter by:

  * Gender
  * Category
* Search by service name
* Sort by:

  * Price
  * Duration
* Active / Inactive toggle
* Pagination
* Add Service button

### Table Columns

| Field         | Description            |
| ------------- | ---------------------- |
| Service Image | Thumbnail              |
| Service Name  | Name of service        |
| Category      | Related category       |
| Gender        | Male / Female / Unisex |
| Duration      | Minutes                |
| Price         | Currency               |
| Description   | Short details          |
| Status        | Active / Inactive      |
| Actions       | Edit / Delete          |

---

## 3.2 Add / Edit Service

### Fields

| Field         | Type        | Validation     |
| ------------- | ----------- | -------------- |
| Category      | Dropdown    | Required       |
| Service Name  | Text        | Required       |
| Description   | Textarea    | Optional       |
| Price         | Decimal     | Required       |
| Duration      | Number      | Required       |
| Service Image | File Upload | Optional       |
| Status        | Toggle      | Default Active |

### Validation Rules

* Service name mandatory
* Price must be greater than 0
* Duration should be positive integer
* Allowed image types:

  * JPG
  * PNG
  * WEBP
* Max image size:

  * 2MB

---

# 4. FILTERS & SEARCH

## Category Filters

* Gender
* Status

## Service Filters

* Gender
* Category
* Status

## Search

* Search by category name
* Search by service name

## Sorting

### Service Sorting

* Price:

  * Low to High
  * High to Low
* Duration:

  * Short to Long
  * Long to Short

---

# 5. PAGINATION

### Requirements

* Server-side pagination preferred
* Records per page:

  * 10
  * 25
  * 50
  * 100

### Pagination Info

Display:

* Total records
* Current page
* Total pages

---

# 6. STATUS MANAGEMENT

## Active / Inactive Toggle

### Purpose

Quickly enable or disable categories/services.

### Rules

* Inactive category should optionally disable related services
* Inactive services should not appear in customer booking app
* Toggle update via AJAX/API without full refresh

---

# 7. IMAGE MANAGEMENT

## Service Image

### Requirements

* Single image upload
* Thumbnail preview
* Crop/resize optional
* Store optimized image

### Recommended Sizes

* 800 × 800 px
* Square ratio preferred

---

# 8. API REQUIREMENTS

## Category APIs

| Method | Endpoint           | Purpose         |
| ------ | ------------------ | --------------- |
| GET    | /categories        | List categories |
| POST   | /categories        | Create category |
| PUT    | /categories/{id}   | Update category |
| PATCH  | /categories/status | Update status   |
| DELETE | /categories/{id}   | Delete category |

---

## Service APIs

| Method | Endpoint         | Purpose        |
| ------ | ---------------- | -------------- |
| GET    | /services        | List services  |
| POST   | /services        | Create service |
| PUT    | /services/{id}   | Update service |
| PATCH  | /services/status | Update status  |
| DELETE | /services/{id}   | Delete service |

---

# 9. DATABASE STRUCTURE

## Category Table

| Column     | Type      |
| ---------- | --------- |
| id         | bigint    |
| name       | varchar   |
| gender     | enum      |
| is_active  | boolean   |
| created_at | timestamp |
| updated_at | timestamp |

---

## Services Table

| Column      | Type      |
| ----------- | --------- |
| id          | bigint    |
| category_id | bigint    |
| name        | varchar   |
| description | text      |
| price       | decimal   |
| duration    | integer   |
| image       | varchar   |
| is_active   | boolean   |
| created_at  | timestamp |
| updated_at  | timestamp |

---

# 10. ANALYTICAL & BUSINESS IMPROVEMENT POINTS

## Recommended Enhancements

### 1. Service SKU / Code

Add unique service code for easier management.
Example:

* HR001
* SPA002

---


### 3. Staff Mapping

Map services to staff expertise.
Example:

* Haircut → Senior Stylist
* Facial → Beauty Expert

---

### 6. Online Booking Integration

Only active services/categories visible in booking app.

---

### 7. Duration Buffer

Add cleanup/setup buffer time.
Example:

* Service: 30 mins
* Buffer: 10 mins

---

### 8. SEO & Marketing

Add:

* SEO title
* SEO description
* Featured service option

---

### 9. Analytics Dashboard

Track:

* Most booked services
* Revenue per category
* Average service duration
* Popular gender-wise services

---

---

# 11. SECURITY & PERFORMANCE

## Security

* Role-based access
* Only admin can delete
* Validate all uploads

## Performance

* Lazy loading images
* Indexed search fields
* Optimized pagination queries

---

# 12. UI/UX RECOMMENDATIONS

## Suggested UI Features

* Card + Table view toggle
* Drag-and-drop image upload
* Instant search
* Sticky filters
* Mobile responsive admin panel

---

# 14. ACCEPTANCE CRITERIA

## Category Module

* Admin can create/edit category
* Search works properly
* Status toggle updates correctly
* Pagination works

## Service Module

* Admin can create/edit service
* Filters & sorting work
* Image upload works
* Service linked to category
* Inactive services hidden from booking platform
