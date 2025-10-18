# Catalogue Service

Microservice for managing scraped product data from third-party sources.

## Port

- **6002**

## Database

Uses the `catalogue.prisma` schema with its own MongoDB database via `CATALOGUE_DATABASE_URL`.

## Endpoints

### Get Product by ID

```
GET /products/:id
```

**Description:** Fetch scraped product details by MongoDB ObjectId

**Parameters:**

- `id` (path) - MongoDB ObjectId (24 hex characters)

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "id": "68c15bddff6717e8e8ace0ef",
    "source_domain": "glomark.lk",
    "title": "Milo Original Drink 240Ml",
    "created_at": "2025-09-10T11:07:08.701Z",
    "currency": "LKR",
    "image_url": "https://...",
    "last_updated": "2025-09-10T11:07:08.701Z",
    "price_LKR": 560,
    "scraped_at": "2025-09-10T11:07:08.701Z",
    "source_url": "https://glomark.lk/search?search-text=milo",
    "website": "Glowmark"
  }
}
```

**Response (Not Found - 404):**

```json
{
  "success": false,
  "error": "Product not found"
}
```

**Response (Invalid ID - 400):**

```json
{
  "success": false,
  "error": "Invalid product ID format. Must be a valid MongoDB ObjectId."
}
```

## Running the Service

### Development

```bash
# Build and run
npx nx serve catalogue-service

# Or build first, then run
npx nx build catalogue-service
node dist/apps/catalogue-service/main.js
```

### Via API Gateway

The service is proxied through the API Gateway at:

```
http://localhost:8080/catalogue/products/:id
```

## Environment Variables

Ensure `CATALOGUE_DATABASE_URL` is set in your `.env` file:

```
CATALOGUE_DATABASE_URL="mongodb+srv://..."
```

## Database Setup

```bash
# Generate Prisma client
npx prisma generate --schema=prisma/catalogue.prisma

# Push schema to database
npx prisma db push --schema=prisma/catalogue.prisma
```
