# Stylist & Skills — API flow diagram

**Module:** Salon Admin — Stylists (`userType` STYLIST), Skills master, skill tags  
**Version:** 1.0  
**Base path:** `/v1`  
**Controllers:** `StylistController` (`/stylists`), `StylistSkillController` (`/stylists/:stylistId/skills`), `SkillController` (`/skills`)  
**Related:** [service-catalog-api-flow-diagram.md](./service-catalog-api-flow-diagram.md) — services, staff assign, service skill tags  
**Guards:** `RoleGuard` + `@RequirePermissions`  
**Tenant:** Required — `x-tenant` or `x-tenant-id`

---

## Frontend handoff bundle

### HTTP basics

| Item | Value |
|------|--------|
| Base URL | `{API_HOST}/v1` |
| Content-Type | `application/json` |
| Auth | `Authorization: Bearer <accessToken>` |

### Success envelope

Same `AppResponse` as other modules (`message`, `data`). Lists use `CommonSearchResponseDto` (`results`, `pageSize`, `page`, `totalCount`).

### Important product rules

| Topic | Behavior |
|--------|----------|
| Stylist vs user | Stylists are `user` rows with `userType = 5` (STYLIST). Use **`/stylists`** for salon staff CRUD, not `/users`. |
| Skill master | Tenant catalog of capabilities (e.g. “Hair Coloring”). CRUD on `/skills`. |
| Stylist skills | Tags on stylist profile — `PUT /stylists/:id/skills` with `{ skillIds: [] }`. |
| Service skills | Tags on service — see catalog doc `PUT /services/:id/skills`. |
| Staff assignment | `PUT /services/:id/staff` only requires **STYLIST** user type. **No** API rule that stylist skills must match service skills. |
| Experience | `experienceYears` (0–60) on stylist create/update/list/detail. |
| Skill level on assign | `JUNIOR` / `SENIOR` / `EXPERT` on **service_staff_mapping** is proficiency for that service, not the skill master table. |

### Screen → API journey

| Screen | User action | HTTP | Permission | Persist | Next |
|--------|-------------|------|------------|---------|------|
| Skills settings | List / CRUD skills | `GET/POST/PUT/PATCH/DELETE /v1/skills` | Skill | `skills[]` | Used in stylist/service tag pickers |
| Stylist list | Open / search | `GET /v1/stylists?...` | Stylist READ | `results[]` incl. `skills[]`, `experienceYears` | Row → edit |
| Stylist form | Create | `POST /v1/stylists` | Stylist WRITE | New stylist | Assign skills `PUT .../skills` |
| Stylist form | Save | `PUT /v1/stylists/:id` | Stylist EDIT | Updated DTO | — |
| Stylist detail | Assign skill tags | `PUT /v1/stylists/:id/skills` | Stylist EDIT | `skills[]` | Admin reference only |
| Service assign drawer | Pick stylists | `GET /v1/stylists/dropdown` | Stylist READ | Options | Then `PUT /services/:id/staff` |

### Endpoint index (JSON)

```json
[
  { "method": "GET", "path": "/v1/skills", "permissions": "Skill READ" },
  { "method": "POST", "path": "/v1/skills", "permissions": "Skill WRITE" },
  { "method": "GET", "path": "/v1/skills/:id", "permissions": "Skill READ" },
  { "method": "PUT", "path": "/v1/skills/:id", "permissions": "Skill EDIT" },
  { "method": "PATCH", "path": "/v1/skills/:id/status", "permissions": "Skill EDIT" },
  { "method": "DELETE", "path": "/v1/skills/:id", "permissions": "Skill DELETE" },
  { "method": "GET", "path": "/v1/stylists", "permissions": "Stylist READ" },
  { "method": "GET", "path": "/v1/stylists/dropdown", "permissions": "Stylist READ" },
  { "method": "GET", "path": "/v1/stylists/:id", "permissions": "Stylist READ" },
  { "method": "POST", "path": "/v1/stylists", "permissions": "Stylist WRITE" },
  { "method": "PUT", "path": "/v1/stylists/:id", "permissions": "Stylist EDIT" },
  { "method": "DELETE", "path": "/v1/stylists/:id", "permissions": "Stylist DELETE" },
  { "method": "GET", "path": "/v1/stylists/:stylistId/skills", "permissions": "Stylist READ" },
  { "method": "PUT", "path": "/v1/stylists/:stylistId/skills", "permissions": "Stylist EDIT", "body": "{ skillIds: string[] }" }
]
```

---

## 1. API flow visualization

### 1.1 Assign skills to stylist (full replace)

```
┌──────────────────────────┐
│  UI: Stylist edit        │
│  Skill multi-select      │
└────────────┬─────────────┘
             ▼
┌────────────────────────────────────────┐
│  PUT /v1/stylists/:stylistId/skills    │
│  { "skillIds": ["uuid", "uuid"] }      │
└────────────┬───────────────────────────┘
             ├─► 200 → refresh skills[] on profile
             ├─► 400 ERR_UNIQUE_ARRAY_ITEM
             └─► 404 → invalid stylist or skill id
```

### 1.2 Admin assigns stylist to service (cross-module)

```
┌──────────────────────────┐
│  UI: Service → Staff     │
│  Compare skills (UI)     │
│  service.skills[]        │
│  stylist.skills[]        │
└────────────┬─────────────┘
             ▼
┌────────────────────────────────────────┐
│  GET /v1/stylists/dropdown             │
│  PUT /v1/services/:serviceId/staff     │
│  (skillLevel = JUNIOR|SENIOR|EXPERT)   │
└────────────┬───────────────────────────┘
             └─► Server does NOT validate skill overlap
```

---

## 2. Feature-to-API mapping

### 2.0 Master index

| # | Area | Method | Endpoint | Permission |
|---|------|--------|----------|------------|
| 1–6 | Skills | CRUD + status | `/skills`, `/skills/:id` | Skill |
| 7 | Stylists | List | `GET /stylists` | Stylist · read |
| 8 | Stylists | Dropdown | `GET /stylists/dropdown` | Stylist · read |
| 9 | Stylists | Detail | `GET /stylists/:id` | Stylist · read |
| 10 | Stylists | Create | `POST /stylists` | Stylist · write |
| 11 | Stylists | Update | `PUT /stylists/:id` | Stylist · edit |
| 12 | Stylists | Delete | `DELETE /stylists/:id` | Stylist · delete |
| 13 | Stylist skills | List | `GET /stylists/:stylistId/skills` | Stylist · read |
| 14 | Stylist skills | Replace | `PUT /stylists/:stylistId/skills` | Stylist · edit |

### 2.1 Skills master

| Feature | API call | UI | State | Validation |
|---------|----------|-----|-------|------------|
| List | `GET /skills` | Settings table | `skills`, filters | `searchText`, `isActive`, `sortBy` name/createdAt |
| Create | `POST /skills` | Modal | Append row | `name` required; `ERR_SKILL_EXISTS` |
| Update | `PUT /skills/:id` | Form | Patch row | — |
| Delete | `DELETE /skills/:id` | Confirm | Remove | `ERR_SKILL_IN_USE` if mapped |

### 2.2 Stylists

| Feature | API call | UI | State | Validation |
|---------|----------|-----|-------|------------|
| List | `GET /stylists` | Staff table | `stylists[]` | Each row: `skills[]`, `experienceYears` |
| Create | `POST /stylists` | Onboarding form | `selectedStylist` | `firstName`, `lastName`, `email`, `dateOfBirth`, `age`; optional `experienceYears` 0–60 |
| Update | `PUT /stylists/:id` | Edit form | Refresh | Optional `experienceYears` |
| Dropdown | `GET /stylists/dropdown` | Assign-staff picker | Options | id + display name |

**`StylistResponseDto` (key fields):** `id`, `firstName`, `lastName`, `email`, `phoneNumber`, `dateOfBirth`, `experienceYears`, `status`, `roleId`, `skills[]` (`id`, `name`, `isActive`).

### 2.3 Stylist skill tags

| Feature | Request | Success `data` |
|---------|---------|----------------|
| List | Path `stylistId` | `StylistSkillMappingResponseDto[]` |
| Replace | `{ skillIds: string[] }` (empty clears) | Same |

---

## 3. API integration priority

| Phase | APIs | UI |
|-------|------|-----|
| 1 | `GET/POST /skills`, `GET/POST /stylists` | Skill catalog + add stylist |
| 2 | `PUT /stylists/:id/skills`, `PUT /services/:id/skills` | Tag stylists and services |
| 3 | `GET /stylists/dropdown` + service staff `PUT` | Assign staff with optional client-side skill hints |

---

## 4. Error handling

| Key | When |
|-----|------|
| `ERR_SKILL_EXISTS` | Duplicate skill name |
| `ERR_SKILL_IN_USE` | Delete skill still on stylist/service |
| `ERR_USER_NOT_STAFF` | Non-STYLIST id on service staff assign (catalog) |
| `ERR_UNIQUE_ARRAY_ITEM` | Duplicate ids in `skillIds` or `assignments` |

---

## Request examples

### Create stylist

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@salon.com",
  "dateOfBirth": "1990-01-01",
  "age": "34",
  "experienceYears": 8,
  "phoneNumber": "+919876543210"
}
```

### Assign stylist skills

```json
{
  "skillIds": ["skill-uuid-1", "skill-uuid-2"]
}
```

---

*Controllers: `src/modules/stylist`, `src/modules/skill`. Generated per `anvix-api-flow-diagram` skill.*
