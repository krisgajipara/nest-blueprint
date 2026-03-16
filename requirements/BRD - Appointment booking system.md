# User Feature list

# **Business Requirements Document (BRD)**

## **Appointment Booking System for Saloon**

---

## **1\. Document Purpose**

The purpose of this Business Requirements Document (BRD) is to define the functional and non-functional requirements for an **online appointment booking system for saloons**. The system is intended to allow customers to discover nearby saloons, view services, select available time slots, and book appointments digitally.

This document focuses on the **User (Customer) Application**. Requirements related to the **Partner Application** and **Admin Panel** will be documented separately in later phases.

---

## **2\. Business Overview**

### **2.1 Product Vision**

The proposed system is a **market-ready appointment booking platform** owned and managed by the product owner. The platform can be sold or licensed to multiple saloons, saloon, Hospitals and many more.. enabling them to manage online appointments while providing customers with a seamless booking experience.

### **2.2 Problem Statement**

Currently, many saloons rely on:

* Walk-in customers

* Manual appointment booking

* Phone-based confirmations  
  

This leads to:

Long waiting times

* Poor customer experience

* Inefficient time management for saloon staff

Customers are required to physically visit saloons and wait until their turn, resulting in inconvenience and time loss.

### **2.3 Proposed Solution**

The system will provide:

* Online saloon discovery based on user location

* Real-time availability of appointment slots

* Digital booking and payment

* Instant confirmations and notifications

This eliminates unnecessary waiting, improves operational efficiency, and enhances customer satisfaction.

---

## **3\. Scope of the System**

### **3.1 In Scope**

* Mobile application for users (Android/iOS)

* User registration and authentication

* Location-based saloon discovery

* saloon profile viewing

* Service selection and pricing

* Appointment booking and online payment

* Notifications to users and saloons  
    
* Appointments history

### **3.2 Out of Scope (Current Phase)**

* saloon partner application features

* Admin panel features

* Advanced analytics and reporting

* Loyalty programs and offers

---

## **4\. Stakeholders**

| Stakeholder | Description |
| :---- | ----- |
| Product Owner | Owner and manager of the appointment booking platform |
| End Users | Customers booking saloon appointments |
| saloons | Service providers offering saloon services |
| Payment Gateway | Third-party payment processing service |
| Development Team | Responsible for system development |

---

## **5\. User Application – Functional Requirements**

### **5.1 App Launch & Permissions**

**Description:**  
 When the user opens the application for the first time, the app shall request necessary permissions to ensure smooth operation.

**Permissions Required:**

* Location access (for nearby saloon discovery)

* Notification access (for booking updates and reminders)

**Business Justification:**  
 Location access enables personalized saloon recommendations, while notifications improve communication and engagement.

---

### **5.2 User Registration & Authentication**

**Description:**  
 Users shall be able to sign up and log in using their mobile number.

**Functional Flow:**

1. User enters mobile number

2. System sends OTP (One-Time Password)

3. User verifies OTP

4. Successful authentication grants access to the app

**Business Justification:**  
 Mobile-based OTP login ensures:

* Faster onboarding

* Higher security

* No password management complexity

---

### **5.3 Home Page & saloon Discovery**

**Description:**  
 After successful login, users shall be redirected to the Home Page displaying nearby saloons.

**Key Features:**

* List of saloons within a **3 km radius ( can be vary )**

* Each saloon card shall display:

  * saloon name

  * saloon image

  * Short description

  * Distance from current location

* Real-time location-based sorting

**Suggested Categories (Filters):**

* Hair cut

* Hair color

* Beard

* Hair spa

* Massage Therapy


**Business Justification:**  
 Categorization and proximity-based listing help users make faster and more relevant decisions.

---

### **5.4 saloon Detail Page**

**Description:**  
 When a user selects a saloon center, the system shall redirect to a detailed saloon profile page.

**Details Displayed:**

* saloon name and images

* Full description

* Address and distance

* Operating hours

* Available services

* Available time slots

---

### **5.5 Appointment Booking Flow**

**Description:**  
 Users shall be able to book an appointment by selecting preferred services and time slots.

**Booking Steps:**

1. Select available date and time slot

2. Select one or more saloon services

3. System calculates total price dynamically

4. User reviews price breakdown on confirmation page

5. User proceeds to payment

**Price Bifurcation Includes:**

* Service charges

* Taxes (if applicable)

* Platform convenience fee (optional future enhancement)

---

### 

### **5.6 Payment & Confirmation**

**Description:**  
 Users shall be able to complete payments through an integrated online payment gateway.

**Post-Payment Actions:**

* Display “Thank You” confirmation page

* Generate booking reference number

* Send confirmation notification to user

* Send appointment notification to saloon center

**Business Justification:**  
 Digital payments and instant confirmation reduce cancellations and increase trust.

---

## **6\. Non-Functional Requirements**

### **6.1 Performance**

* App should load saloon listings within 3 seconds

* Booking confirmation should be generated instantly

### **6.2 Security**

* OTP-based authentication

* Secure payment processing

* Encrypted user data

### **6.3 Scalability**

* System should support multiple saloons across cities

* Architecture should allow future expansion

### **6.4 Usability**

* Simple and intuitive UI

* Minimal steps for booking

* Mobile-friendly design

---

## **7\. Assumptions & Constraints**

### **Assumptions**

* Users have internet access

* saloons will update availability regularly

* Payment gateway services are reliable

### **Constraints**

* Initial version limited to selected geographic areas

* Features limited to user-side application in Phase 1

# Saloon Owner Feature List

# **Business Requirements Document (BRD)**

## **Partner Application for Saloon Appointment Booking System**

---

## **1\. Document Purpose**

The purpose of this Business Requirements Document (BRD) is to define the functional and non-functional requirements for the **Partner (Saloon Owner) Application** of the appointment booking system.

This document focuses on the **Partner Application**, which enables verified saloon owners to manage their saloon profiles, services, staff, appointments, availability, notifications, and business performance digitally.

---

## **2\. Business Overview**

### **2.1 Product Vision**

The Partner Application is a core component of the appointment booking platform owned and managed by the product owner. The app enables saloons to digitally manage their daily operations and connect seamlessly with customers through the user application.

The platform can be licensed to:

* saloons

* Clinics

* Hospitals

* Other appointment-based service providers

allowing them to manage bookings, staff, and availability efficiently.

---

### **2.2 Problem Statement**

Currently, most saloons manage their operations using:

* Manual appointment registers

* Phone calls

* Walk-in-based scheduling

This leads to:

* Overbooking or missed appointments

* Poor visibility of staff availability

* Inefficient communication with customers

* Revenue loss due to cancellations and idle time

Saloon owners lack a centralized digital system to manage appointments and staff in real time.

---

### **2.3 Proposed Solution**

The Partner Application will provide:

* Verified saloon onboarding and approval

* Real-time appointment management

* Staff and service management

* Live availability updates synced with the user app

* Notifications and customer communication

* Business performance insights

This improves operational efficiency, customer satisfaction, and revenue management.

---

## **3\. Scope of the System**

### **3.1 In Scope**

* Partner mobile application (Android / iOS)

* Verified saloon owner registration and login

* saloon profile management

* Staff and role management

* Service and category management

* Appointment management

* Saloon and Staff Availability management

* Notifications to customers

* Dashboard and reports

* Earnings and booking statistics

---

### **3.2 Out of Scope (Current Phase)**

* Admin panel features

* Loyalty programs

* Advanced financial accounting

* Third-party POS integrations

* Marketing automation tools


---

## **4\. Stakeholders**

| Stakeholder | Description |
| :---- | ----- |
| Product Owner | Owner and manager of the platform |
| saloon Owners (Partners) | Service providers using the partner app |
| End Users | Customers booking appointments |
| Admin Team | Verifies and approves partner onboarding |
| Development Team | Responsible for system development |

---

## **5\. Partner Application – Functional Requirements**

---

### **5.1 Partner Registration & Verification**

**Description:**  
 Only verified saloon owners shall be allowed to access the Partner Application.

**Registration Flow:**

* Partner fills sign-up form

* Uploads mandatory documents

* Submits request for approval

* Admin/Product Owner verifies details

* Account activated after approval

**Details to be Collected:**

* saloon Name

* Owner Name

* Mobile Number

* Email Address

* Full Address

* City & State

* Operating Hours

* Bank Account Details  
* Will add other required fields as well

**Mandatory Documents:**

* saloon Registration Certificate

* Owner Government ID (Aadhar / PAN / Passport)

* GST Certificate (if applicable)

* saloon Images (Inside & Outside)

* Cancelled Cheque / Bank Proof

**Business Justification:**  
 Verification ensures trust, platform quality, and prevents fraud.

---

### **5.2 Partner Login & Authentication**

**Description:**  
 Verified partners shall be able to log in securely.

**Features:**

* Login using username/email and password

* Forgot password using OTP

* Change password after login

**Business Justification:**  
 Secure authentication protects business and customer data.

---

### **5.3 Home Page & Dashboard**

**Description:**  
 After successful login, partners shall be redirected to the Home Page dashboard.

**Dashboard Components:**

* Today’s Appointments list

* Upcoming appointments

* Available staff count

* Absent staff count

* saloon availability status (Open / Busy / Closed)

* Quick earnings snapshot

**Business Justification:**  
 Provides quick operational visibility and control.

---

### **5.4 Staff Management**

**Description:**  
 Partners shall be able to manage their staff digitally.

**Features:**

* Add staff member

* Assign role (Manager, Stylist, Receptionist)

* Assign services to staff

* Availability ( slots ) management- Mark availability (Available / Absent / On Leave)

* Edit or remove staff


**Business Justification:**  
 Efficient staff allocation improves service quality and scheduling.

---

### **5.5 Service & Category Management**

**Description:**  
 Partners shall manage the services offered by their saloon.

**Features:**

* Create service categories (Haircut, Spa, Beard, etc.)

* Add services with price and duration

* Enable or disable services

* Assign staff to services

**Business Justification:**  
 Accurate service listings ensure correct booking and pricing.

---

### **5.6 Appointment Management**

**Description:**  
 Partners shall be able to view and manage all bookings.

**Features:**

* View today, upcoming, completed, and cancelled appointments

* Appointment detail view includes:

  * Customer details

  * Selected services

  * Charges

  * Time & staff assigned

* Accept, reject, or reschedule bookings

* Add internal notes

**Business Justification:**  
 Centralized appointment control prevents conflicts and delays.

---

### **5.7 Notifications & Customer Communication**

**Description:**  
 Partners shall communicate with customers through notifications. Chat / call ( Future )

**Notification Types:**

* Early arrival request

* Delay notification

* Appointment reminder \- Automated & Manuall

* Cancellation or reschedule update

**Business Justification:**  
 Improves customer experience and reduces no-shows.

---

### **5.8 Reports & Statistics Dashboard**

**Description:**  
 Partners shall view business performance insights.

**Dashboard Metrics:**

* Total bookings (Daily / Weekly / Monthly)

* Earnings summary

* Staff-wise performance

* Peak booking hours

**Business Justification:**  
 Data-driven insights help partners optimize operations and revenue.

---

## **6\. Non-Functional Requirements**

### **6.1 Performance**

* Dashboard should load within 3 seconds

* Appointment updates should reflect in real time

### **6.2 Security**

* Encrypted passwords

* Secure APIs

* Restricted access for verified partners only

### **6.3 Scalability**

* Support multiple saloons across cities

* Handle high booking volumes

### **6.4 Usability**

* Simple and intuitive UI

* Minimal learning curve for saloon owners

* Mobile-friendly design

---

## **7\. Assumptions & Constraints**

### **Assumptions**

* Partners have internet access

* saloon owners update staff availability accurately

* Admin verification is timely

### **Constraints**

* Only verified partners can use the app

* Limited features in Phase 1

* Geographic rollout may be phased

