# User Module API Flow Diagram

## 📋 **Complete API Flow Visualization**

### **User Creation Flow**

```
┌─────────────────────┐
│    USER CREATION    │
│   /users (POST)     │
└─────────┬───────────┘
          │ User enters creation details
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ POST /users                                                     │
│ {                                                               │
│   firstName: "John",                                            │
│   lastName: "Doe",                                              │
│   email: "john.doe@example.com",                                │
│   password: "securePassword",                                   │
│   dateOfBirth: "1990-01",                                   │
│   age: "30",                                                    │
│   phoneNumber: "+1234567890",                                  │
│   userType: "ADMIN",                                            │
│   status: "ACTIVE"                                              │
│ }                                                               │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─► Validation Success
          │   └─ Check if user with same email exists
          │       ├─► Email exists → Conflict Error (ERR_EMAIL_EXISTS)
          │       └─► Email not exists → Continue
          │           └─ Create user entity with provided data
          │               └─ Set status to ACTIVE by default
          │                   └─ Hash password (if provided)
          │                       └─ Save user to database
          │                           └─ Send onboarding email (if userType is USER)
          │                               └─ Clear user list caches
          │                                   └─ Return UserResponseDto
          │
          └─► Validation Error
              └─ Return validation error messages
```

### **User Retrieval Flow**

```
┌─────────────────────┐
│   USER RETRIEVAL    │
│  /users/:id (GET)   │
└─────────┬───────────┘
          │ User requests specific user details
          ▼
┌─────────────────────────────────────────────────────────┐
│ GET /users/{id}                                                 │
│ Parameters:                                                     │
│   id: "123e4567-e89b-12d3-a456-426614174000"                   │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─► User ID validation fails
          │   └─ Return validation error
          │
          └─► User ID validation passes
              └─ Find user by ID in database
                  ├─► User not found → Not Found Error
                  └─► User found → Continue
                      └─ Map user entity to UserResponseDto
                          └─ Return user data with success response
```

### **User List Flow**

```
┌─────────────────────┐
│   USER LISTING      │
│   /users (GET)      │
└─────────┬───────────┘
          │ User requests list of users with filters
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ GET /users                                                      │
│ Query Parameters:                                               │
│   searchText: "john",                                           │
│   userType: "ADMIN",                                            │
│   status: "ACTIVE",                                             │
│   sortBy: "firstName",                                          │
│   sortDirection: "ASC",                                         │
│   pageSize: 10,                                                 │
│   pageNumber: 1,                                                │
│   startDate: "2024-01-01",                                      │
│   endDate: "2024-12-31"                                         │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─► Validation Success
          │   └─ Build query with provided filters
          │       ├─► Apply text search (firstName, lastName, email)
          │       ├─► Apply userType filter
          │       ├─► Apply status filter
          │       ├─► Apply date range filter
          │       ├─► Apply sorting
          │       └─ Execute paginated query
          │           └─ Return CommonSearchResponseDto with users
          │
          └─► Validation Error
              └─ Return validation error messages
```

### **User Update Flow**

```
┌─────────────────────┐
│   USER UPDATE       │
│  /users/:id (PUT)   │
└─────────┬───────────┘
          │ User submits updated user details
          ▼
┌─────────────────────────────────┐
│ PUT /users/{id}                                                 │
│ Parameters:                                                     │
│   id: "123e4567-e89b-12d3-a456-426614174000"                   │
│ Body:                                                           │
│ {                                                               │
│   firstName: "Jane",                                            │
│   lastName: "Smith",                                            │
│   email: "jane.smith@example.com",                              │
│   phoneNumber: "+1987654321",                                  │
│   dateOfBirth: "1992-05-15",                                   │
│   age: "32"                                                    │
│ }                                                               │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─► Validation Success
          │   └─ Find user by ID
          │       ├─► User not found → Not Found Error
          │       └─► User found → Continue
          │           └─ If email is being updated, check uniqueness
          │               ├─► Email exists for different user → Conflict Error
          │               └─► Email is unique → Continue
          │                   └─ Update user properties with provided data
          │                       └─ Save updated user to database
          │                           └─ Clear user list caches
          │                               └─ Return updated UserResponseDto
          │
          └─► Validation Error
              └─ Return validation error messages
```

### **User Deletion Flow**

```
┌─────────────────────┐
│   USER DELETION     │
│ /users/:id (DELETE) │
└─────────┬───────────┘
          │ User requests to delete a user
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ DELETE /users/{id}                                              │
│ Parameters:                                                     │
│   id: "123e4567-e89b-12d3-a456-426614174000"                   │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─► User ID validation fails
          │   └─ Return validation error
          │
          └─► User ID validation passes
              └─ Find user by ID
                  ├─► User not found → Not Found Error
                  └─► User found → Continue
                      └─ Perform soft delete (mark as deleted)
                          └─ Clear user list caches
                              └─ Return success response
```

### **User Dropdown Flow**

```
┌─────────────────────┐
│  USER DROPDOWN      │
│ /users/dropdown     │
└─────────┬───────────┘
          │ Request user dropdown data for select controls
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ GET /users/dropdown                                             │
│ Query Parameters:                                               │
│   searchText: "john",                                           │
│   userType: "USER",                                             │
│   pageSize: 10,                                                 │
│   pageNumber: 1                                                │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─► Check cache for dropdown data
          │   ├─► Data found in cache → Return cached data
          │   └─► Data not in cache → Continue
          │       └─ Build query with filters
          │           ├─► Apply text search on name fields
          │           ├─► Apply userType filter
          │           └─► Order by firstName
          │               └─ Execute query to get id and name
          │                   └─ Format as CommonDropdownResponseDto
          │                       └─ Cache results for 5 minutes
          │                           └─ Return dropdown data
          │
          └─► Validation Error
              └─ Return validation error messages
```

## 🗺️ **Feature-to-API Mapping**

### **User Management Feature**
- **API Call:** `POST /users`
- **UI Components:**
  - User creation form with validation
  - First name, last name, email, password fields
  - Phone number, date of birth, age inputs
  - User type selection dropdown
  - Status selection dropdown
  - Loading state indicators
- **State Management:**
  - User form data
  - Loading states
  - Error messages
  - Success confirmation
- **Validation:**
  - Email format validation
  - Required field validation
  - Field length validations
  - Age calculation from date of birth
  - User type and status enum validation
- **Response Handling:**
  - Show success message
  - Redirect to user list
  - Handle duplicate email error (ERR_EMAIL_EXISTS)

### **User Detail View Feature**
- **API Call:** `GET /users/:id`
- **UI Components:**
  - User detail page
  - Display user information in readable format
  - Edit button for modification
  - Back to list navigation
- **State Management:**
  - Current user data
  - Loading states
 - Error messages
- **Validation:**
  - UUID validation for user ID parameter
- **Response Handling:**
  - Display user information
  - Handle user not found error

### **User List Feature**
- **API Call:** `GET /users`
- **UI Components:**
  - User table with pagination
  - Search and filter controls
 - Sorting capabilities
  - Action buttons (edit, delete)
  - Loading indicators
- **State Management:**
  - Pagination settings
  - Filter criteria
  - Sorting preferences
  - User list data
  - Loading states
- **Validation:**
  - Query parameter validation
  - Page size and number validation
- **Response Handling:**
  - Display users in tabular format
  - Handle pagination
  - Show empty state when no users found

### **User Update Feature**
- **API Call:** `PUT /users/:id`
- **UI Components:**
  - User edit form with pre-filled data
  - First name, last name, email fields
  - Phone number, date of birth, age inputs
  - User type selection
  - Status selection
  - Save and cancel buttons
 - Loading indicators
- **State Management:**
  - Current user data for pre-filling
  - Updated form data
 - Loading states
 - Error messages
- **Validation:**
  - Email format validation
 - Required field validation
  - Field length validations
  - Unique email validation (excluding current user)
- **Response Handling:**
  - Show update success message
  - Redirect to user detail or list
  - Handle duplicate email error

### **User Deletion Feature**
- **API Call:** `DELETE /users/:id`
- **UI Components:**
  - Confirmation dialog modal
  - Delete confirmation button
  - Cancel button
  - Loading indicators
- **State Management:**
  - User ID to be deleted
  - Confirmation dialog visibility
 - Loading states
- **Validation:**
  - UUID validation for user ID parameter
- **Response Handling:**
  - Show deletion success message
  - Remove user from list view
  - Handle deletion errors

### **User Selection Feature**
- **API Call:** `GET /users/dropdown`
- **UI Components:**
  - Dropdown/autocomplete component
  - Search input within dropdown
  - Loading indicators
  - Lazy loading support
- **State Management:**
  - Dropdown data cache
  - Selected user value
  - Search text
  - Loading states
- **Validation:**
  - Query parameter validation
  - Page size and number validation
- **Response Handling:**
  - Cache dropdown data
  - Display in dropdown format
  - Handle empty search results

## ⚡ **API Integration Priority**

### **Phase 1: Core Functionality (Must-Have APIs)**
1. **User Creation** - `POST /users`
   - Essential for user management
   - Creates new users with basic information
   - Includes email uniqueness validation
   - Supports different user types and statuses

2. **User Retrieval** - `GET /users/:id`
   - Critical for viewing individual user details
   - Enables user information access
   - Supports detailed user information display

3. **User List** - `GET /users`
   - Fundamental for user management interface
   - Supports search, filtering, and pagination
   - Enables bulk user operations

### **Phase 2: Important Features (Should-Have APIs)**
4. **User Update** - `PUT /users/:id`
   - Allows modification of user details
   - Supports email uniqueness checks during updates
   - Enables user information maintenance

5. **User Dropdown** - `GET /users/dropdown`
   - Provides user selection for other modules
   - Implements caching for performance
   - Supports search and filtering

### **Phase 3: Enhanced Features (Nice-to-Have APIs)**
6. **User Deletion** - `DELETE /users/:id`
   - Enables removal of users (soft delete)
   - Supports data integrity through soft deletion
   - Includes cache clearing for consistency

## 📐 **Template for Future API Additions**

### **ASCII Diagram Template**
```
┌─────────────────────┐
│   [FEATURE NAME]    │
│   [/api/endpoint]   │
└─────────┬───────────┘
          │ [User Action/Trigger]
          ▼
┌─────────────────────────────────────┐
│ [HTTP_METHOD] /api/endpoint         │
│ {                                   │
│   [request body fields]             │
│ }                                   │
└─────────┬───────────────────┘
          │
          ├─► [Success Path]
          │   └─ [Processing Steps]
          │       └─ [Response]
          │
          └─► [Error Path]
              └─ [Error Response]
```

### **Feature Mapping Template**
- **API Call:** `[HTTP_METHOD] /[endpoint]`
- **UI Components:**
  - [List of UI components needed]
- **State Management:**
  - [State variables to manage]
- **Validation:**
  - [Validation rules to implement]
- **Response Handling:**
  - [How to handle different responses]

### **API Change Log Template**
```
### **Version [X.X.X] - [Date] - [Change Type]**
- **Added:** [New endpoints or features]
- **Modified:** [Changes to existing functionality]
- **Deprecated:** [Features to be removed]
- **Removed:** [Features that were removed]
- **Fixed:** [Bug fixes]
```

## 🛡️ **Error Handling Flow**

### **Network Error Scenarios**
```
┌─────────────┐
│  UI ACTION  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API REQUEST         │
└──────┬──────────────┘
       │
       ├─► Network Error
       │   └─ Show network error message
       │       └─ Retry mechanism
       │
       └─► Request Timeout
           └─ Show timeout message
               └─ Allow retry
```

### **Authentication/Authorization Errors**
```
┌─────────────────────┐
│  AUTHENTICATION     │
│  ERROR FLOWS        │
└─────────┬───────────┘
          │
          ├─► Unauthorized (401)
          │   └─ Invalid or expired JWT token
          │       └─ Redirect to login page
          │
          └─► Forbidden (403)
              └─ Insufficient permissions
                  └─ Show permission error
```

### **Business Logic Errors**
```
┌─────────────────────┐
│  BUSINESS LOGIC     │
│ ERROR FLOWS        │
└─────────┬───────────┘
          │
          ├─► ERR_EMAIL_EXISTS
          │   └─ Show "Email already exists" message
          │
          ├─► ERR_MODULE_NOT_FOUND
          │   └─ Show "User not found" message
          │
          ├─► Validation Errors
          │   └─ Show field-specific validation messages
          │
          └─► Database Errors
              └─ Show generic error message
```

### **User-Friendly Error Messaging**
- **Network Errors:** "Connection failed. Please check your internet connection and try again."
- **Server Errors:** "Something went wrong. Please try again later."
- **Validation Errors:** "Please fix the following errors: [specific field errors]"
- **Not Found Errors:** "User not found. The requested user may have been deleted."
- **Conflict Errors:** "This email is already registered. Please use a different email address."

## 🏗️ **Technical Implementation Details**

### **Data Access Layer**
- All database operations use UserRepository with TypeORM
- Soft delete implementation for user records
- Caching implemented for dropdown data (5-minute TTL)
- Complex filtering and pagination handled in repository layer

### **Security Considerations**
- JWT authentication required for all endpoints
- UUID validation for user IDs
- Input sanitization and validation on all fields
- Password hashing handled by entity lifecycle hooks
- Email uniqueness validation across user types

### **Performance Optimizations**
- Caching for dropdown data to reduce database load
- Selective field fetching in queries
- Pagination support for large datasets
- Lazy loading for dropdown components

### **Audit Trail**
- Created and updated timestamps tracked
- Soft deletion preserves historical data
- Cache invalidation on data modifications
- Consistent response format across all endpoints