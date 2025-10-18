# Eshop Authentication Frontend

## Overview

This is the frontend implementation for the Eshop authentication system, built with Next.js 15, TypeScript, and Tailwind CSS.

## Implemented Features

### 1. User Registration (Sign Up)

- **Two-step registration process:**
  1. User enters name, email, and password
  2. OTP verification sent to email
  3. Complete registration after OTP verification
- **Features:**
  - Email validation
  - Password strength validation (minimum 6 characters)
  - OTP input with 4-digit verification
  - Resend OTP functionality
  - Google Sign-in button (dummy implementation)
  - Error handling and loading states

### 2. User Login

- **Features:**
  - Email and password authentication
  - Form validation
  - Remember credentials
  - Link to forgot password
  - Link to sign up
  - Google Sign-in button (dummy implementation)
  - Error handling and loading states

### 3. Forgot Password & Reset Password

- **Three-step password recovery:**
  1. Enter email address
  2. Verify OTP sent to email
  3. Set new password
- **Features:**
  - Email validation
  - OTP verification with 4-digit input
  - Password confirmation validation
  - Resend OTP functionality
  - Error handling and loading states

## Technology Stack

- **Framework:** Next.js 15.2.5
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom-built reusable components
- **Icons:** Custom SVG icons + Lucide React
- **HTTP Client:** Axios
- **Fonts:** Google Fonts (Poppins, Roboto)

## Project Structure

```
apps/user-ui/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   ├── forgot-password/
│   │   │   └── page.tsx          # Forgot password page
│   │   ├── layout.tsx            # Root layout with Header
│   │   ├── page.tsx              # Home page
│   │   └── global.css            # Global styles
│   ├── assets/
│   │   └── svgs/                 # SVG icon components
│   │       ├── profile-icon.tsx
│   │       ├── google-icon.tsx
│   │       ├── heart-icon.tsx
│   │       └── cart-icon.tsx
│   ├── shared/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Input.tsx
│   │   │   ├── Button.tsx
│   │   │   └── OTPInput.tsx
│   │   ├── utils/
│   │   │   └── api.ts           # API integration layer
│   │   └── widgets/
│   │       └── header/
│   │           └── header.tsx   # Header component
│   └── .env.local               # Environment variables
```

## Components

### Reusable Components

#### 1. Input Component

- Customizable input field with label and error handling
- Support for all HTML input types
- Built-in validation error display

#### 2. Button Component

- Three variants: primary, secondary, outline
- Loading state with spinner
- Full-width option
- Disabled state handling

#### 3. OTPInput Component

- 4-digit OTP input with auto-focus
- Paste support for OTP codes
- Backspace navigation between inputs
- Error state display
- Auto-submit on completion

### Layout Components

#### Header Component

- Logo with navigation link
- Search bar (UI only)
- Navigation menu:
  - All Departments dropdown
  - Home, Products, Shops, Offers, Become A Seller
- User actions:
  - Wishlist with count badge
  - Cart with count badge
  - Profile/Sign In link
- Responsive design
- Professional styling matching reference images

## API Integration

### API Configuration

- Base URL: `http://localhost:8080/api` (API Gateway)
- Backend Service: `http://localhost:6001/api` (Auth Service, proxied through gateway)
- Credentials: Included (for cookie-based auth)
- Content-Type: application/json

### API Endpoints

1. **POST /user-registration** - Send OTP for registration
2. **POST /verify-user** - Complete registration with OTP
3. **POST /login-user** - User login
4. **POST /forgot-password-user** - Send OTP for password reset
5. **POST /verify-forgot-password-user** - Verify password reset OTP
6. **POST /reset-password-user** - Reset password

## Running the Application

### Prerequisites

- Node.js (v18+)
- npm or yarn
- API Gateway running on port 8080
- Auth service running on port 6001 (proxied through gateway)

### Environment Setup

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Installation

```bash
cd apps/user-ui
npm install
```

### Development

```bash
# Terminal 1: Start all backend services (API Gateway + Auth Service)
npm run dev

# Terminal 2: Start frontend
npm run user-ui

# Or using nx directly
npx nx serve user-ui
```

The application will be available at:

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8080/api
- **Auth Service:** http://localhost:6001/api (internal)
- **API Docs:** http://localhost:6001/api-docs

## Features & User Flows

### Sign Up Flow

1. Navigate to `/signup`
2. Enter name, email, and password
3. Click "Continue" - OTP sent to email
4. Enter 4-digit OTP code
5. Click "Verify OTP"
6. Redirect to login page on success

### Login Flow

1. Navigate to `/login`
2. Enter email and password
3. Click "Submit"
4. Redirect to home page on success

### Forgot Password Flow

1. Navigate to `/forgot-password` or click "Forgot Password?" on login
2. Enter email address
3. Click "Submit" - OTP sent to email
4. Enter 4-digit OTP code
5. Click "Verify OTP"
6. Enter new password and confirm
7. Click "Reset Password"
8. Redirect to login page on success

## Design Features

- Clean and modern UI matching reference images
- Consistent color scheme (Blue #3489FF, Black, Gray)
- Professional typography using Poppins and Roboto fonts
- Smooth transitions and hover effects
- Responsive form layouts
- Accessible form controls
- Loading states for all async operations
- Error handling with user-friendly messages
- Breadcrumb navigation on all pages

## Security Features

- Client-side form validation
- Password strength requirements
- Email format validation
- CSRF protection via cookies
- Secure HTTP-only cookies for tokens
- CORS configuration for allowed origins

## Future Enhancements

1. **Google OAuth Integration** - Currently dummy button
2. **State Management** - Add Context API or Zustand for global state
3. **Session Management** - Implement JWT token refresh
4. **Protected Routes** - Add authentication middleware
5. **User Profile** - Dashboard and profile management
6. **Remember Me** - Local storage for email
7. **Email Verification** - Visual feedback for email verification
8. **Password Strength Indicator** - Visual meter for password strength
9. **2FA Support** - Two-factor authentication option
10. **Social Login** - Facebook, Apple, etc.

## Error Handling

All forms include:

- Field-level validation errors
- API error messages display
- Network error handling
- Loading states during API calls
- Graceful fallbacks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Google login button is dummy implementation (not functional yet)
- Wishlist and Cart features are UI-only (counts hardcoded to 0)
- All authentication flows are fully integrated with backend
- OTP expiry and rate limiting handled by backend
- Cookies are used for authentication tokens

## Dependencies

```json
{
  "dependencies": {
    "next": "~15.2.4",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "axios": "^1.12.2",
    "lucide-react": "^0.545.0"
  }
}
```

## Contributing

When adding new features:

1. Create reusable components in `shared/components/`
2. Add API endpoints in `shared/utils/api.ts`
3. Follow existing naming conventions
4. Maintain TypeScript types
5. Add proper error handling
6. Test all authentication flows

---

**Status:** ✅ Fully Functional
**Last Updated:** October 7, 2025
