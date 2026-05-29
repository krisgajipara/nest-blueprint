# Service Catalog module — API flow diagram

**Module:** Salon Admin — Categories, Services, Staff mapping, Service skills  
**Version:** 1.1  
**Base path:** `/v1` (global prefix from `main.ts`)  
**Controllers:** `ServiceCategoryController` (`/categories`), `ServiceController` (`/services`), `ServiceStaffController` (`/services/:serviceId/staff`), `ServiceSkillController` (`/services/:serviceId/skills`)  
**Related:** [stylist-api-flow-diagram.md](./stylist-api-flow-diagram.md) — `/v1/stylists`, `/v1/skills`, stylist skill tags, `experienceYears`  
**Guards:** `RoleGuard` + `@RequirePermissions` on all routes below  
**Tenant:** Required — `x-tenant` or `x-tenant-id` (see `TENANT_GUIDE.md`)

---

## Frontend handoff bundle

### HTTP basics

| Item | Value |
|------|--------|
| Base URL | `{API_HOST}/v1` |
| Content-Type | `application/json` for category CRUD and staff JSON |
| Multipart | `POST` / `PUT` `/v1/services` and `/v1/services/:id` — `multipart/form-data`, field **`image`** (optional) |
| Auth | `Authorization: Bearer <accessToken>` on every endpoint |

### Headers

| Header | Required | Purpose |
|--------|----------|---------|
| `Authorization` | Yes | JWT access token |
| `x-tenant` or `x-tenant-id` | Yes (salon admin) | Tenant scope for categories, services, mappings |
| `language_code` | Optional | Translated `message` in success/error envelope |

### Success envelope (`AppResponse`)

```json
{
  "message": "List fetched successfully",
  "data": { }
}
```

| Response type | `data` shape |
|---------------|----------------|
| Single category / service | `ServiceCategoryResponseDto` or `ServiceResponseDto` (service may include `skills[]`, `assignedStaff[]`) |
| Lists (categories, services) | `CommonSearchResponseDto` — see below |
| Staff list / assign | `ServiceStaffMappingResponseDto[]` (array at root of `data`) |
| Service / stylist skills | `ServiceSkillMappingResponseDto[]` or `StylistSkillMappingResponseDto[]` (see stylist doc) |
| Qualified staff (booking) | `QualifiedStaffResponseDto[]` |
| Delete | `data` is `{}` |

**`CommonSearchResponseDto` (paginated lists):**

```json
{
  "results": [ /* items */ ],
  "pageSize": 10,
  "page": 1,
  "totalCount": 42
}
```

### Error envelope (global filter)

```json
{
  "message": "ERR_SERVICE_CATEGORY_EXISTS",
  "developerErrors": [ /* optional detail */ ]
}
```

| HTTP | Typical `message` keys | Suggested UI |
|------|------------------------|--------------|
| 400 | `ERR_REQUIRED`, `ERR_TYPE`, `ERR_MIN_VALUE`, `ERR_MAX_VALUE`, `ERR_IS_ENUM`, `ERR_UNIQUE_ARRAY_ITEM` | Inline field / form summary |
| 400 | `ERR_SERVICE_CATEGORY_EXISTS`, `ERR_SERVICE_EXISTS` | Toast on name field |
| 400 | `ERR_SERVICE_CATEGORY_INACTIVE`, `ERR_USER_NOT_STAFF` | Block save; explain inactive category or invalid staff |
| 400 | `ERR_SERVICE_CATEGORY_HAS_SERVICES` | Toast — remove or reassign services first |
| 400 | `ERR_SKILL_EXISTS`, `ERR_SKILL_IN_USE` | Skill master CRUD (stylist doc) |
| 400 | `ERR_INVALID_FILE_TYPE` | Image upload hint (JPG, PNG, WEBP; max 2MB) |
| 401 | Auth failures | Redirect to login |
| 403 | Permission denied | Hide action or “no access” |
| 404 | `ERR_MODULE_NOT_FOUND` | Not found state / back to list |

### Enums (send exact string values)

**`ServiceGenderEnum`** (category + inherited on service list via category):

| Value | UI label suggestion |
|-------|---------------------|
| `MALE` | Male |
| `FEMALE` | Female |
| `UNISEX` | Unisex |

**`StaffSkillLevelEnum`** (staff assignment):

| Value | UI label suggestion |
|-------|---------------------|
| `JUNIOR` | Junior |
| `SENIOR` | Senior |
| `EXPERT` | Expert |

**`SortDirection`** (query on lists): `ASC` | `DESC` (default list sort is often `DESC` on `createdAt`).

### Shared list query (`CommonSearchRequestDto`)

| Query param | Type | Default | Notes |
|-------------|------|---------|--------|
| `searchText` | string | — | Name search (category name / service name) |
| `pageSize` | number string | `10` | Use `10`, `25`, `50`, `100` per product spec |
| `pageNumber` | number string | `1` | 1-based page |
| `sortDirection` | `ASC` \| `DESC` | `DESC` | |

### Screen → API journey

| Screen | User action | HTTP | Permission module | Persist on client | Next step |
|--------|-------------|------|-------------------|-------------------|-----------|
| Category list | Open / search / paginate | `GET /v1/categories?...` | ServiceCategory READ | `categories`, `totalCount`, filters | Row click → edit or services filtered by category |
| Category list | Toggle active | `PATCH /v1/categories/:id/status` | ServiceCategory EDIT | Update row `isActive` | Optionally warn: inactive may deactivate child services |
| Category form | Create | `POST /v1/categories` | ServiceCategory WRITE | Add to list or navigate to detail | Open service list filtered by `categoryId` |
| Category form | Save edit | `PUT /v1/categories/:id` | ServiceCategory EDIT | Patch cache | — |
| Category list | Delete | `DELETE /v1/categories/:id` | ServiceCategory DELETE | Remove row | Fail if category still has services |
| Service list | Open / filters / sort | `GET /v1/services?...` | Service READ | `results`, filters state | Open detail / edit / assign staff |
| Service list | Filter by stylist | `GET /v1/services?staffId=&staffSearchText=&assignmentIsActive=` | Service READ | Filtered list | Use stylist id from `GET /v1/stylists/dropdown` |
| Service detail | Link skills (admin hint) | `GET/PUT /v1/services/:serviceId/skills` | Service READ/EDIT | `service.skills[]` | **Does not** block staff assign — compare with stylist skills in UI only |
| Service form | Create (optional image) | `POST /v1/services` multipart | Service WRITE | New `id`, `imageUrl` | Assign staff or return to list |
| Service form | Save edit | `PUT /v1/services/:id` multipart | Service EDIT | Updated DTO | — |
| Service list | Quick inactive | `PATCH /v1/services/:id/status` | Service EDIT | `isActive` | Hide from booking catalog when inactive |
| Service detail | Assign stylists | `PUT /v1/services/:serviceId/staff` | Service EDIT | Full assignment list | Picker: `GET /v1/stylists/dropdown`; only `userType` STYLIST |
| Service detail | Toggle one assignment | `PATCH /v1/services/:serviceId/staff/:staffId` | Service EDIT | Mapping row | — |
| Service detail | Remove assignment | `DELETE /v1/services/:serviceId/staff/:staffId` | Service DELETE | Remove from list | — |
| Booking (future) | Pick stylist after service | `GET /v1/services/:serviceId/staff/qualified` | Service READ | Staff picker options | Only active staff + active mapping + active service |

### Endpoint index (JSON)

```json
[
  { "method": "GET", "path": "/v1/categories", "auth": "Bearer+RoleGuard", "permissions": "ServiceCategory READ", "query": "ListServiceCategoryRequestDto" },
  { "method": "GET", "path": "/v1/categories/:id", "auth": "Bearer+RoleGuard", "permissions": "ServiceCategory READ" },
  { "method": "POST", "path": "/v1/categories", "auth": "Bearer+RoleGuard", "permissions": "ServiceCategory WRITE", "body": "CreateServiceCategoryRequestDto" },
  { "method": "PUT", "path": "/v1/categories/:id", "auth": "Bearer+RoleGuard", "permissions": "ServiceCategory EDIT", "body": "UpdateServiceCategoryRequestDto" },
  { "method": "PATCH", "path": "/v1/categories/:id/status", "auth": "Bearer+RoleGuard", "permissions": "ServiceCategory EDIT", "body": "{ isActive: boolean }" },
  { "method": "DELETE", "path": "/v1/categories/:id", "auth": "Bearer+RoleGuard", "permissions": "ServiceCategory DELETE" },
  { "method": "GET", "path": "/v1/services", "auth": "Bearer+RoleGuard", "permissions": "Service READ", "query": "ListServiceRequestDto" },
  { "method": "GET", "path": "/v1/services/:id", "auth": "Bearer+RoleGuard", "permissions": "Service READ" },
  { "method": "POST", "path": "/v1/services", "auth": "Bearer+RoleGuard", "permissions": "Service WRITE", "body": "CreateServiceRequestDto + optional image file" },
  { "method": "PUT", "path": "/v1/services/:id", "auth": "Bearer+RoleGuard", "permissions": "Service EDIT", "body": "UpdateServiceRequestDto + optional image" },
  { "method": "PATCH", "path": "/v1/services/:id/status", "auth": "Bearer+RoleGuard", "permissions": "Service EDIT", "body": "{ isActive: boolean }" },
  { "method": "DELETE", "path": "/v1/services/:id", "auth": "Bearer+RoleGuard", "permissions": "Service DELETE" },
  { "method": "GET", "path": "/v1/services/:serviceId/staff", "auth": "Bearer+RoleGuard", "permissions": "Service READ", "query": "?isActive=" },
  { "method": "GET", "path": "/v1/services/:serviceId/staff/qualified", "auth": "Bearer+RoleGuard", "permissions": "Service READ" },
  { "method": "PUT", "path": "/v1/services/:serviceId/staff", "auth": "Bearer+RoleGuard", "permissions": "Service EDIT", "body": "AssignServiceStaffRequestDto" },
  { "method": "PATCH", "path": "/v1/services/:serviceId/staff/:staffId", "auth": "Bearer+RoleGuard", "permissions": "Service EDIT", "body": "UpdateServiceStaffMappingRequestDto" },
  { "method": "DELETE", "path": "/v1/services/:serviceId/staff/:staffId", "auth": "Bearer+RoleGuard", "permissions": "Service DELETE" },
  { "method": "GET", "path": "/v1/services/:serviceId/skills", "auth": "Bearer+RoleGuard", "permissions": "Service READ" },
  { "method": "PUT", "path": "/v1/services/:serviceId/skills", "auth": "Bearer+RoleGuard", "permissions": "Service EDIT", "body": "{ skillIds: string[] }" }
]
```

**Note:** Staff routes use path param `serviceId` (same UUID as service `id`). Register or call **`/staff/qualified` before** any generic `/:staffId` route on the client; the server defines `GET qualified` before `PATCH :staffId`.

---

## 1. Complete API flow visualization

### 1.1 Salon admin — catalog hub (navigation)

```
┌─────────────────────────────────────────────────────────────┐
│  UI: Salon Admin → Settings → Service Catalog               │
│  Tabs: [Categories] [Services]                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
           ┌───────────────────┴───────────────────┐
           ▼                                       ▼
┌──────────────────────┐                 ┌──────────────────────┐
│  Categories tab      │                 │  Services tab        │
│  GET /v1/categories  │                 │  GET /v1/services    │
└──────────────────────┘                 └──────────────────────┘
```

---

### 1.2 Category list (search, filter, pagination)

```
┌──────────────────────────┐
│  UI: Category list       │
│  Search, gender filter,  │
│  active filter, page size │
└────────────┬─────────────┘
             │ Mount / Apply filters
             ▼
┌──────────────────────────────────────────────────────────────┐
│  GET /v1/categories                                          │
│  Query: searchText, gender, isActive, pageSize, pageNumber,  │
│         sortBy (name|gender|createdAt|updatedAt), sortDirection │
└────────────┬─────────────────────────────────────────────────┘
             │
             ├─► 200 OK
             │     data.results[] → table rows
             │     data.totalCount → pagination
             │
             ├─► 401 / 403 → login / no access
             │
             └─► 400 → fix query params
```

---

### 1.3 Category create / edit

```
┌──────────────────────────┐
│  UI: Add/Edit category   │
│  Fields: name, gender,   │
│  isActive (default true) │
└────────────┬─────────────┘
             │
     ┌───────┴───────┐
     │ Create        │ Edit (has id)
     ▼               ▼
┌─────────────┐   ┌─────────────────────┐
│ POST        │   │ PUT /v1/categories/:id │
│ /v1/        │   │ Body: partial fields   │
│ categories  │   └──────────┬──────────┘
└──────┬──────┘              │
       │                     │
       ├─► 400 ERR_SERVICE_CATEGORY_EXISTS → inline name error
       ├─► 201 / 200 → toast success → refresh list or stay on form
       └─► 404 → category removed elsewhere
```

---

### 1.4 Category status toggle (inline, no full form)

```
┌──────────────────────────┐
│  UI: Row switch Active   │
└────────────┬─────────────┘
             ▼
┌────────────────────────────────────────┐
│  PATCH /v1/categories/:id/status       │
│  Body: { "isActive": false }           │
└────────────┬───────────────────────────┘
             ├─► 200 → update row; backend may deactivate linked services
             └─► 404 → refresh list
```

---

### 1.5 Category delete

```
┌──────────────────────────┐
│  UI: Delete category     │
│  Confirm modal           │
└────────────┬─────────────┘
             ▼
┌────────────────────────────────────────┐
│  DELETE /v1/categories/:id             │
└────────────┬───────────────────────────┘
             ├─► 200 → remove row
             ├─► 400 ERR_SERVICE_CATEGORY_HAS_SERVICES → toast: remove services first
             └─► 404 → close modal, refresh
```

---

### 1.6 Service list (filters, sort, staff-centric view)

```
┌──────────────────────────────────────────────────────────┐
│  UI: Service list                                        │
│  Filters: category, gender, active, staff name/id      │
│  Sort: price | durationMin | name | dates                │
└────────────┬─────────────────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────────────────┐
│  GET /v1/services                                            │
│  Query: searchText, categoryId, gender, isActive,            │
│         staffId, staffSearchText, assignmentIsActive,        │
│         sortBy, sortDirection, pageSize, pageNumber          │
└────────────┬─────────────────────────────────────────────────┘
             ├─► 200 → render cards/table with thumbnail imageUrl
             └─► 403 → hide menu entry if no Service READ
```

**UI/UX tip:** When user picks a category from the category list, deep-link to services with `?categoryId={uuid}` pre-filled.

---

### 1.7 Service create / edit (with image)

```
┌──────────────────────────┐
│  UI: Service form        │
│  categoryId, name,       │
│  description, price,     │
│  durationMin, image,     │
│  isActive                │
└────────────┬─────────────┘
             │
     ┌───────┴────────┐
     ▼                ▼
┌──────────────┐  ┌─────────────────────────┐
│ POST         │  │ PUT /v1/services/:id    │
│ /v1/services │  │ multipart + fields      │
│ multipart    │  └───────────┬─────────────┘
└──────┬───────┘              │
       │                      │
       ├─► 400 ERR_SERVICE_CATEGORY_INACTIVE → pick another category
       ├─► 400 ERR_SERVICE_EXISTS → duplicate name in category
       ├─► 400 ERR_INVALID_FILE_TYPE / size → image helper text
       ├─► 201 / 200 → show imageUrl; offer “Assign staff” CTA
       └─► 404 → back to list
```

**Multipart fields (typical):** `categoryId`, `name`, `description`, `price`, `durationMin`, `isActive`, file `image`.

---

### 1.8 Service status toggle

```
┌──────────────────────────┐
│  UI: Active switch       │
└────────────┬─────────────┘
             ▼
┌────────────────────────────────────────┐
│  PATCH /v1/services/:id/status         │
│  Body: { "isActive": true|false }      │
└────────────┬───────────────────────────┘
             └─► 200 → inactive services excluded from booking qualified path
```

---

### 1.9 Assign staff to service (full replace)

```
┌──────────────────────────────────────────────────────────┐
│  UI: Service detail → “Assign staff” drawer              │
│  Multi-select staff (from User/staff list)               │
│  Per row: skill level JUNIOR|SENIOR|EXPERT, active flag  │
└────────────┬─────────────────────────────────────────────┘
             │ Save (send entire desired list)
             ▼
┌──────────────────────────────────────────────────────────────┐
│  PUT /v1/services/:serviceId/staff                           │
│  Body: { "assignments": [                                    │
│    { "staffId": "uuid", "skillLevel": "SENIOR", "isActive": true } │
│  ]}                                                          │
└────────────┬─────────────────────────────────────────────────┘
             │
             ├─► 400 ERR_USER_NOT_STAFF → remove invalid picker entries
             ├─► 400 ERR_UNIQUE_ARRAY_ITEM → duplicate staff in payload
             ├─► 200 → replace local staff table with data[] (full list)
             └─► 404 → service missing
```

**Important UX:** This API **replaces** the full assignment set. Staff removed from the payload are unassigned (soft-removed server-side). Always send the complete list after edits in the drawer.

```
┌──────────────────────────┐
│  UI: Load existing        │
└────────────┬─────────────┘
             ▼
┌────────────────────────────────────────┐
│  GET /v1/services/:serviceId/staff     │
│  Query: ?isActive=true (optional)      │
└────────────┬───────────────────────────┘
             └─► 200 → pre-fill drawer
```

---

### 1.10 Per-assignment tweak / remove

```
┌──────────────────────────┐
│  UI: Staff row actions   │
└────────────┬─────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌───────────────┐  ┌────────────────────────────────────┐
│ PATCH         │  │ DELETE                             │
│ .../staff/    │  │ .../staff/:staffId                 │
│ :staffId      │  │                                    │
│ skillLevel /  │  └─► 200, data {}                    │
│ isActive      │                                      │
└───────────────┘
```

---

### 1.11 Booking — qualified staff picker (customer / booking UI)

```
┌──────────────────────────┐
│  UI: Booking step 2     │
│  User selected service   │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────────────────────┐
│  GET /v1/services/:serviceId/staff/qualified                 │
└────────────┬─────────────────────────────────────────────────┘
             │
             ├─► 200 → staffId, staffName, skillLevel only
             │         (active service + active mapping + active user)
             │
             ├─► 404 → service inactive or missing → pick another service
             │
             └─► Empty array → show “No stylists available” (configure staff mapping)

Do **not** use the full staff list endpoint for customer booking — unmapped or inactive staff must stay hidden.
```

---

### 1.12 End-to-end admin journey (recommended wireframe order)

```
Login (tenant context)
    → Categories list (GET /categories)
    → Create category (POST) [optional: seeded on new tenant]
    → Services list (GET /services?categoryId=)
    → Create service (POST multipart)
    → Assign staff (GET staff → PUT staff)
    → Toggle service active (PATCH status)
    → [Booking app] Qualified staff (GET .../staff/qualified)
```

---

## 2. Feature-to-API mapping

Use these tables for screen design, frontend tasks, and QA. Column meanings:

| Column | Meaning |
|--------|---------|
| **Screen** | Route or tab in the salon admin (or booking) app |
| **Feature** | User-facing capability |
| **API call** | HTTP method + path (all prefixed with `/v1`) |
| **Permission** | `ServiceCategory` or `Service` module + `read` / `write` / `edit` / `delete` |
| **UI components** | Suggested widgets and layout |
| **State management** | What to store/update in client state after success |
| **Validation** | Client + server rules and typical error keys |

---

### 2.0 Master index (all endpoints)

| # | Screen | Feature | Method | Endpoint | Permission |
|---|--------|---------|--------|----------|------------|
| 1 | Categories | List / search / paginate | `GET` | `/categories` | ServiceCategory · read |
| 2 | Categories | View detail | `GET` | `/categories/:id` | ServiceCategory · read |
| 3 | Categories | Create | `POST` | `/categories` | ServiceCategory · write |
| 4 | Categories | Update | `PUT` | `/categories/:id` | ServiceCategory · edit |
| 5 | Categories | Toggle active | `PATCH` | `/categories/:id/status` | ServiceCategory · edit |
| 6 | Categories | Delete | `DELETE` | `/categories/:id` | ServiceCategory · delete |
| 7 | Services | List / search / filter / sort | `GET` | `/services` | Service · read |
| 8 | Services | View detail | `GET` | `/services/:id` | Service · read |
| 9 | Services | Create (optional image) | `POST` | `/services` | Service · write |
| 10 | Services | Update (optional image) | `PUT` | `/services/:id` | Service · edit |
| 11 | Services | Toggle active | `PATCH` | `/services/:id/status` | Service · edit |
| 12 | Services | Delete | `DELETE` | `/services/:id` | Service · delete |
| 13 | Service detail | List staff assignments | `GET` | `/services/:serviceId/staff` | Service · read |
| 14 | Service detail | Assign staff (full list) | `PUT` | `/services/:serviceId/staff` | Service · edit |
| 15 | Service detail | Update one assignment | `PATCH` | `/services/:serviceId/staff/:staffId` | Service · edit |
| 16 | Service detail | Remove assignment | `DELETE` | `/services/:serviceId/staff/:staffId` | Service · delete |
| 17 | Booking | Stylist picker | `GET` | `/services/:serviceId/staff/qualified` | Service · read |
| 18 | Service detail | List linked skills | `GET` | `/services/:serviceId/skills` | Service · read |
| 19 | Service detail | Replace linked skills | `PUT` | `/services/:serviceId/skills` | Service · edit |

**Stylists & skill master:** see [stylist-api-flow-diagram.md](./stylist-api-flow-diagram.md) (`/stylists`, `/skills`).

---

### 2.1 Category management

#### Feature map

| Screen | Feature | API call | Permission | UI components | State management | Validation |
|--------|---------|----------|------------|---------------|------------------|------------|
| Category list | List with search & filters | `GET /categories` | ServiceCategory · read | Data table; search input; gender dropdown (`MALE`/`FEMALE`/`UNISEX`); active filter; pagination (10/25/50/100); sortable columns | `categoryFilters` (searchText, gender, isActive, sortBy, sortDirection, pageSize, pageNumber); `categories[]`; `totalCount`; `isLoading` | Query: `ListServiceCategoryRequestDto`. `sortBy`: `name`, `gender`, `createdAt`, `updatedAt` |
| Category list | Open edit | `GET /categories/:id` | ServiceCategory · read | Row action → drawer or `/categories/:id/edit` | `selectedCategory` | Path `:id` = UUID |
| Category list | Create new | `POST /categories` | ServiceCategory · write | “Add category” → modal/page: name, gender, active (default on) | Invalidate list or append row; `selectedCategory` | Body: `CreateServiceCategoryRequestDto`. Errors: `ERR_SERVICE_CATEGORY_EXISTS` |
| Category edit | Save changes | `PUT /categories/:id` | ServiceCategory · edit | Form: name, gender, isActive | Merge into `selectedCategory` + list cache | Body: `UpdateServiceCategoryRequestDto` (partial fields) |
| Category list | Toggle active (inline) | `PATCH /categories/:id/status` | ServiceCategory · edit | Row switch | Set `row.isActive`; toast | Body: `{ "isActive": boolean }`. Deactivating category may deactivate its services server-side |
| Category list | Delete | `DELETE /categories/:id` | ServiceCategory · delete | Confirm modal | Remove id from `categories[]`; decrement `totalCount` | `ERR_SERVICE_CATEGORY_HAS_SERVICES` if services still linked |

#### Request / response (categories)

| Feature | Request (body or query) | Success `data` | HTTP errors |
|---------|-------------------------|----------------|-------------|
| List | Query: `searchText`, `gender`, `isActive`, `pageSize`, `pageNumber`, `sortBy`, `sortDirection` | `CommonSearchResponseDto<ServiceCategoryResponseDto>` | 400, 403 |
| Detail | Path: `id` | `ServiceCategoryResponseDto` | 404 |
| Create | `{ name, gender, isActive? }` | `ServiceCategoryResponseDto` | 400 duplicate name |
| Update | `{ name?, gender?, isActive? }` | `ServiceCategoryResponseDto` | 400, 404 |
| Status | `{ isActive }` | `ServiceCategoryResponseDto` | 404 |
| Delete | Path: `id` | `{}` | 400 has services, 404 |

---

### 2.2 Service management

#### Feature map

| Screen | Feature | API call | Permission | UI components | State management | Validation |
|--------|---------|----------|------------|---------------|------------------|------------|
| Service list | List with search & filters | `GET /services` | Service · read | Table or cards; category filter; gender filter; active filter; sort (price, duration, name); thumbnail from `imageUrl` | `serviceFilters`; `services[]`; `totalCount` | Query: `ListServiceRequestDto`. `sortBy`: `name`, `price`, `durationMin`, `createdAt`, `updatedAt` |
| Service list | Filter by staff | `GET /services?staffId=…&staffSearchText=…&assignmentIsActive=…` | Service · read | Staff autocomplete + “assigned only” toggle | Same as list state | Requires valid staff UUID from User module |
| Service list | Drill-down from category | `GET /services?categoryId={uuid}` | Service · read | Breadcrumb “Category: Hair” | Pre-fill `serviceFilters.categoryId` | From category row navigation |
| Service list | Open detail / edit | `GET /services/:id` | Service · read | Detail panel: name, category, price, duration, description, image | `selectedService` | Use `imageUrl` for `<img src>` |
| Service form | Create | `POST /services` | Service · write | Form + file input `image`; category dropdown | Set `selectedService`; navigate to detail or list | Multipart fields. `price` > 0, `durationMin` ≥ 1. Image JPG/PNG/WEBP ≤ 2MB. `ERR_SERVICE_CATEGORY_INACTIVE`, `ERR_SERVICE_EXISTS` |
| Service form | Update | `PUT /services/:id` | Service · edit | Same as create | Refresh `selectedService` + list row | Optional new `image` replaces old on server |
| Service list | Toggle active (inline) | `PATCH /services/:id/status` | Service · edit | Row switch | `row.isActive` | Inactive → hidden from booking qualified list |
| Service list | Delete | `DELETE /services/:id` | Service · delete | Confirm modal | Remove from `services[]` | Soft delete on server |

#### Request / response (services)

| Feature | Request (body or query) | Success `data` | HTTP errors |
|---------|-------------------------|----------------|-------------|
| List | Query: above + `includeAssignedStaff?` (default true), `includeSkills?` (default true) | `CommonSearchResponseDto<ServiceResponseDto>` — each item may include `assignedStaff[]` (`staffId`, `staffName`, `skillLevel`, `isActive`, `experienceYears`) and `skills[]` (`id`, `name`, `isActive`) | 400, 403 |
| Detail | Path: `id` | `ServiceResponseDto` (includes `categoryName`, `gender`, `imageUrl`, `assignedStaff[]`, `skills[]`) | 404 |
| Create | Multipart: `categoryId`, `name`, `description?`, `price`, `durationMin`, `isActive?`, `image?` | `ServiceResponseDto` | 400 validation / category inactive / duplicate name |
| Update | Multipart: partial fields + optional `image` | `ServiceResponseDto` | 400, 404 |
| Status | `{ isActive }` | `ServiceResponseDto` | 404 |
| Delete | Path: `id` | `{}` | 404 |

---

### 2.3 Staff mapping (service detail)

#### Feature map

| Screen | Feature | API call | Permission | UI components | State management | Validation |
|--------|---------|----------|------------|---------------|------------------|------------|
| Service detail | View assigned staff | `GET /services/:serviceId/staff` | Service · read | Table: staff name, email, skill badge, active switch, actions | `serviceStaff[]` for this `serviceId` | Query `?isActive=true/false` optional |
| Service detail | Assign / replace stylists | `PUT /services/:serviceId/staff` | Service · edit | Drawer: multi-select from **stylists** API; per row `skillLevel` `JUNIOR`/`SENIOR`/`EXPERT` (proficiency, not skill master); full list on save | Replace `serviceStaff[]` | `ERR_USER_NOT_STAFF` if not STYLIST user type. **No** server check that stylist `skills[]` match service `skills[]` |
| Service detail | Change skill / assignment active | `PATCH /services/:serviceId/staff/:staffId` | Service · edit | Inline dropdown or row modal | Update one item in `serviceStaff[]` | `UpdateServiceStaffMappingRequestDto` |
| Service detail | Unassign one | `DELETE /services/:serviceId/staff/:staffId` | Service · delete | Row delete with confirm | Remove row from `serviceStaff[]` | 404 if mapping gone |

#### Request / response (staff mapping)

| Feature | Request | Success `data` | HTTP errors |
|---------|---------|----------------|-------------|
| List assignments | Query: `isActive?` | `ServiceStaffMappingResponseDto[]` | 404 service |
| Assign (replace) | `{ assignments: [{ staffId, skillLevel, isActive? }] }` | `ServiceStaffMappingResponseDto[]` | 400 staff invalid, 404 |
| Update one | `{ skillLevel?, isActive? }` | `ServiceStaffMappingResponseDto` | 404 |
| Remove one | Path: `serviceId`, `staffId` | `{}` | 404 |

**UX rule:** After any change in the assign drawer, call `PUT` with the complete desired `assignments` array (not only deltas).

**Admin UX (skills):** Load `GET /services/:id` → show `skills[]` and each `assignedStaff[].experienceYears`. Optionally highlight stylists whose `GET /stylists/:id` `skills[]` overlap service skills — **client-side only**.

---

### 2.4 Service skills (admin metadata)

#### Feature map

| Screen | Feature | API call | Permission | UI components | State management | Validation |
|--------|---------|----------|------------|---------------|------------------|------------|
| Service detail | View required skills | `GET /services/:serviceId/skills` | Service · read | Chips / tags on service header | `serviceSkillMappings[]` | — |
| Service detail | Set required skills | `PUT /services/:serviceId/skills` | Service · edit | Multi-select from `GET /skills` | Replace tags; sync `service.skills[]` on save | Body: `{ skillIds: [] }` full replace; `ERR_UNIQUE_ARRAY_ITEM` |

#### Request / response

| Feature | Request | Success `data` | HTTP errors |
|---------|---------|----------------|-------------|
| List | Path: `serviceId` | `ServiceSkillMappingResponseDto[]` (`skillId`, `skillName`) | 404 |
| Assign | `{ skillIds: string[] }` | Same array shape | 404 service/skill |

---

### 2.5 Booking (customer / stylist selection)

#### Feature map

| Screen | Feature | API call | Permission | UI components | State management | Validation |
|--------|---------|----------|------------|---------------|------------------|------------|
| Booking — select stylist | Show only qualified staff | `GET /services/:serviceId/staff/qualified` | Service · read (customer token TBD) | Dropdown or cards: name + skill level | `qualifiedStaff[]`; `selectedStaffId` | Call **after** service selected. Empty list → messaging + link to admin assign flow |
| Booking — select stylist | Do **not** use admin staff list | — | — | Avoid `GET .../staff` on customer UI | — | Admin list may include inactive assignments |

#### Request / response (booking)

| Feature | Request | Success `data` | HTTP errors |
|---------|---------|----------------|-------------|
| Qualified staff | Path: `serviceId` (active service only) | `QualifiedStaffResponseDto[]` (`staffId`, `staffName`, `skillLevel`) | 404 inactive/missing service |

---

### 2.6 Cross-feature UI state (recommended store shape)

| Store key | Type | Populated by | Used on |
|-----------|------|--------------|---------|
| `categoryFilters` | object | User input | `GET /categories` |
| `categories` | array | List / CRUD | Category tab |
| `selectedCategoryId` | string \| null | Row click | Edit, `GET /services?categoryId=` |
| `serviceFilters` | object | User input | `GET /services` |
| `services` | array | List / CRUD | Service tab |
| `selectedServiceId` | string \| null | Row click | Detail, staff panel |
| `serviceStaff` | array | `GET/PUT .../staff` | Assign staff drawer |
| `qualifiedStaff` | array | `GET .../qualified` | Booking step |
| `serviceSkills` | array | `GET/PUT .../services/:id/skills` | Service detail tags |

---

## 3. API integration priority

### Phase 1 — Core (must-have) ~1–2 sprints

| Order | APIs | Depends on | UI deliverable |
|-------|------|------------|----------------|
| 1 | `GET /categories`, `POST /categories`, `PATCH .../status` | Auth + tenant | Category tab usable |
| 2 | `GET /services`, `POST /services`, `PATCH .../status` | Categories exist for `categoryId` | Service tab + create |
| 3 | `GET /services/:id`, `PUT /services/:id` | List | Edit service |
| 4 | `GET /categories/:id`, `PUT /categories/:id` | List | Edit category |

### Phase 2 — Important (should-have) ~1 sprint

| Order | APIs | Depends on | UI deliverable |
|-------|------|------------|----------------|
| 5 | `DELETE /categories/:id`, `DELETE /services/:id` | List + confirm | Safe removal |
| 6 | `GET /services/:id/staff`, `PUT /services/:id/staff` | Service detail + staff user list | Assign staff drawer |
| 7 | List filters: `staffId`, `staffSearchText`, sort by price/duration | Phase 1 list | Operations views |

### Phase 3 — Enhanced (nice-to-have)

| Order | APIs | Depends on | UI deliverable |
|-------|------|------------|----------------|
| 8 | `GET .../staff/qualified` | Assign staff + booking module | Customer stylist picker |
| 9 | `PATCH .../staff/:staffId` | Bulk assign | Inline skill toggle without full PUT |
| 10 | Image crop/resize UI | `POST`/`PUT` multipart | Better thumbnails (server stores file name; CDN `imageUrl`) |

**Cross-module dependencies**

- **Stylist module:** Staff assign picker → `GET /v1/stylists/dropdown` (not generic `/users`).
- **Skill module:** Service/stylist skill tags → `GET /v1/skills`; see [stylist-api-flow-diagram.md](./stylist-api-flow-diagram.md).
- **Role permissions:** `ServiceCategory`, `Service`, `Stylist`, `Skill` in salon role JSON.
- **Tenant onboarding:** New tenants receive seeded categories/services via `POST /tenants` (platform); salon admin starts from populated catalog.

---

## 4. Template for future API additions

### 4.1 ASCII flow template

```
┌──────────────────────────┐
│  UI: [SCREEN_NAME]       │
│  [USER_ACTION]           │
└────────────┬─────────────┘
             ▼
┌──────────────────────────────────────────────┐
│  [METHOD] /v1/[resource]                     │
│  Headers: Bearer + x-tenant                  │
│  Body/Query: [DTO_NAME]                      │
└────────────┬─────────────────────────────────┘
             ├─► 2xx → [STATE_UPDATE]
             ├─► 400 → [FIELD_ERRORS]
             ├─► 403 → [NO_ACCESS]
             └─► 404 → [NOT_FOUND]
```

### 4.2 Feature mapping template

| Feature | API | UI | State | Validation |
|---------|-----|-----|-------|------------|
| | | | | |

### 4.3 Changelog template

| Version | Date | Change | Frontend impact |
|---------|------|--------|-----------------|
| 1.0 | 2026-05-29 | Initial service catalog APIs | Categories, services, staff mapping |
| 1.1 | 2026-05-29 | Service `skills[]`, `assignedStaff[]` + `/services/:id/skills`; stylist doc split | List/detail enrichment; skill tags; stylist picker |

---

## 5. Error handling flow

### 5.1 Network and auth

```
Request
   │
   ├─► Network fail → retry toast; offline banner
   ├─► 401 → clear token; redirect login
   └─► 403 → hide/disable action; support message
```

### 5.2 Category business errors

```
POST/PUT category
   ├─► ERR_SERVICE_CATEGORY_EXISTS → highlight name
   └─► DELETE + ERR_SERVICE_CATEGORY_HAS_SERVICES → explain linked services

PATCH category isActive=false
   └─► Inform: linked services may auto-deactivate (server-side)
```

### 5.3 Service business errors

```
POST/PUT service
   ├─► ERR_SERVICE_CATEGORY_INACTIVE → category dropdown error
   ├─► ERR_SERVICE_EXISTS → name field
   └─► Image errors → ERR_INVALID_FILE_TYPE / ERR_MAX_VALUE (2MB)

PATCH service isActive=false
   └─► Booking UI should call qualified endpoint → empty list
```

### 5.4 Staff mapping errors

```
PUT assignments
   ├─► ERR_USER_NOT_STAFF → mark invalid users in picker
   └─► ERR_UNIQUE_ARRAY_ITEM → dedupe staff rows before save

GET qualified (booking)
   └─► Empty results → “No stylists” CTA back to service selection
```

---

## Request/response reference (quick)

### Create category (`POST /v1/categories`)

```json
{
  "name": "Hair",
  "gender": "UNISEX",
  "isActive": true
}
```

### Create service (`POST /v1/services` — multipart fields)

| Field | Required | Notes |
|-------|----------|--------|
| categoryId | Yes | UUID |
| name | Yes | Unique per category per tenant |
| description | No | |
| price | Yes | Number > 0 |
| durationMin | Yes | Integer minutes ≥ 1 |
| isActive | No | Default true |
| image | No | File |

### Assign staff (`PUT /v1/services/:serviceId/staff`)

```json
{
  "assignments": [
    { "staffId": "uuid", "skillLevel": "SENIOR", "isActive": true },
    { "staffId": "uuid", "skillLevel": "JUNIOR", "isActive": true }
  ]
}
```

---

## Quality checklist

- [x] Major admin journeys: categories, services, staff assign, booking qualified staff
- [x] Flow diagrams include success and error branches
- [x] Feature mappings cover API, UI, state, validation
- [x] Integration phases with dependencies
- [x] Reusable templates and changelog format
- [x] Error handling: network, auth, business keys
- [x] Frontend handoff: headers, envelopes, enums, journey table, endpoint JSON

---

*Generated per `api-flow-diagram-prompt.md` / `anvix-api-flow-diagram` skill. Controllers: `src/modules/service-category`, `src/modules/service`. Swagger: `/api` (when enabled).*
