# User Stories & Flow Design – Advanced Salon Features

# 1. STAFF MAPPING MODULE

## Objective

Allow salon admin to assign services to specific staff members based on expertise, availability, and branch.

---

# 1.1 User Stories

## Admin User Stories

### Story 1 – Assign Staff to Service

**As an Admin**,
I want to assign one or multiple staff members to a service,
So that only qualified staff can perform that service.

### Acceptance Criteria

* Admin can select service
* Admin can assign multiple staff
* Admin can define skill level:

  * Junior
  * Senior
  * Expert
* Changes save instantly

---

### Story 2 – Filter Services by Staff

**As an Admin**,
I want to see which services are assigned to a specific staff member,
So that I can manage workload and expertise.

### Acceptance Criteria

* Filter by staff name
* View assigned services
* View active/inactive assignments

---

### Story 3 – Prevent Invalid Booking

**As a Customer**,
I should only see staff who can perform selected service,
So that bookings are accurate.

### Acceptance Criteria

* Staff list filtered dynamically
* Unmapped staff hidden
* Inactive staff hidden

---

# 1.2 Staff Mapping Flow

```text
Admin Login
   ↓
Open Service Management
   ↓
Select Service
   ↓
Click "Assign Staff"
   ↓
Choose Staff Members
   ↓
Set Skill Level / Experience
   ↓
Save Mapping
   ↓
Mapping Available in Booking System
```

---

# 1.3 Database Structure

## service_staff_mapping

| Column      | Type      |
| ----------- | --------- |
| id          | bigint    |
| service_id  | bigint    |
| staff_id    | bigint    |
| skill_level | enum      |
| is_active   | boolean   |
| created_at  | timestamp |

---

# 1.4 Analytical Recommendations

## Smart Suggestions

System can recommend staff based on:

* Booking ratings
* Experience
* Completion speed
* Customer preference

---

## Workload Balancing

Auto distribute bookings among staff to avoid overload.

---

# 2. DYNAMIC PRICING MODULE

## Objective

Allow salons to automatically adjust service prices based on conditions like time, day, branch, festival, or demand.

---

# 2.1 User Stories

## Admin User Stories

### Story 1 – Create Dynamic Pricing Rule

**As an Admin**,
I want to create pricing rules for services,
So that prices can automatically change during special timings.

### Acceptance Criteria

* Admin can select service
* Admin can define:

  * Date range
  * Time range
  * Days
  * Price adjustment
* Rules can be activated/deactivated

---

### Story 2 – Weekend Pricing

**As an Admin**,
I want higher pricing during weekends,
So that I can maximize revenue during peak hours.

### Acceptance Criteria

* Weekend rule supported
* Percentage or fixed increase supported

---

### Story 3 – Happy Hour Discount

**As a Customer**,
I want discounted pricing during non-peak hours,
So that I can save money.

### Acceptance Criteria

* Discount auto applied
* Visible in booking summary

---

# 2.2 Dynamic Pricing Flow

```text
Admin Login
   ↓
Open Pricing Rules
   ↓
Create Rule
   ↓
Select Services
   ↓
Set Conditions
   ↓
Define Pricing Logic
   ↓
Activate Rule
   ↓
Customer Booking Checks Rule
   ↓
Final Price Calculated
```

---

# 2.3 Pricing Rule Types

| Rule Type         | Example              |
| ----------------- | -------------------- |
| Weekend Pricing   | +20% Sat/Sun         |
| Happy Hours       | -15% 2PM–5PM         |
| Festival Pricing  | +25% Diwali          |
| Peak Hour Pricing | +10% Evening         |
| Branch Pricing    | Different city rates |
| VIP Pricing       | Loyalty discounts    |

---

# 2.4 Database Structure

## pricing_rules

| Column           | Type    |
| ---------------- | ------- |
| id               | bigint  |
| name             | varchar |
| rule_type        | enum    |
| service_id       | bigint  |
| adjustment_type  | enum    |
| adjustment_value | decimal |
| start_date       | date    |
| end_date         | date    |
| start_time       | time    |
| end_time         | time    |
| is_active        | boolean |

---

# 2.5 Analytical Recommendations

## AI Revenue Optimization

Future enhancement:

* Suggest best pricing times
* Detect peak demand
* Recommend profitable pricing

---

## Rule Priority System

Handle overlapping rules:

1. Festival
2. Weekend
3. Happy Hour

---

# 3. SERVICE PACKAGE MODULE

## Objective

Allow salon admins to create bundled service combinations with discounted or fixed package pricing.

---

# 3.1 User Stories

## Admin User Stories

### Story 1 – Create Service Package

**As an Admin**,
I want to combine multiple services into a package,
So that I can offer combo deals.

### Acceptance Criteria

* Multiple services selectable
* Package name required
* Package pricing configurable

---

### Story 2 – Configure Discount

**As an Admin**,
I want package pricing to be lower than individual service totals,
So that customers are encouraged to buy combos.

### Acceptance Criteria

* Fixed or percentage discount
* Automatic savings calculation

---

### Story 3 – Customer Package Booking

**As a Customer**,
I want to book packages in one click,
So that booking becomes easier.

### Acceptance Criteria

* Package visible in booking app
* Duration auto calculated
* Combined pricing displayed

---

# 3.2 Service Package Flow

```text
Admin Login
   ↓
Open Package Management
   ↓
Create Package
   ↓
Select Multiple Services
   ↓
Define Package Price
   ↓
Upload Package Image
   ↓
Activate Package
   ↓
Customer Views Package
   ↓
Customer Books Package
```

---

# 3.3 Package Pricing Example

| Package      | Included Services      | Original | Package Price |
| ------------ | ---------------------- | -------- | ------------- |
| Groom Combo  | Haircut + Beard        | ₹800     | ₹699          |
| Relax Combo  | Spa + Massage          | ₹2500    | ₹2199         |
| Bridal Combo | Makeup + Facial + Hair | ₹7000    | ₹5999         |

---

# 3.4 Database Structure

## packages

| Column        | Type    |
| ------------- | ------- |
| id            | bigint  |
| name          | varchar |
| description   | text    |
| image         | varchar |
| package_price | decimal |
| duration      | integer |
| is_active     | boolean |

---

## package_services

| Column     | Type   |
| ---------- | ------ |
| id         | bigint |
| package_id | bigint |
| service_id | bigint |

---

# 3.5 Analytical Recommendations

## Smart Package Suggestions

AI can suggest:

* Frequently booked combinations
* Seasonal packages
* Gender-specific packages

---

## Revenue Insights

Track:

* Most sold package
* Conversion rate
* Average package value
* Package profitability

---

# 4. CROSS-MODULE FLOW

```text
Service Created
   ↓
Assign Staff
   ↓
Apply Pricing Rules
   ↓
Add Into Package
   ↓
Publish To Booking App
   ↓
Customer Booking
   ↓
Staff Allocation
   ↓
Dynamic Price Applied
   ↓
Booking Confirmed
```

---

# 5. FUTURE ENHANCEMENTS

## Recommended Advanced Features

* AI-based staff recommendations
* Dynamic surge pricing
* Subscription packages
* Loyalty-based package unlocks
* Auto-package generation
* Calendar-based pricing heatmap
* Multi-branch package pricing
* Staff commission automation
