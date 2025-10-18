# Checkout Service

A microservice for managing shopping carts and processing checkout payments through Stripe integration.

## Overview

The Checkout Service provides a complete cart management system with integrated payment processing capabilities. It handles cart operations (add, update, remove items) and seamlessly connects with the Payment Service to create Stripe checkout sessions for secure payment processing.

## Features

- ✅ Add items to cart
- ✅ View user's cart with calculated totals
- ✅ Update item quantities
- ✅ Remove individual items
- ✅ Clear entire cart
- ✅ Checkout with Stripe payment integration
- ✅ Automatic cart item aggregation (same item updates quantity)
- ✅ Real-time total calculation
- ✅ MongoDB persistence

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM for MongoDB
- **MongoDB** - Database
- **Axios** - HTTP client for Payment Service integration
- **TypeScript** - Type safety
- **Webpack** - Module bundler

## API Endpoints

### 1. Add Item to Cart

```bash
POST /cart
```

**Request Body:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "itemId": "507f1f77bcf86cd799439012",
  "price": 29.99,
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "id": "68f216d3313559c176de05ab",
    "userId": "507f1f77bcf86cd799439011",
    "itemId": "507f1f77bcf86cd799439012",
    "price": 29.99,
    "quantity": 2,
    "createdAt": "2025-10-17T10:13:39.254Z",
    "updatedAt": "2025-10-17T10:13:39.254Z"
  }
}
```

**Note:** If the same item already exists in the cart, the quantity will be added to the existing quantity.

### 2. Get User's Cart

```bash
GET /cart/:userId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "68f216d3313559c176de05ab",
        "userId": "507f1f77bcf86cd799439011",
        "itemId": "507f1f77bcf86cd799439012",
        "price": 29.99,
        "quantity": 2,
        "createdAt": "2025-10-17T10:13:39.254Z",
        "updatedAt": "2025-10-17T10:13:39.254Z"
      }
    ],
    "itemCount": 1,
    "totalQuantity": 2,
    "total": 59.98
  }
}
```

### 3. Get Cart Item by ID

```bash
GET /cart/item/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "68f216d3313559c176de05ab",
    "userId": "507f1f77bcf86cd799439011",
    "itemId": "507f1f77bcf86cd799439012",
    "price": 29.99,
    "quantity": 2,
    "createdAt": "2025-10-17T10:13:39.254Z",
    "updatedAt": "2025-10-17T10:13:39.254Z"
  }
}
```

### 4. Update Cart Item Quantity

```bash
PATCH /cart/:id
```

**Request Body:**

```json
{
  "quantity": 5
}
```

**Response:**

```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "id": "68f216d3313559c176de05ab",
    "userId": "507f1f77bcf86cd799439011",
    "itemId": "507f1f77bcf86cd799439012",
    "price": 29.99,
    "quantity": 5,
    "createdAt": "2025-10-17T10:13:39.254Z",
    "updatedAt": "2025-10-17T10:14:11.774Z"
  }
}
```

### 5. Remove Item from Cart

```bash
DELETE /cart/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

### 6. Clear User's Cart

```bash
DELETE /cart/user/:userId
```

**Response:**

```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "deletedCount": 3
}
```

### 7. Checkout (Process Payment)

```bash
POST /cart/checkout/:userId
```

**Request Body:**

```json
{
  "customerEmail": "buyer@example.com",
  "customerName": "John Doe",
  "currency": "usd"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Checkout initiated successfully",
  "data": {
    "orderId": "order_1760696040853_439015",
    "sessionId": "cs_test_a1SkjKZOA1TBsNuyXUkbxwHNbbstlctiI4q7wUPnYq8jgEpJMyaUTcW4Eq",
    "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
    "totalAmount": 149.97,
    "currency": "usd",
    "itemCount": 2,
    "items": [...]
  }
}
```

The `sessionUrl` is the Stripe checkout page URL that the user should be redirected to for payment.

## Setup Instructions

### Prerequisites

- Node.js (v20+)
- MongoDB Atlas account or local MongoDB instance
- Payment Service running on port 6004
- Stripe API key configured in environment

### Environment Variables

Add to your `.env` file:

```env
CHECKOUT_DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/checkout"
PAYMENT_SERVICE_URL="http://localhost:6004"
CHECKOUT_SERVICE_PORT=6008
```

### Installation & Build

1. **Generate Prisma Client:**

```bash
npx prisma generate --schema=apps/checkout-service/prisma/schema.prisma
```

2. **Build the Service:**

```bash
npm run build:checkout
```

3. **Run the Service:**

```bash
npm run checkout-service
```

The service will start on `http://localhost:6008`

### Database Schema

```prisma
model Cart {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  itemId    String   @db.ObjectId
  price     Float
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([itemId])
  @@map("cart")
}
```

## Usage Examples

### Via API Gateway (Port 8080)

**Add item to cart:**

```bash
curl -X POST http://localhost:8080/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "itemId": "507f1f77bcf86cd799439012",
    "price": 29.99,
    "quantity": 2
  }'
```

**Get user cart:**

```bash
curl -X GET http://localhost:8080/cart/507f1f77bcf86cd799439011
```

**Checkout:**

```bash
curl -X POST http://localhost:8080/cart/checkout/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "buyer@example.com",
    "customerName": "John Doe",
    "currency": "usd"
  }'
```

**Update quantity:**

```bash
curl -X PATCH http://localhost:8080/cart/68f216d3313559c176de05ab \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

**Remove item:**

```bash
curl -X DELETE http://localhost:8080/cart/68f216d3313559c176de05ab
```

**Clear cart:**

```bash
curl -X DELETE http://localhost:8080/cart/user/507f1f77bcf86cd799439011
```

### Direct Service Access (Port 6008)

Replace `http://localhost:8080` with `http://localhost:6008` in the above examples.

## Architecture

```
┌─────────────────┐
│   API Gateway   │
│   (Port 8080)   │
└────────┬────────┘
         │ /cart/*
         ↓
┌─────────────────┐      ┌──────────────────┐
│ Checkout Service│─────→│ Payment Service  │
│   (Port 6008)   │ HTTP │   (Port 6004)    │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         ↓                        ↓
┌─────────────────┐      ┌──────────────────┐
│   MongoDB       │      │   Stripe API     │
│   (checkout)    │      │                  │
└─────────────────┘      └──────────────────┘
```

## Payment Flow

1. **Add Items**: User adds items to cart via POST /cart
2. **Review Cart**: User reviews cart via GET /cart/:userId
3. **Checkout**: User initiates checkout via POST /cart/checkout/:userId
4. **Payment Session**: Service calls Payment Service to create Stripe session
5. **Redirect**: User is redirected to Stripe checkout URL
6. **Payment**: User completes payment on Stripe
7. **Webhook**: Stripe sends webhook to Payment Service
8. **Completion**: Order is marked as paid in Payment Service database

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common Error Codes:**

- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (cart item not found)
- `500` - Internal Server Error

## Validation

### Add to Cart

- ✓ `userId` must be provided
- ✓ `itemId` must be provided
- ✓ `price` must be a positive number
- ✓ `quantity` must be a positive integer

### Checkout

- ✓ `userId` must be provided
- ✓ Cart must not be empty
- ✓ Payment service must be accessible
- ✓ Valid Stripe API key must be configured

## Features in Detail

### Automatic Quantity Aggregation

When adding an item that already exists in the cart (same userId and itemId), the service automatically adds the new quantity to the existing quantity instead of creating a duplicate entry.

### Real-time Total Calculation

The GET cart endpoint calculates:

- **itemCount**: Number of unique items
- **totalQuantity**: Total number of items (sum of all quantities)
- **total**: Total cart value (sum of price × quantity for all items)

### Stripe Integration

The checkout endpoint:

1. Fetches all cart items for the user
2. Calculates total amount
3. Generates unique order ID
4. Calls Payment Service with cart details
5. Returns Stripe checkout URL for payment

## Testing

### Health Check

```bash
curl http://localhost:6008/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "checkout-service",
  "port": 6008
}
```

### Full Flow Test

1. Add multiple items to cart
2. View cart and verify totals
3. Update item quantity
4. Remove an item
5. Checkout and receive Stripe URL
6. Clear cart after testing

## Dependencies

Key packages:

- `express`: ^4.21.2
- `@prisma/client`: ^6.16.3
- `axios`: ^1.7.9
- `cors`: ^2.8.5
- `morgan`: ^1.10.0
- `dotenv`: ^16.4.7

## Development

### Watch Mode

```bash
cd apps/checkout-service
npm run dev
```

### Rebuild After Changes

```bash
npm run build:checkout
```

### View Logs

```bash
tail -f /tmp/checkout-service.log
```

## Troubleshooting

### Service won't start

- Check if port 6008 is already in use: `lsof -i :6008`
- Verify database connection string in `.env`
- Ensure Prisma client is generated

### Checkout fails

- Verify Payment Service is running on port 6004
- Check Stripe API key in Payment Service `.env`
- Ensure cart is not empty before checkout

### Database connection errors

- Verify MongoDB Atlas connection string
- Check network access whitelist in MongoDB Atlas
- Ensure database user has read/write permissions

## Future Enhancements

- [ ] Cart expiration (auto-clear after X days)
- [ ] Save for later functionality
- [ ] Apply discount codes/coupons
- [ ] Inventory validation before checkout
- [ ] Guest cart support (pre-login)
- [ ] Cart sharing between devices
- [ ] Wishlist integration
- [ ] Recommended items based on cart
- [ ] Price change notifications
- [ ] Bulk operations (add multiple items)
- [ ] Cart analytics and insights

## Support

For issues or questions:

1. Check the logs: `/tmp/checkout-service.log`
2. Verify all environment variables are set
3. Ensure dependent services (Payment, MongoDB) are running
4. Review the API response error messages

## License

MIT
