# Product Owner Portal

## Tenant Management
 - List of Tenant
 - Add / Edit / active-de active tenant.
 - Re-Send Tenant Admin credential.
 - Demographics

 - Tenants: 
    - Name
    - Sub-domain
    - Primary color
    - Logo in SVG/PNG/ICO (optional)
    - Address fields.
    - Tenant Admin email & default creds

# Tenant Admin Portal

## Role Based Access Management
- Add / Edit / Delete
- Default 3 roles
    1. Super Admin
    2. Sub Admin
    3. Staff (stylist)
    
## User Management
- List
- Add / Update / Active - De active 
- Details  
- Role (Stylist / Staff / Sub Admin / Super Admin)

- User
    - name
    - email
    - phone no
    - whatsapp no. 
    - profile picture

## Service List
- Category management (Parent Child )
- Master Salon Category List
- Master Salon Service List
    - Enable / disable available service as per the tenant (salon)
    - Configure base price.
    - Required Compellation Time.
    - Stylist Selection ( Depends on User management )
    - Images
    - Description (HTML Based)

## System Setting
- Salon Opening timings (per days).
- Day off (official leaves).
- Dynamic day off ( Maintenance activity ).
- Slot timings (default 10 minutes).
- Enable Override - Allow admin/stylist to override any slot not for customer. (default true) - enableConflictValidation
- bufferBeforeMinutes: number;
- bufferAfterMinutes: number;
- maxAdvanceBookingDays
- minimumNoticeMinutes
- allowOutsideWorkingHours 

## Booking Management 
- List of Booking
- Booking Calender 
    - Day / Week + Resource View
    - Day / week/ month  + Stylist self view 
- Add Booking for customer (existing / new)
    - Slot selection (suggest next busy slot, to reduce business loss).
    - Phone No. 
    - Service selection
    - Stylist Selection (optional)

### Problem Statements - Saloon 
 - Time Management
 - Over customer crowd 
 - Onsite customer waiting arrangement if over crowded
 - Manual customer calling for their service turn
 - Lack of booking forecasting/ revenue in upcoming days
 - forecasting of stylist leave request, on which day they can plan for leave
 - Manual customer reminder via phone call during ongoing services
 - how to manage rescheduling of upcoming bookings
 - manual rescheduling via phone call or message.


### Problem statement - Customer
 - Time management (Lack of day plan due to not having confirmed time slot with saloon )
 - Onsite long waiting
 - Need to go through number of steps to book slots, each time need to select services/stylist (Quick booking via recent booking)
 - Book for someone.
 - Booing cancellation flow for customer.
 - Rescheduling of booking.