
---

## 🌐 Frontend Pages & Features

### 1. **Home Page** (`/`)
**Location**: `app/(public)/page.tsx`

**Features**:
- **Hero Section**: Animated hero with "Chill Thrive" branding and tagline
- **Services Preview**: Displays 3 randomly selected active services with:
  - Service images
  - Titles and descriptions
  - Links to full services page
- **Why Chill Thrive Section**: Horizontal scrolling card animation showcasing:
  - Science-backed recovery protocols
  - Trained professionals
  - Hygienic & premium setup
  - Community-driven wellness
- **Testimonials Preview**: Shows 3 latest visible testimonials (text or video)
- **Call-to-Action**: Encourages user engagement
- **GSAP Animations**: Scroll-triggered animations and pinning effects

### 2. **Services Page** (`/services`)
**Location**: `app/(public)/services/page.tsx`

**Features**:
- **Service Catalog**: Displays all active services with:
  - Service images/videos with play button overlay
  - Service titles and descriptions
  - Duration options (multiple pricing tiers)
  - Dynamic pricing based on selected duration
  - Benefits list
  - "Combo" badge for combo services
- **Video Support**: YouTube/Vimeo video embedding with popup modal
- **Duration Selection**: Interactive buttons to select service duration
- **Pricing Display**: Shows price corresponding to selected duration
- **Book Now Button**: Redirects to booking page with pre-selected service and duration

### 3. **Booking Page** (`/booking`)
**Location**: `app/(public)/booking/page.tsx` & `BookingClient.tsx`

**Features**:
- **3-Step Booking Process**:
  
  **Step 1: Service Selection**
  - Lists all active services
  - Duration selector for each service
  - Price display
  - Service selection with duration and price
  
  **Step 2: Date & Time Selection**
  - Interactive calendar with:
    - Past date blocking
    - Blocked dates from admin
    - Available slot display
  - Time slot selection showing:
    - Available slots with capacity
    - Fully booked indicators
    - Remaining spots count
  
  **Step 3: Customer Details & Payment**
  - Customer information form:
    - Name, Phone (10-digit validation), Email
    - Payment method selection (QR/Online or Cash/Venue)
  - Booking summary sidebar:
    - Service details
    - Date and time
    - Base amount
    - Coupon code application
    - Discount calculation
    - Final payable amount
  - **Payment Integration**:
    - Razorpay integration for online payments
    - Automatic confirmation for QR payments
    - Pending status for cash payments
  - **Coupon System**:
    - Manual coupon code entry
    - Auto-apply coupons from URL parameters
    - Discount calculation and application
- **Progress Bar**: Visual indicator of booking progress
- **Confirmation Screen**: Success message with booking details and email confirmation

### 4. **Events/Gallery Page** (`/events`)
**Location**: `app/(public)/events/page.tsx`

**Features**:
- **Event Categories**:
  - Ice Bath Sessions
  - Community Events
  - Workshops
  - Behind the Scenes
  - General
- **Event Grid**: Displays events by category with:
  - Cover images
  - Event titles and descriptions
  - Hover effects
  - Click to view full gallery
- **Event Detail Page** (`/events/[id]`):
  - Full event gallery with multiple images
  - Event description
  - Image grid layout

### 5. **Testimonials Page** (`/testimonials`)
**Location**: `app/(public)/testimonials/page.tsx`

**Features**:
- **Video Testimonials Section**:
  - Embedded YouTube/Vimeo videos
  - Video thumbnail support
  - External video link fallback
  - Member name and rating display
  - Verified member badge
- **Text Testimonials Section**:
  - Masonry/column layout
  - Member profile images
  - Star ratings
  - Feedback text
  - Hover effects
- **Video URL Parsing**: Supports multiple YouTube/Vimeo URL formats

### 6. **About/Founder Page** (`/about`)
**Location**: `app/(public)/about/page.tsx`

**Features**:
- **Founder Profile**:
  - Founder photo
  - Name and title
  - Mission and values cards
  - Journey story
  - Vision and purpose
  - Inspirational quote
- **Content Management**: All content managed through admin panel

### 7. **Awareness Page** (`/awareness`)
**Location**: `app/(public)/awareness/page.tsx`

**Features**:
- **Educational Content Sections**:
  - Multiple awareness sections with:
    - Section images
    - Titles and descriptions
    - Core principles/benefits list
  - GSAP scroll animations:
    - Horizontal scrolling benefits cards
    - Fade-in animations
    - Pin animations
- **Scientific Disclaimer**: Medical and safety disclaimer footer
- **Call-to-Action**: Encourages booking

### 8. **Contact Page** (`/contact`)
**Location**: `app/(public)/contact/page.tsx`

**Features**:
- **Contact Form**:
  - Name, Phone (10-digit validation), Message fields
  - Form validation
  - Submission to Supabase `inquiries` table
  - Success/error handling
- **Studio Information**:
  - Phone number
  - Email address
  - Physical address
  - Google Maps embed
- **Visual Design**: Clean, modern layout with icons

---

## 🔐 Admin Panel Pages & Features

### Authentication
**Location**: `app/admin/(auth)/login/page.tsx` & `register/page.tsx`

**Features**:
- Admin login and registration
- Supabase authentication
- Protected route middleware

### 1. **Admin Dashboard** (`/admin/dashboard`)
**Location**: `app/admin/(panel)/dashboard/page.tsx`

**Features**:
- **Key Metrics Cards**:
  - Confirmed Revenue (total)
  - Today's Confirmed Bookings
  - Pending Approval count
- **Recent Reservations Feed**:
  - Latest 5 bookings
  - Customer details
  - Service and date info
  - Status indicators
- **Action Center**:
  - Quick links to:
    - New Service creation
    - Schedule management
    - Gallery upload
- **Efficiency Metric**: Confirmation rate percentage
- **Logout Functionality**: Secure admin logout

### 2. **Services Management** (`/admin/services`)
**Location**: `app/admin/(panel)/services/page.tsx`

**Features**:
- **Service CRUD Operations**:
  - Create new services
  - Edit existing services
  - Delete services
  - Toggle active/inactive status
- **Service Configuration**:
  - Title and slug (auto-generated)
  - Description
  - Service type (Single/Combo)
  - **Dynamic Pricing Tiers**:
    - Multiple duration options
    - Price per duration
    - Add/remove pricing tiers
  - Benefits list (add/remove)
  - Media upload (image/video)
  - YouTube URL support
  - Sort order management
- **Service Grid View**: Visual cards showing all services with status indicators

### 3. **Bookings Management** (`/admin/booking`)
**Location**: `app/admin/(panel)/booking/page.tsx`

**Features**:
- **Booking List View**:
  - All bookings in table format
  - Customer information (name, email, phone)
  - Service details
  - Booking date and time slot
  - Payment method and amount
  - Status management
- **Status Management**:
  - Dropdown to change booking status:
    - Pending
    - Confirmed
    - Cancelled
  - Real-time status updates
- **View Toggle**:
  - Active bookings (pending + confirmed)
  - Cancelled bookings
- **Search Functionality**: Search by customer name or phone
- **Statistics**:
  - Confirmed requests count
  - Pending requests count
  - Cancelled count
- **Delete Functionality**: Permanent deletion of booking records

### 4. **Content Management** (`/admin/content`)
**Location**: `app/admin/(panel)/content/page.tsx`

**Features**:
- **Tabbed Interface** with 4 sections:

  **A. Awareness Content**
  - Manage awareness page sections
  - Upload section images
  - Edit titles and descriptions
  - Add/remove benefits/points
  - Auto-save images, manual save for text

  **B. Testimonials Management**
  - Create/edit testimonials
  - Two types:
    - Text testimonials (with feedback text)
    - Video testimonials (with video URL)
  - Features:
    - Client name and rating (1-5 stars)
    - Thumbnail image upload
    - Video URL (YouTube/Vimeo)
    - Source URL (credibility link)
    - Visibility toggle
    - Delete functionality

  **C. Gallery/Events Management**
  - Create/edit gallery events
  - Event categories:
    - Ice Bath Sessions
    - Community Events
    - Workshops
  - Bulk image upload
  - Image management (delete individual images)
  - Event title and description

  **D. Founder Profile**
  - Edit founder information:
    - Photo upload
    - Full name
    - Mission statement
    - Values
    - Journey story
    - Vision and purpose
    - Inspirational quote

### 5. **Analytics Page** (`/admin/analytics`)
**Location**: `app/admin/(panel)/analytics/page.tsx`

**Features**:
- Revenue analytics and reporting
- Booking trends visualization
- Performance metrics

### 6. **Schedule Management** (`/admin/schedule`)
**Location**: `app/admin/(panel)/schedule/page.tsx`

**Features**:
- Time slot management
- Blocked dates configuration
- Availability management

### 7. **Promos Management** (`/admin/promos`)
**Location**: `app/admin/(panel)/promos/page.tsx`

**Features**:
- Coupon code creation and management
- Discount configuration
- Auto-apply coupon settings
- Validity period management

### 8. **Query/Inquiries** (`/admin/query`)
**Location**: `app/admin/(panel)/query/page.tsx`

**Features**:
- View contact form submissions
- Customer inquiries management
- Response tracking

---

## 🔌 Backend API Routes

### 1. **Booking API** (`/api/booking`)
**Location**: `app/api/booking/route.ts`

**Method**: POST

**Functionality**:
- Creates new booking record in database
- Validates required fields
- Handles payment method logic:
  - QR payments: Auto-confirms booking
  - Cash payments: Sets status to pending
- Stores payment details in `payments` table (for QR payments)
- Sends confirmation email via Nodemailer
- Returns booking ID on success

**Request Body**:t
{
  service: { id, title },
  date: string,
  slotId: string,
  duration: number,
  couponCode?: string,
  discountAmount?: number,
  finalAmount: number,
  form: { name, phone, email, payment },
  paymentDetails?: { razorpay_payment_id, ... }
}
