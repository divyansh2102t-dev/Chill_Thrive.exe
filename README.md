# Chill Thrive - Recovery & Wellness Platform

A comprehensive Next.js application for Chill Thrive, a recovery and wellness center offering ice bath sessions, cold therapy, and community-driven wellness programs. This platform includes both a public-facing client frontend and an administrative panel for managing services, bookings, content, and operations.

## 🚀 Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Gateway**: Razorpay
- **Email Service**: Nodemailer (Gmail)
- **Animation**: GSAP (GreenSock Animation Platform)
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts

## 📁 Project Structure

```
├── app/
│   ├── (public)/          # Public-facing pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # Backend API routes
│   └── actions/           # Server actions
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client/server setup
│   ├── types/            # TypeScript type definitions
│   └── admin/            # Admin utilities
└── public/               # Static assets
```

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

**Request Body**:
```typescript
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
```

### 2. **Slots API** (`/api/slots`)
**Location**: `app/api/slots/route.tsx`

**Method**: GET

**Functionality**:
- Fetches available time slots for a given date
- Uses Supabase RPC function `get_available_slots`
- Checks blocked dates
- Calculates remaining capacity per slot
- Returns empty array if date is blocked

**Query Parameters**:
- `date`: ISO date string (YYYY-MM-DD)

**Response**:
```typescript
{
  slots: Array<{
    slot_id: string,
    start_time: string,
    end_time: string,
    remaining_capacity: number
  }>
}
```

### 3. **Coupon API** (`/api/coupon`)
**Location**: `app/api/coupon/route.ts`

**Method**: POST

**Functionality**:
- Validates coupon codes
- Checks coupon active status
- Returns discount amount if valid
- Returns validation result

**Request Body**:
```typescript
{
  code: string,
  serviceId?: string,
  duration?: number
}
```

**Response**:
```typescript
{
  valid: boolean,
  discountAmount?: number
}
```

### 4. **Admin Authentication APIs**
**Location**: `app/api/admin/login/route.ts` & `register/route.ts`

**Functionality**:
- Admin user authentication
- Registration with admin privileges
- Session management

### 5. **Admin Dashboard API** (`/api/admin/dashboard`)
**Location**: `app/api/admin/dashboard/route.ts`

**Functionality**:
- Aggregates dashboard metrics
- Booking statistics
- Revenue calculations

### 6. **Booking Verification API** (`/api/booking/verify`)
**Location**: `app/api/booking/verify/route.ts`

**Functionality**:
- Verifies booking status
- Payment verification

---

## 🔗 Frontend-Backend Connection

### Architecture Overview

The application uses a **hybrid architecture** combining:
1. **Client-side Supabase queries** (direct database access)
2. **Next.js API routes** (server-side processing)
3. **Server actions** (form handling)

### Connection Patterns

#### 1. **Direct Supabase Client Connection**
**Used in**: Most frontend pages for data fetching

**Example**: Services page, Testimonials page
```typescript
// Client-side direct query
const { data } = await supabase
  .from("services")
  .select("*")
  .eq("is_active", true);
```

**Advantages**:
- Real-time updates
- Fast data fetching
- Automatic caching
- Row-level security support

**Used For**:
- Reading public data (services, testimonials, events)
- Admin panel data fetching
- Real-time updates

#### 2. **API Route Pattern**
**Used in**: Booking flow, payment processing, coupon validation

**Example**: Booking submission
```typescript
// Frontend calls API route
const res = await fetch("/api/booking", {
  method: "POST",
  body: JSON.stringify(bookingData)
});
```

**Advantages**:
- Server-side validation
- Secure payment processing
- Email sending
- Complex business logic

**Used For**:
- Creating bookings
- Payment processing
- Coupon validation
- Email notifications

#### 3. **Server Actions Pattern**
**Used in**: Form submissions, authentication

**Example**: Admin logout
```typescript
// Server action
export async function logoutAction() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

**Used For**:
- Authentication flows
- Form submissions
- Server-side mutations

### Data Flow Examples

#### **Booking Flow**:
```
1. User selects service (Frontend → Supabase: Fetch services)
2. User selects date/time (Frontend → API: /api/slots?date=...)
3. User applies coupon (Frontend → API: /api/coupon)
4. User submits booking (Frontend → API: /api/booking)
   ↓
5. API creates booking in Supabase
6. API processes payment (if QR)
7. API sends confirmation email
8. API returns booking ID
```

#### **Admin Services Management**:
```
1. Admin views services (Frontend → Supabase: Direct query)
2. Admin edits service (Frontend → Supabase: Direct update)
3. Admin uploads media (Frontend → Supabase Storage: Direct upload)
4. Changes reflect immediately (Supabase real-time)
```

#### **Content Management**:
```
1. Admin edits content (Frontend → Supabase: Direct upsert)
2. Content saved to database
3. Public pages fetch updated content (Frontend → Supabase: Direct query)
4. Real-time content updates
```

### Authentication Flow

#### **Public Pages**:
- No authentication required
- Direct Supabase queries with anonymous key
- Row-level security policies control access

#### **Admin Pages**:
- Protected by middleware (`src/middleware.ts`)
- Server-side authentication check
- Redirects to `/admin/login` if not authenticated
- Uses Supabase server client for secure operations

### Environment Variables

**Required Environment Variables**:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Nodemailer)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

### Database Schema (Key Tables)

- `services`: Service catalog with pricing tiers
- `bookings`: Customer bookings with status tracking
- `slot_timings`: Available time slots
- `blocked_dates`: Dates when booking is unavailable
- `coupons`: Discount codes and promotions
- `testimonials`: Customer reviews (text/video)
- `gallery_events`: Event galleries
- `gallery_images`: Event images
- `awareness`: Educational content sections
- `founder_content`: Founder profile information
- `inquiries`: Contact form submissions
- `payments`: Payment transaction records
- `admins`: Admin user accounts

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/pnpm/yarn
- Supabase account and project
- Razorpay account (for payments)
- Gmail account with App Password (for emails)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dumped-chill-flex.exe-main
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

4. **Run database migrations**
Set up your Supabase database using the migration files in `supabase/migrations/`

5. **Start development server**
```bash
npm run dev
# or
pnpm dev
```

6. **Access the application**
- Frontend: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin/login`

---

## 📝 Key Features Summary

### Frontend Features
✅ Responsive design (mobile-first)
✅ GSAP scroll animations
✅ Service catalog with dynamic pricing
✅ Multi-step booking flow
✅ Payment integration (Razorpay)
✅ Coupon/discount system
✅ Video testimonial support
✅ Event gallery management
✅ Educational awareness content
✅ Contact form with validation

### Admin Features
✅ Comprehensive dashboard with metrics
✅ Service CRUD operations
✅ Booking management and status updates
✅ Content management (testimonials, gallery, founder, awareness)
✅ Schedule and slot management
✅ Coupon/promo management
✅ Analytics and reporting
✅ Media upload and management

### Backend Features
✅ Supabase database integration
✅ Real-time data updates
✅ Secure authentication
✅ Payment processing
✅ Email notifications
✅ API route handlers
✅ Server-side validation

---

## 🛠️ Development

### Project Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Tech Stack Details
- **Next.js App Router**: File-based routing with server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Supabase**: Backend-as-a-Service (Database, Auth, Storage)
- **GSAP**: Advanced animations and scroll effects
- **Razorpay**: Payment gateway integration
- **Nodemailer**: Email service

---

## 📄 License

Private project - All rights reserved

---

## 👥 Support

For questions or issues, contact: chillthrivegwoc@gmail.com
