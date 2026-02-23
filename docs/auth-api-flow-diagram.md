# Auth Module API Flow Diagram

## 📋 **Complete API Flow Visualization**

### **User Registration Flow**

```
┌─────────────────────┐
│   USER REGISTRATION │
│   /auth/register    │
└─────────┬───────────┘
          │ User enters registration details
          ▼
┌─────────────────────────────┐
│ POST /auth/register                 │
│ {                                   │
│   firstName: "John",                │
│   lastName: "Doe",                  │
│   email: "john@example.com",        │
│   password: "securePassword",       │
│   dateOfBirth: "1990-01-01",        │
│   age: "30"                         │
│ }                                   │
└─────────┬───────────────────┘
          │
          ├─► Validation Success
          │   └─ Check if email exists
          │       ├─► Email exists → Conflict Error
          │       └─► Email not exists → Continue
          │           └─ Create user with PENDING_VERIFICATION status
          │               └─ Generate 6-digit OTP
          │                   └─ Save OTP to database
          │                       └─ Send OTP via email
          │                           └─ Return success response
          │
          └─► Validation Error
              └─ Return validation error message
```

### **User Login Flow**

```
┌─────────────────────┐
│     USER LOGIN      │
│    /auth/login      │
└─────────┬───────────┘
          │ User enters email and password
          ▼
┌─────────────────────────────────────┐
│ POST /auth/login                    │
│ {                                   │
│   email: "john@example.com",        │
│   password: "securePassword",       │
│   rememberMe: false                 │
│ }                                   │
└─────────┬───────────────────┘
          │
          ├─► User not found → Unauthorized Error
          │
          └─► User found → Verify password
              ├─► Password invalid → Unauthorized Error
              │
              └─► Password valid → Check user status
                  ├─► User inactive → Account inactive Error
                  │
                  └─► User active → Check OTP config
                      ├─► OTP disabled → Generate JWT tokens
                      │   └─ Store tokens in database
                      │       └─ Return AuthResponseDto with tokens
                      │
                      └─► OTP enabled → Generate OTP
                          └─ Save OTP to database
                              └─ Send OTP via email
                                  └─ Return AuthResponseDto with otpRequired: true
```

### **OTP Verification Flow**

```
┌─────────────────────┐
│   OTP VERIFICATION  │
│  /auth/otp-verify   │
└─────────┬───────────┘
          │ User enters OTP code
          ▼
┌─────────────────────────────────────┐
│ POST /auth/otp-verify               │
│ {                                   │
│   email: "john@example.com",        │
│   otp: "123456",                    │
│   otpType: "LOGIN"                  │
│ }                                   │
└─────────┬───────────────────┘
          │
          ├─► User not found → Not Found Error
          │
          └─► User found → Find latest OTP
              ├─► OTP not found → Not Found Error
              │
              └─► OTP found → Validate OTP
                  ├─► OTP invalid → Not Found Error
                  │
                  └─► OTP valid → Check expiry
                      ├─► OTP expired → Not Found Error
                      │
                      └─► OTP valid → Mark OTP as used
                          ├─► OTP Type: REGISTER → Activate account
                          │   └─ Generate JWT tokens
                          │       └─ Store tokens in database
                          │           └─ Return AuthResponseDto
                          │
                          └─► OTP Type: LOGIN → Generate JWT tokens
                              └─ Store tokens in database
                                  └─ Return AuthResponseDto
```

### **Forgot Password Flow**

```
┌─────────────────────┐
│  FORGOT PASSWORD    │
│ /auth/forgot-password│
└─────────┬───────────┘
          │ User enters email for password reset
          ▼
┌─────────────────────────────────────┐
│ POST /auth/forgot-password          │
│ {                                   │
│   email: "john@example.com",        │
│   platform: "front"                 │
│ }                                   │
└─────────┬───────────────────┘
          │
          ├─► User not found → Not Found Error
          │
          └─► User found → Check user status
              ├─► User inactive → Account inactive Error
              │
              └─► User active → Generate OTP
                  └─ Save OTP to database
                      └─ Send OTP via email
                          └─ Return success response
```

### **Password Reset Flow**

```
┌─────────────────────┐
│  RESET PASSWORD     │
│ /auth/reset-password│
└─────────┬───────────┘
          │ User enters new password
          ▼
┌─────────────────────────────────────┐
│ POST /auth/reset-password           │
│ {                                   │
│   email: "john@example.com",        │
│   newPassword: "newSecurePassword"  │
│ }                                   │
└─────────┬───────────────────┘
          │
          ├─► User not found → Not Found Error
          │
          └─► User found → Check user status
              ├─► User inactive → Account inactive Error
              │
              └─► User active → Update password
                  └─ Return success response
```

### **Change Password Flow**

```
┌─────────────────────┐
│  CHANGE PASSWORD    │
│ /auth/change-password│
└─────────┬───────────┘
          │ User enters old and new passwords
          ▼
┌─────────────────────────────────────┐
│ PUT /auth/change-password           │
│ {                                   │
│   oldPassword: "oldPassword",       │
│   newPassword: "newSecurePassword"  │
│ }                                   │
└─────────┬───────────────────────────┘
          │
          ├─► Authentication failed → Unauthorized Error
          │
          └─► Authenticated → Validate old password
              ├─► Old password invalid → Not Acceptable Error
              │
              └─► Old password valid → Update password
                  └─ Return success response
```

## 🗺️ **Feature-to-API Mapping**

### **User Registration Feature**
- **API Call:** `POST /auth/register`
- **UI Components:**
  - Registration form with validation
  - First name, last name, email, password fields
  - Date of birth and age inputs
  - Phone number (optional)
  - Loading state indicators
- **State Management:**
  - Registration form data
  - Loading states
  - Error messages
  - Success confirmation
- **Validation:**
  - Email format validation
  - Password strength validation
  - Required field validation
  - Age calculation from date of birth
- **Response Handling:**
  - Show success message
  - Redirect to OTP verification screen
  - Handle duplicate email error

### **User Login Feature**
- **API Call:** `POST /auth/login`
- **UI Components:**
  - Login form with email and password
  - Remember me checkbox
  - Forgot password link
  - Loading state indicators
- **State Management:**
  - Login form data
  - Authentication state
  - Loading states
  - Error messages
- **Validation:**
  - Email format validation
  - Password validation
  - Required field validation
- **Response Handling:**
  - Store JWT tokens in secure storage
  - Redirect to dashboard on success
  - Handle OTP required scenario
  - Show authentication errors

### **OTP Verification Feature**
- **API Call:** `POST /auth/otp-verify`
- **UI Components:**
  - OTP input field (6 digits)
  - Resend OTP button
  - Countdown timer for OTP expiry
  - Back to login link
- **State Management:**
  - OTP input value
  - Timer countdown
  - Loading states
  - Error messages
- **Validation:**
  - 6-digit OTP validation
  - Required field validation
- **Response Handling:**
  - Store JWT tokens on success
  - Redirect to dashboard
  - Handle OTP expiration errors

### **Password Management Features**
- **Forgot Password API:** `POST /auth/forgot-password`
- **Reset Password API:** `POST /auth/reset-password`
- **Change Password API:** `PUT /auth/change-password`
- **UI Components:**
  - Password reset form
  - New password confirmation
  - Password strength indicator
- **State Management:**
  - Password form data
  - Loading states
  - Error messages
- **Validation:**
  - Password strength requirements
  - Password confirmation match
  - Required field validation
- **Response Handling:**
  - Success confirmation
  - Redirect to login on reset
  - Stay on page after change

## ⚡ **API Integration Priority**

### **Phase 1: Core Functionality (Must-Have APIs)**
1. **User Registration** - `POST /auth/register`
   - Essential for user onboarding
   - Requires email verification via OTP
   - Creates user with PENDING_VERIFICATION status

2. **User Login** - `POST /auth/login`
   - Core authentication functionality
   - Supports OTP verification if enabled
   - Generates JWT tokens for session management

3. **OTP Verification** - `POST /auth/otp-verify`
   - Critical for security with OTP-enabled systems
   - Completes registration and login flows
   - Handles both LOGIN and REGISTER OTP types

### **Phase 2: Important Features (Should-Have APIs)**
4. **Forgot Password** - `POST /auth/forgot-password`
   - Enables account recovery
   - Sends OTP for password reset

5. **Reset Password** - `POST /auth/reset-password`
   - Completes password recovery flow
   - Allows users to set new passwords

6. **Get Profile** - `GET /auth/profile`
   - Retrieves current user information
   - Requires JWT authentication

### **Phase 3: Enhanced Features (Nice-to-Have APIs)**
7. **Change Password** - `PUT /auth/change-password`
   - Allows users to update their passwords
   - Requires old password verification

8. **OTP Time Check** - `POST /auth/otp-left-time`
   - Provides remaining time for OTP validity
   - Enhances user experience

9. **Resend OTP** - `POST /auth/resend-otp`
   - Allows users to request new OTP
   - Improves user experience

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
          │   └─ Invalid credentials
          │       └─ Show login error
          │
          ├─► Forbidden (403)
          │   └─ Insufficient permissions
          │       └─ Show permission error
          │
          └─► Unprocessable Entity (42)
              └─ Validation errors
                  └─ Show field-specific errors
```

### **Business Logic Errors**
```
┌─────────────────────┐
│  BUSINESS LOGIC     │
│ ERROR FLOWS        │
└─────────┬───────────┘
          │
          ├─► ERR_EMAIL_NOT_FOUND
          │   └─ Show "Email not found" message
          │
          ├─► ERR_INVALID_CREDENTIALS
          │   └─ Show "Invalid credentials" message
          │
          ├─► ERR_ACCOUNT_INACTIVE
          │   └─ Show "Account inactive" message
          │
          ├─► ERR_EMAIL_EXISTS
          │   └─ Show "Email already exists" message
          │
          ├─► ERR_OTP_NOT_FOUND
          │   └─ Show "OTP not found" message
          │
          ├─► ERR_OTP_INVALID
          │   └─ Show "Invalid OTP" message
          │
          └─► ERR_OTP_EXPIRED
              └─ Show "OTP expired" message
```

### **User-Friendly Error Messaging**
- **Network Errors:** "Connection failed. Please check your internet connection and try again."
- **Server Errors:** "Something went wrong. Please try again later."
- **Validation Errors:** "Please fix the following errors: [specific field errors]"
- **Authentication Errors:** "Invalid email or password. Please try again."
- **OTP Errors:** "Invalid or expired OTP. Please request a new one or try again."

## 🏗️ **Technical Implementation Details**

### **JWT Token Management**
- Access tokens expire after configured time
- Refresh tokens allow token renewal
- Tokens stored securely in frontend
- Automatic logout on token expiration

### **OTP Security**
- 6-digit numeric codes
- Configurable expiry time (default 10 minutes)
- Single-use tokens
- Rate limiting on OTP requests

### **Database Operations**
- All operations use TypeORM repositories
- Tenant-aware isolation
- Audit trails for security events
- Token management for session tracking

### **Security Considerations**
- Passwords hashed using bcrypt
- JWT tokens signed with secure keys
- Rate limiting on authentication endpoints
- Input validation on all fields
- Secure email transport for OTP delivery