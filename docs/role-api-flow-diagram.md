# Role Module API Flow Diagram

## 📋 **Complete API Flow Visualization**

### **Role CRUD + Permissions Flow**
```
┌──────────────┐
│ Role Admin   │
│ UI /roles    │
│ (RoleForm)   │
└──────┬───────┘
       │ User submits name, desc, permission matrix
       ▼
┌─────────────────────────────┐
│ POST /roles                 │
│ headers: Authorization Bearer│
│ payload: CreateRoleRequestDto │
└──────┬──────────────┬────────┘
       │               │
       │               ├─► Validation fails (name required, max length, permissions array) → 400 Bad Request
       │               ▼
       │       ┌───────────────┐
       │       │ RoleGuard +    │
       │       │ RequirePermissions → 403 if missing WRITE/EDIT
       │       └───────────────┘
       │               │
       ▼               ▼
┌─────────────────────────────┐
│ RoleService.createRole       │
│ → RoleRepository.findOne     │
│ → ensure name unique         │
│ → RoleRepository.save        │
│ → AppCacheService.clearListCachesByModule
└──────┬──────────────────────┘
       │
       ├─► Conflict if role exists → 400 ERR_ROLE_EXISTS
       │
       └─► Success → 201 Created + AppResponse w/ Role payload
```

### **Role List & Detail Flow (with Cache Awareness)**
```
┌──────────────┐
│ Role Catalog │
│ UI /roles?pg │
│ (RoleList)   │
└──────┬───────┘
       │ UI sends filters, pagination
       ▼
┌─────────────────────────────┐
│ GET /roles                  │
│ query: ListRoleRequestDto   │
└──────┬──────────────┘
       │
       ├─► AppCacheService.get(list key) → cache hit → return cached CommonSearchResponseDto
       │
       └─► Cache miss → RoleRepository.findRoles
           ├─► apply searchText, sort, pagination
           └─► AppCacheService.set(list key)
               └─► Return paged list + meta

┌──────────────┐
│ Role Detail  │
│ UI /roles/:id│
│ (RoleDetail) │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ GET /roles/:id              │
│ param: roleId               │
└──────┬──────────────┘
       │
       ├─► Cache hit → return RoleDetailResponseDto
       │
       └─► Cache miss → RoleRepository.findOne(isActive)
           ├─► Not found → 404 ERR_MODULE_NOT_FOUND
           └─► role found → cache + return
```

### **Role Update & Delete Flow**
```
┌──────────────┐
│ Role Detail  │
│ UI (RoleForm)│
└──────┬───────┘
       │ update payload
       ▼
┌─────────────────────────────┐
│ PUT /roles/:id              │
│ body: UpdateRoleRequestDto  │
└──────┬──────────────┘
       │
       ├─► Role not found → 404
       │
       └─► Update → persist, AppCacheService.del(detail key), clear list caches
           └─► Respond 200 OK with updated role

┌──────────────┐
│ Role Detail  │
│ UI delete    │
└──────┬───────┘
       ▼
┌─────────────────────────────┐
│ DELETE /roles/:id           │
└──────┬──────────────┘
       │
       ├─► Role missing → 404
       ├─► Protected system role (SUPER_ADMIN/ADMIN) → 400 ERR_CANNOT_DELETE_SYSTEM_ROLE
       └─► Soft delete isActive=false, clear caches, return 200
```

### **Role-to-User Assignment Flow**
```
┌──────────────┐
│ User List UI │
│ (Select users)│
└──────┬───────┘
       │ User picks users + role dropdown
       ▼
┌─────────────────────────────┐
│ POST /users/assign-role     │
│ body: AssignRoleToUserRequestDto │
└──────┬──────────────┘
       │
       ├─► Role missing → 404
       ├─► Any user missing → 404 with missing ids list
       └─► userService.updateUserRole batch → return 200

┌──────────────┐
│ User Profile │
│ (Remove role)│
└──────┬───────┘
       ▼
┌─────────────────────────────┐
│ DELETE /users/:userId/role  │
└──────┬──────────────┘
       │
       ├─► User missing → 404
       └─► updateUserRole(userId, null) → 200
```

### **Permission Metadata & Dropdown Flow**
```
┌──────────────┐
│ Permission   │
│ Matrix UI    │
└──────┬───────┘
       ▼
┌─────────────────────────────┐
│ GET /permissions/default    │
└──────┬──────────────┘
       │
       └─► App constants (getAvailableModules/DEFAULT_PERMISSIONS) → return DefaultPermissionsResponseDto

┌──────────────┐
│ Role Filter  │
│ dropdown     │
└──────┬───────┘
       ▼
┌─────────────────────────────┐
│ GET /dropdown              │
│ query: CommonDropdownRequestDto │
└──────┬──────────────┘
       │
       ├─► Cache hit → return CommonDropdownResponseDto
       └─► Cache miss → RoleRepository.findDropdown (exclude SUPER_ADMIN) + cache
```

## 🗺️ **Feature-to-API Mapping**

1. **Role Catalog + Search**
   - **API Call:** `GET /roles` (ListRoleRequestDto)
   - **UI Components:** `RoleListTable`, `RoleFiltersPanel`, `PaginationControls`
   - **State Management:** `roleState.filters`, `roleState.pagination`, `roleState.list`, `roleState.loading`
   - **Validation:** Frontend ensures `pageSize`, `pageNumber`, `sortBy` match API enums; search term trimmed before request.
   - **Implementation Detail:** Debounce filter changes, set `roleState.cacheKey` to build consistent cache keys before invoking service.

2. **Role Detail & Permission Matrix**
   - **API Calls:** `POST /roles`, `GET /roles/:id`, `PUT /roles/:id`, `DELETE /roles/:id`
   - **UI Components:** `RoleFormDrawer`, `PermissionsMatrix`, `SoftDeleteConfirmDialog`
   - **State Management:** `roleState.draft`, `roleState.permissions`, `roleState.formErrors`
   - **Validation:** `name` required/max length, `description` optional length check, `permissions` array non-empty per module; align with `ValidateNotEmpty` & `ValidateMaxLength` rules.
   - **Implementation Detail:** Serialize permission matrix to `RolePermission[]`, reuse `CommonDropdownResponseDto` for picking inherited roles.

3. **Role Assignment Panel (Users)**
   - **API Calls:** `POST /roles/users/assign-role`, `DELETE /roles/:userId/role`, `GET /roles/users/:userId/role`
   - **UI Components:** `AssignRoleModal`, `SelectedUsersChips`, `RolePreviewTile`
   - **State Management:** `assignmentState.selectedUserIds`, `assignmentState.selectedRole`, `assignmentState.loading`
   - **Validation:** Ensure `userIds` UUID list and `roleId` selected before submit; handle `ArrayNotEmpty`.
   - **Implementation Detail:** After assignment success, emit event to invalidation service (refresh user list).

4. **Permission Metadata & Dropdown Helpers**
   - **API Calls:** `GET /permissions/default`, `GET /dropdown`
   - **UI Components:** `PermissionTemplateSidebar`, `RoleDropdown`, `PermissionHelpTooltip`
   - **State Management:** `metadataState.availableModules`, `metadataState.dropdownOptions`
   - **Validation:** No payload, but guard ensures RBAC; handle `CommonDropdownRequestDto` filters.
   - **Implementation Detail:** Cache responses per session; use `isSuperAdmin` flag to show SUPER_ADMIN option conditionally.

```typescript
// Frontend example wiring POST /roles
await apiClient.post<CreateRoleRequestDto>("/roles", {
  name: roleState.draft.name,
  description: roleState.draft.description,
  permissions: roleState.permissions
});
```

## 🔢 **API Integration Priority**

1. **Phase 1 – Core Role Management (1–2 sprints)**
   - APIs: `POST /roles`, `GET /roles`, `GET /roles/:id`, `PUT /roles/:id`, `DELETE /roles/:id`
   - Dependencies: RoleRepository for persistence, AppCacheService for list/detail caching, RoleGuard/RequirePermissions for WRITE/EDIT/READ.
   - Outcome: Enables admins to create, review, update, and retire roles; forms foundation for RBAC.

2. **Phase 2 – Metadata & Supporting APIs (1 sprint)**
   - APIs: `GET /roles/dropdown`, `GET /roles/permissions/default`
   - Dependencies: `getAvailableModules`, `DEFAULT_PERMISSIONS`, `AppCacheService`, `isUserSuperAdmin` helper.
   - Timeline: Hook into RoleForm early to show permission matrix and dropdowns; form-level caching ensures fast load.

3. **Phase 3 – Assignment & User Lookups (1 sprint)**
   - APIs: `POST /roles/users/assign-role`, `DELETE /roles/:userId/role`, `GET /roles/users/:userId/role`
   - Dependencies: UserService for user validation/updates, AppPermissionService for fallback checks, event hooks to refresh user caches.
   - Outcome: Supports real-world admin operations like onboarding teams and adjusting access on the fly.

## 🧰 **Template for Future API Additions**

### ASCII Flow Template
```
┌──────────────┐
│ [UI ACTION]  │
│ /[path]      │
└──────┬───────┘
       │ User triggers
       ▼
┌─────────────────────────────┐
│ [HTTP METHOD] [endpoint]     │
│ body/query: [DTO]            │
└──────┬──────────────┬────────┘
       │               │
       ├─► Validation/Guard → [status]
       │
       └─► Service → Repository → Cache/Side effects
           └─► Success 2xx or Business Error
```

### Feature Mapping Template
- **Feature Name:**
  - **API Call:** `METHOD /endpoint`
  - **UI Components:**
  - **State Management:**
  - **Validation:**
  - **Implementation Notes:** (caching, dependencies, event hooks)

### API Change Log Format
```
### Version x.y – YYYY-MM-DD
- Added: [new API + reason]
- Changed: [payload/response updates]
- Deprecated: [old contract + migration steps]
```

## 🔒 **Error Handling Flow**

### Network & Transport Issues
- **Scenario:** UI loses connectivity while calling `POST /roles` or `GET /dropdown`.
- **Flow:** Browser retries based on standard network layer, then shows `"Unable to reach RBAC service, please retry"` toast.
- **Guide:** Keep retry logic outside RoleService; fallback UI to cached dropdown entries if available.

### Authentication/Authorization Failures
```
┌──────────────┐
│ UI Action    │
│ /roles       │
└──────┬───────┘
       ▼
┌─────────────────────────────┐
│ RoleGuard → Verify JWT +     │
│ RequirePermissions (module)  │
└──────┬──────────────┘
       │
       └─► 403 Forbidden → Show toast "You need ROLE.WRITE to perform this action"
```
- Logging: `RequirePermissions` decorator logs missing module/permission pair; propagate to monitoring.

### Business Logic Errors
- **Duplicate Role Name:** `createRole` throws `ERR_ROLE_EXISTS` → Map to user message `"Role with that name already exists"`.
- **Protected Role Delete:** `DELETE /roles/:id` with system type `SUPER_ADMIN/ADMIN` returns `ERR_CANNOT_DELETE_SYSTEM_ROLE` → Show `"This system role can only be deactivated"`.
- **Assign Role to Missing User:** `Assignment` checks `userService.findUsersByIds`; missing IDs produce 404 listing the absent users.

### User-Friendly Messaging
- Keep error translation keys consistent (e.g., `ERR_ROLE_EXISTS`, `ERR_MODULE_NOT_FOUND`).
- Frontend should surface context: `"Could not load roles (error ERR_MODULE_NOT_FOUND)"` for debugging and support.

## 🛠️ **Maintenance Guidelines**
- Update this diagram whenever `RoleController` adds/removes endpoints, especially when caching semantics change (`AppCacheService` key formats or TTL).
- When `RolePermission` structure evolves (new modules/flags), refresh the permission matrix templates and default permissions example in the metadata section.
- Document version bumps alongside the change log template so the frontend teams know when to refresh dropdown caches and revalidate validation rules.
- Track permission-related DTO changes with TypeScript references (e.g., `CreateRoleRequestDto`, `AssignRoleToUserRequestDto`) to keep the mapping section accurate.

## ✅ **Quality Checklist**
- [x] All major admin journeys (create, list, update, delete, assign, metadata) are visualized.
- [x] ASCII flows capture UI → backend → cache interactions with success/error branches.
- [x] Feature mapping ties UI components, state, validation rules, and DTOs to concrete APIs.
- [x] Phased integration plan reflects dependencies and realistic timelines.
- [x] Templates support future additions and change log tracking.
- [x] Error handling covers network, auth, and business logic with actionable messaging.
- [x] Documentation references TypeScript DTOs and services to maintain developer context.
