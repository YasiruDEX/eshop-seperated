# Seller UI

A modern, fully-featured seller registration and management interface for the Eshop platform.

## 🚀 Features

### Authentication & Registration

- **Multi-step seller registration**:
  1. Create Account (Name, Email, Phone, Country, Password)
  2. OTP Verification
  3. Setup Shop (Name, Bio, Address, Opening Hours, Website, Category)
  4. Connect Stripe for payments
- **Login System**:

  - Email/Password authentication
  - Remember me functionality
  - Secure cookie-based sessions

- **Password Recovery**:
  - Forgot password with OTP verification
  - Secure password reset flow

### Dashboard

- Empty dashboard ready for expansion
- Protected route with authentication check
- Auto-redirect if not logged in

### UI Components

- **Input**: Text, email, tel, password with show/hide toggle
- **Button**: Primary, secondary, outline variants with loading states
- **Select**: Dropdown with country and category options
- **OTPInput**: 4-digit OTP input with auto-focus and paste support
- **ProgressStepper**: Multi-step progress indicator

## 📁 Project Structure

```
apps/seller-ui/src/
├── app/
│   ├── register/          # Multi-step registration flow
│   ├── login/             # Seller login page
│   ├── forgot-password/   # Password recovery flow
│   ├── dashboard/         # Seller dashboard (protected)
│   ├── stripe-success/    # Stripe connection success page
│   ├── page.tsx           # Home (redirects to register)
│   ├── layout.tsx         # Root layout
│   └── global.css         # Global styles
│
└── shared/
    ├── components/        # Reusable UI components
    │   ├── Input.tsx
    │   ├── Button.tsx
    │   ├── Select.tsx
    │   ├── OTPInput.tsx
    │   ├── ProgressStepper.tsx
    │   └── index.ts
    │
    ├── utils/             # Utility functions
    │   ├── api.ts         # API integration
    │   └── constants.ts   # Countries & categories
    │
    └── routes/            # Route protection
        └── ProtectedRoute.tsx
```

## 🔌 API Integration

All API calls are handled through the API utility (`shared/utils/api.ts`) and connect to the API Gateway.

### Endpoints Used

#### Seller Authentication

- `POST /seller-registration` - Register new seller
- `POST /verify-seller` - Verify OTP and create seller account
- `POST /login-seller` - Seller login
- `GET /logged-in-seller` - Get logged-in seller info (protected)

#### Shop Management

- `POST /create-shop` - Create seller's shop
- `POST /create-stripe-link` - Generate Stripe connection URL

#### Password Management

- `POST /forgot-password-user` - Request password reset OTP
- `POST /verify-forgot-password-user` - Verify OTP
- `POST /reset-password-user` - Reset password

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Lucide React** for icons
- **Next.js 15** with App Router
- **React 19** for latest features

## 🔧 Setup

1. **Install dependencies** (if not already installed):

   ```bash
   npm install axios lucide-react
   ```

2. **Configure environment** (.env.local):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

3. **Run the seller UI**:

   ```bash
   npm run seller-ui
   # or
   cd apps/seller-ui && npx next dev
   ```

4. **Access the app**:
   - Development: http://localhost:3000

## 🛡️ Protected Routes

The dashboard and other seller-only pages use the `ProtectedRoute` component which:

- Checks if seller is authenticated via `/logged-in-seller` endpoint
- Redirects to `/login` if not authenticated
- Shows loading spinner during auth check

## 📋 Registration Flow

### Step 1: Create Account

- Seller enters: Name, Email, Phone, Country, Password
- OTP is sent to email
- 32-second resend timer

### Step 2: OTP Verification

- Enter 4-digit OTP
- Auto-submit when all digits entered
- Paste support for convenience
- Resend OTP option

### Step 3: Setup Shop

- Shop details: Name, Bio, Address, Opening Hours, Website, Category
- 25+ business categories available
- Bio has 100-word limit

### Step 4: Connect Bank

- Connect Stripe account for payments
- Skip option available
- Redirects to Stripe for account setup
- Success page after Stripe connection

## 🔐 Security Features

- Password fields with show/hide toggle
- Secure cookie-based authentication
- CORS with credentials
- OTP rate limiting (handled by backend)
- Protected routes with auto-redirect

## 🎯 Next Steps

The seller UI is ready for:

- Product management
- Order processing
- Analytics dashboard
- Shop settings
- Profile management

## 📝 Notes

- All forms have proper validation
- Error messages are displayed prominently
- Loading states on all async operations
- Responsive design for mobile/desktop
- TypeScript for type safety

## 🔗 Related

- **User UI**: `/apps/user-ui` - Customer-facing interface
- **API Gateway**: Port 8080 - Routes all requests
- **Auth Service**: Port 6001 - Handles authentication
- **Backend**: Uses Prisma with MongoDB

---

**Built with ❤️ for Eshop sellers**
