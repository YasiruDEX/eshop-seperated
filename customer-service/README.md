# 🛍️ Customer Service - E-Shop Profile Management

## Overview

Customer service manages user profiles with shopping preferences, dietary needs, brand preferences, household inventory, and loyalty memberships.

## Features

### User Profile Management

- **Budget & Location:** Set budget limits and shopping location
- **Dietary Needs:** Track vegetarian, vegan, gluten-free, halal, kosher, and allergy preferences
- **Brand Preferences:** Save preferred and disliked brands
- **Household Inventory:** Track current items and set low stock thresholds
- **Loyalty Membership:** Manage preferred stores and membership tiers

## Tech Stack

- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** MongoDB via Prisma ORM
- **Port:** 3006

## Database Schema

```prisma
model Profile {
  id                     String   @id @default(auto()) @map("_id") @db.ObjectId
  userId                 String   @unique
  budgetLimitLkr         Float?
  location               String?

  // Dietary needs
  vegetarian             Boolean  @default(false)
  vegan                  Boolean  @default(false)
  glutenFree             Boolean  @default(false)
  dairyFree              Boolean  @default(false)
  organicOnly            Boolean  @default(false)
  lowSodium              Boolean  @default(false)
  sugarFree              Boolean  @default(false)
  halal                  Boolean  @default(false)
  kosher                 Boolean  @default(false)
  allergies              String[] @default([])

  // Brand preferences
  preferredBrands        String[] @default([])
  dislikedBrands         String[] @default([])

  // Household inventory
  currentItems           Json?
  lowStockThreshold      Int      @default(2)

  // Loyalty membership
  preferredStores        String[] @default([])
  memberships            Json?

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@map("profiles")
}
```

## API Endpoints

### Save Profile

```http
POST /api/profiles
Content-Type: application/json

{
  "userId": "user_12345",
  "budgetLimitLkr": 5000.0,
  "location": "Colombo, Sri Lanka",
  "dietaryNeeds": {
    "vegetarian": true,
    "vegan": false,
    "gluten_free": false,
    "dairy_free": false,
    "organic_only": false,
    "low_sodium": false,
    "sugar_free": false,
    "halal": true,
    "kosher": false,
    "allergies": ["peanuts", "shellfish"]
  },
  "brandPreferences": {
    "preferred_brands": ["Anchor", "Maliban", "Munchee", "MD"],
    "disliked_brands": ["BrandX"]
  },
  "householdInventory": {
    "current_items": {
      "rice": 5,
      "sugar": 3,
      "salt": 10
    },
    "low_stock_threshold": 2
  },
  "loyaltyMembership": {
    "preferred_stores": ["glowmark.lk", "kapruka.com"],
    "memberships": {
      "glowmark.lk": "gold",
      "kapruka.com": "premium"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile saved successfully",
  "data": { ... }
}
```

### Get Profile

```http
GET /api/profiles/:userId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user_id": "user_12345",
    "budget_limit_lkr": 5000.0,
    "location": "Colombo, Sri Lanka",
    "dietary_needs": { ... },
    "brand_preferences": { ... },
    "household_inventory": { ... },
    "loyalty_membership": { ... }
  }
}
```

## Setup & Installation

### 1. Install Dependencies

```bash
cd apps/customer-service
npm install
```

### 2. Environment Configuration

Create `.env` file:

```env
CUSTOMER_DATABASE_URL="mongodb+srv://yasiru:5SRV9GAYvwUcQZMK@ecommerce.guntsuc.mongodb.net/customers"
CUSTOMER_SERVICE_PORT=3006
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Start Service

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Access Through API Gateway

The customer service is accessible through the API Gateway at:

```
http://localhost:8080/profiles
```

**Routes:**

- `POST /profiles` → Create/Update profile
- `GET /profiles/:userId` → Get profile by user ID

## Frontend Integration

### Profile Page

Located at: `/apps/user-ui/src/app/profile/page.tsx`

**Features:**

- Budget and location settings
- Dietary needs checkboxes
- Allergy management
- Brand preference lists
- Household inventory tracking
- Loyalty membership management

**Form Fields:**

- Budget Limit (LKR): Number input
- Location: Text input
- Dietary Needs: Checkboxes for various dietary restrictions
- Allergies: Comma-separated list
- Preferred Brands: Comma-separated list
- Disliked Brands: Comma-separated list
- Current Items: Format `item:quantity, ...`
- Low Stock Threshold: Number input
- Preferred Stores: Comma-separated list
- Memberships: Format `store:tier, ...`

### Usage Example

```typescript
// Save profile
const response = await fetch(`${GATEWAY_URL}/profiles`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(profileData),
});

// Get profile
const response = await fetch(`${GATEWAY_URL}/profiles/${userId}`);
```

## Header Navigation Updates

### New Features

1. **All Departments:** Redirects to search with all categories
2. **Electronics Button:** Search for electronics products
3. **Fashion Button:** Search for fashion products
4. **Products Dropdown:** Categories menu with:
   - Electronics
   - Fashion
   - Home & Garden
   - Kitchen
   - Sports
   - Books
   - Toys
   - Beauty & Health

### Removed Features

- Shops navigation link
- Offers navigation link

## Testing

### 1. Start Services

```bash
# API Gateway (Port 8080)
npm run api-gateway

# Customer Service (Port 3006)
cd apps/customer-service && npm run dev

# User UI (Port 3000)
npm run user-ui
```

### 2. Test Profile Page

1. Navigate to: http://localhost:3000/profile
2. Fill in all fields
3. Click "Save Profile"
4. Verify toast notification shows success
5. Refresh page to verify data persists

### 3. Test Navigation

1. Click "All Departments" → Should show all products
2. Click "Electronics" → Should show electronics
3. Click "Fashion" → Should show fashion items
4. Hover over "Products" → Should show dropdown with categories
5. Click any category → Should navigate to search with that category

## Error Handling

### Common Errors

**Missing User ID:**

```json
{
  "success": false,
  "message": "User ID is required"
}
```

**Profile Not Found:**

```json
{
  "success": false,
  "message": "Profile not found"
}
```

**Server Error:**

```json
{
  "success": false,
  "message": "Failed to save profile",
  "error": "Error details..."
}
```

## Database Collections

### Collection Name: `profiles`

**Database:** `customers`

### Sample Document

```json
{
  "_id": ObjectId("..."),
  "userId": "user_12345",
  "budgetLimitLkr": 5000,
  "location": "Colombo, Sri Lanka",
  "vegetarian": true,
  "vegan": false,
  "glutenFree": false,
  "dairyFree": false,
  "organicOnly": false,
  "lowSodium": false,
  "sugarFree": false,
  "halal": true,
  "kosher": false,
  "allergies": ["peanuts", "shellfish"],
  "preferredBrands": ["Anchor", "Maliban"],
  "dislikedBrands": ["BrandX"],
  "currentItems": {"rice": 5, "sugar": 3},
  "lowStockThreshold": 2,
  "preferredStores": ["glowmark.lk"],
  "memberships": {"glowmark.lk": "gold"},
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## Project Structure

```
apps/customer-service/
├── src/
│   ├── controller/
│   │   └── profile.controller.ts    # Profile CRUD operations
│   ├── routes/
│   │   └── profile.router.ts        # API routes
│   └── main.ts                       # Express app setup
├── prisma/
│   └── schema.prisma                 # Database schema
├── .env                              # Environment variables
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── README.md                         # This file
```

## Development Notes

### Prisma Client Location

Generated at: `/generated/prisma-customer`

### API Gateway Integration

The service is proxied through API Gateway:

- Gateway URL: `http://localhost:8080/profiles`
- Service URL: `http://localhost:3006/api/profiles`

### Data Format Conversion

The service converts between snake_case (API) and camelCase (database) automatically.

## Future Enhancements

### Potential Features

- [ ] Profile recommendations based on preferences
- [ ] Auto-restock suggestions when inventory is low
- [ ] Brand-based product filtering
- [ ] Budget tracking and alerts
- [ ] Dietary restriction product filtering
- [ ] Loyalty points integration
- [ ] Shopping history analysis
- [ ] Personalized product recommendations

## Troubleshooting

### Service Won't Start

```bash
# Check if port 3006 is in use
lsof -i :3006

# Kill process if needed
kill -9 <PID>
```

### Prisma Client Not Found

```bash
# Regenerate Prisma client
cd apps/customer-service
npx prisma generate
```

### Database Connection Error

- Verify MongoDB connection string in `.env`
- Check network connectivity
- Ensure MongoDB Atlas whitelist includes your IP

### Profile Not Saving

- Check API Gateway is running on port 8080
- Verify customer service is running on port 3006
- Check browser console for errors
- Verify user is logged in

## Support

For issues or questions:

1. Check service logs in terminal
2. Verify all services are running
3. Check browser console for frontend errors
4. Verify database connection

---

**Status:** ✅ Production Ready  
**Last Updated:** October 2025
