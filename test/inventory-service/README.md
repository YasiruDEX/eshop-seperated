# Inventory Service

A microservice for managing user kitchen inventory items in the eShop platform.

## Features

- Add inventory items with custom names or product IDs
- Track quantity and unit of measurement (kg, L, ml, units, etc.)
- Update item counts and details
- Delete inventory items
- Retrieve all items for a specific user
- Get specific item details
- Full CRUD operations with MongoDB

## Database Schema

The service uses MongoDB with the following schema:

```prisma
model inventoryItems {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId // User who owns this inventory item
  itemId    String?  // Optional product ID reference
  itemName  String   // Name of the item
  count     Float    // Quantity of the item
  unit      String   // Unit of measurement (units, ml, L, kg, g, etc.)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Endpoints

### Base URL

- Direct: `http://localhost:6006/inventory`
- Via API Gateway: `http://localhost:8080/inventory`

### 1. Add Inventory Item

**POST** `/inventory`

Add a new item to the user's inventory.

**Request Body:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "itemId": "optional-product-id",
  "itemName": "Rice",
  "count": 5,
  "unit": "kg"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Inventory item added successfully",
  "data": {
    "id": "68f200d87035ae8267cc76dc",
    "userId": "507f1f77bcf86cd799439011",
    "itemId": null,
    "itemName": "Rice",
    "count": 5,
    "unit": "kg",
    "createdAt": "2025-10-17T08:39:52.141Z",
    "updatedAt": "2025-10-17T08:39:52.141Z"
  }
}
```

### 2. Get User's Inventory

**GET** `/inventory/user/:userId`

Retrieve all inventory items for a specific user.

**Response (200):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "68f200ed7035ae8267cc76dd",
      "userId": "507f1f77bcf86cd799439011",
      "itemId": "prod123",
      "itemName": "Whole Milk",
      "count": 3,
      "unit": "L",
      "createdAt": "2025-10-17T08:40:13.932Z",
      "updatedAt": "2025-10-17T08:40:38.486Z"
    }
  ]
}
```

### 3. Get All Inventory Items

**GET** `/inventory`

Retrieve all inventory items (for admin/debugging).

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

### 4. Get Specific Item

**GET** `/inventory/item/:id`

Get details of a specific inventory item by ID.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "68f200d87035ae8267cc76dc",
    "userId": "507f1f77bcf86cd799439011",
    "itemId": null,
    "itemName": "Rice",
    "count": 10,
    "unit": "kg",
    "createdAt": "2025-10-17T08:39:52.141Z",
    "updatedAt": "2025-10-17T08:40:30.254Z"
  }
}
```

### 5. Update Item Count

**PATCH** `/inventory/:id/count`

Update only the quantity of an inventory item.

**Request Body:**

```json
{
  "count": 10
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Item count updated successfully",
  "data": {
    "id": "68f200d87035ae8267cc76dc",
    "count": 10,
    ...
  }
}
```

### 6. Update Item

**PUT** `/inventory/:id`

Update multiple fields of an inventory item.

**Request Body:**

```json
{
  "itemName": "Whole Milk",
  "count": 3,
  "unit": "L",
  "itemId": "prod123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": {
    "id": "68f200ed7035ae8267cc76dd",
    "itemName": "Whole Milk",
    "count": 3,
    "unit": "L",
    ...
  }
}
```

### 7. Delete Item

**DELETE** `/inventory/:id`

Delete an inventory item.

**Response (200):**

```json
{
  "success": true,
  "message": "Inventory item deleted successfully"
}
```

## Setup and Installation

### Prerequisites

- Node.js (v20+)
- MongoDB database
- Prisma CLI

### Environment Variables

Add the following to your `.env` file:

```env
INVENTORY_DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/inventory"
INVENTORY_PORT=6006  # Optional, defaults to 6006
```

### Installation Steps

1. **Generate Prisma Client**

   ```bash
   npx prisma generate --schema=apps/inventory-service/prisma/schema.prisma
   ```

2. **Build the Service**

   ```bash
   bash apps/inventory-service/build.sh
   ```

   Or use npm script:

   ```bash
   npm run build:inventory
   ```

3. **Run the Service**

   ```bash
   npm run inventory-service
   ```

   Or directly:

   ```bash
   node -r dotenv/config dist/apps/inventory-service/main.js
   ```

### Development

To run in development mode with auto-reload:

```bash
npx nx serve inventory-service
```

## Testing Examples

### Using cURL

```bash
# Add an item
curl -X POST http://localhost:8080/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "itemName": "Rice",
    "count": 5,
    "unit": "kg"
  }'

# Get user inventory
curl http://localhost:8080/inventory/user/507f1f77bcf86cd799439011

# Update item count
curl -X PATCH http://localhost:8080/inventory/{itemId}/count \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'

# Delete item
curl -X DELETE http://localhost:8080/inventory/{itemId}
```

## Architecture

The service follows a standard Express.js architecture:

```
inventory-service/
├── src/
│   ├── main.ts              # Application entry point
│   ├── controller/
│   │   └── inventory.controller.ts  # Business logic
│   └── routes/
│       └── inventory.router.ts      # Route definitions
├── prisma/
│   └── schema.prisma        # Database schema
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Technologies Used

- **Express.js** - Web framework
- **Prisma** - ORM for MongoDB
- **MongoDB** - Database
- **TypeScript** - Type safety
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

## Port Configuration

- Service Port: `6006`
- API Gateway: `8080`

## Error Handling

All endpoints include comprehensive error handling with appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Notes

- The `itemId` field is optional and can be used to reference external product catalogs
- The `itemName` field allows users to add custom items not in the product catalog
- The `count` field supports decimal values for fractional quantities
- The `unit` field is flexible and can accept any string (kg, L, ml, units, pieces, etc.)
- All dates are stored and returned in ISO 8601 format

## Health Check

Check if the service is running:

```bash
curl http://localhost:6006/health
```

Response:

```json
{
  "message": "Inventory service is running",
  "service": "inventory-service",
  "port": 6006
}
```

## Integration with API Gateway

The service is automatically proxied through the API Gateway at port 8080. All requests to `/inventory/*` are forwarded to the inventory service.

Example:

```bash
# Direct access
curl http://localhost:6006/inventory

# Through API Gateway
curl http://localhost:8080/inventory
```

## Future Enhancements

- [ ] Add authentication middleware
- [ ] Implement pagination for large inventories
- [ ] Add search and filter capabilities
- [ ] Implement batch operations
- [ ] Add inventory alerts for low stock
- [ ] Integration with order system
- [ ] Add item expiry date tracking
- [ ] Support for item categories
