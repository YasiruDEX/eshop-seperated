# Messaging Service

A microservice for managing real-time communication between users and sellers in the eShop platform.

## Features

- Send messages between users and sellers
- Retrieve conversation history between specific user-seller pairs
- Get all conversations for a user or seller
- Mark messages as read
- Track unread message counts
- Delete messages
- Real-time chat support with MongoDB

## Database Schema

The service uses MongoDB with the following schema:

```prisma
model messaging {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId // User in the conversation
  sellerId   String   @db.ObjectId // Seller in the conversation
  senderId   String   @db.ObjectId // Who sent this message
  senderType String   // "user" or "seller"
  message    String   // Message content
  isRead     Boolean  @default(false) // Read status
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## API Endpoints

### Base URL

- Direct: `http://localhost:6007/messages`
- Via API Gateway: `http://localhost:8080/messages`

### 1. Send Message

**POST** `/messages`

Send a message from user to seller or vice versa.

**Request Body:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "sellerId": "507f1f77bcf86cd799439012",
  "senderId": "507f1f77bcf86cd799439011",
  "senderType": "user",
  "message": "Hello, I am interested in your product!"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "68f207efd3e72b4e6b35756c",
    "userId": "507f1f77bcf86cd799439011",
    "sellerId": "507f1f77bcf86cd799439012",
    "senderId": "507f1f77bcf86cd799439011",
    "senderType": "user",
    "message": "Hello, I am interested in your product!",
    "isRead": false,
    "createdAt": "2025-10-17T09:10:07.340Z",
    "updatedAt": "2025-10-17T09:10:07.340Z"
  }
}
```

### 2. Get Conversation

**GET** `/messages/conversation/:userId/:sellerId`

Retrieve all messages between a specific user and seller.

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "68f207ebd3e72b4e6b35756b",
      "userId": "507f1f77bcf86cd799439011",
      "sellerId": "507f1f77bcf86cd799439012",
      "senderId": "507f1f77bcf86cd799439011",
      "senderType": "user",
      "message": "Hello, I am interested in your product!",
      "isRead": false,
      "createdAt": "2025-10-17T09:10:01.328Z",
      "updatedAt": "2025-10-17T09:10:01.328Z"
    },
    {
      "id": "68f207fdd3e72b4e6b35756d",
      "userId": "507f1f77bcf86cd799439011",
      "sellerId": "507f1f77bcf86cd799439012",
      "senderId": "507f1f77bcf86cd799439012",
      "senderType": "seller",
      "message": "Hi! Thanks for your interest. How can I help you?",
      "isRead": false,
      "createdAt": "2025-10-17T09:10:21.836Z",
      "updatedAt": "2025-10-17T09:10:21.836Z"
    }
  ]
}
```

### 3. Get User Conversations

**GET** `/messages/user/:userId`

Get all conversations for a specific user with unread counts.

**Response (200):**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "sellerId": "507f1f77bcf86cd799439012",
      "lastMessage": "Hi! Thanks for your interest. How can I help you?",
      "lastMessageTime": "2025-10-17T09:10:21.836Z",
      "unreadCount": 1
    },
    {
      "sellerId": "507f1f77bcf86cd799439015",
      "lastMessage": "Sure, I can help with that!",
      "lastMessageTime": "2025-10-17T09:05:15.120Z",
      "unreadCount": 0
    }
  ]
}
```

### 4. Get Seller Conversations

**GET** `/messages/seller/:sellerId`

Get all conversations for a specific seller with unread counts.

**Response (200):**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "lastMessage": "Hello, I am interested in your product!",
      "lastMessageTime": "2025-10-17T09:10:21.836Z",
      "unreadCount": 2
    }
  ]
}
```

### 5. Mark Messages as Read

**PATCH** `/messages/read`

Mark messages as read for a specific conversation.

**Request Body:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "sellerId": "507f1f77bcf86cd799439012",
  "readerId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Marked 2 messages as read",
  "count": 2
}
```

### 6. Get Specific Message

**GET** `/messages/:id`

Get details of a specific message by ID.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "68f207efd3e72b4e6b35756c",
    "userId": "507f1f77bcf86cd799439011",
    "sellerId": "507f1f77bcf86cd799439012",
    "senderId": "507f1f77bcf86cd799439011",
    "senderType": "user",
    "message": "Hello!",
    "isRead": true,
    "createdAt": "2025-10-17T09:10:07.340Z",
    "updatedAt": "2025-10-17T09:10:30.150Z"
  }
}
```

### 7. Delete Message

**DELETE** `/messages/:id`

Delete a specific message by ID.

**Response (200):**

```json
{
  "success": true,
  "message": "Message deleted successfully"
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
COMMUNICATION_DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/communication"
MESSAGING_PORT=6007  # Optional, defaults to 6007
```

### Installation Steps

1. **Generate Prisma Client**

   ```bash
   npx prisma generate --schema=apps/messaging-service/prisma/schema.prisma
   ```

2. **Build the Service**

   ```bash
   bash apps/messaging-service/build.sh
   ```

   Or use npm script:

   ```bash
   npm run build:messaging
   ```

3. **Run the Service**

   ```bash
   npm run messaging-service
   ```

   Or directly:

   ```bash
   node -r dotenv/config dist/apps/messaging-service/main.js
   ```

### Development

To run in development mode with auto-reload:

```bash
npx nx serve messaging-service
```

## Testing Examples

### Using cURL

```bash
# Send a message from user to seller
curl -X POST http://localhost:8080/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "sellerId": "507f1f77bcf86cd799439012",
    "senderId": "507f1f77bcf86cd799439011",
    "senderType": "user",
    "message": "Hello, I am interested in your product!"
  }'

# Send a reply from seller
curl -X POST http://localhost:8080/messages \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "sellerId": "507f1f77bcf86cd799439012",
    "senderId": "507f1f77bcf86cd799439012",
    "senderType": "seller",
    "message": "Hi! Thanks for your interest."
  }'

# Get conversation
curl http://localhost:8080/messages/conversation/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012

# Get user conversations
curl http://localhost:8080/messages/user/507f1f77bcf86cd799439011

# Mark messages as read
curl -X PATCH http://localhost:8080/messages/read \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "sellerId": "507f1f77bcf86cd799439012",
    "readerId": "507f1f77bcf86cd799439012"
  }'

# Delete a message
curl -X DELETE http://localhost:8080/messages/{messageId}
```

## Architecture

The service follows a standard Express.js architecture:

```
messaging-service/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── controller/
│   │   └── messaging.controller.ts  # Business logic
│   └── routes/
│       └── messaging.router.ts      # Route definitions
├── prisma/
│   └── schema.prisma              # Database schema
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

- Service Port: `6007`
- API Gateway: `8080`

## Error Handling

All endpoints include comprehensive error handling with appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Features Explained

### Message Sending

- Both users and sellers can send messages
- The `senderId` must match either `userId` or `sellerId` based on `senderType`
- Messages are timestamped automatically

### Conversation Retrieval

- Messages are ordered chronologically (oldest first)
- Supports filtering by user-seller pair
- Includes read status for each message

### Read Status Tracking

- Messages start as unread (`isRead: false`)
- Can be marked as read when the recipient views them
- The `readerId` determines whose messages to mark as read

### Conversation Lists

- Users and sellers get separate conversation list endpoints
- Shows latest message in each conversation
- Displays unread message count per conversation
- Helps build inbox/chat list UI

## Use Cases

### User-Seller Communication

- Users can inquire about products
- Sellers can respond to customer queries
- Order-related discussions
- Product availability questions
- Negotiation and support

### Real-time Chat Support

- Build chat interfaces with this API
- Track read receipts
- Manage multiple conversations
- Notification system integration

## Health Check

Check if the service is running:

```bash
curl http://localhost:6007/health
```

Response:

```json
{
  "message": "Messaging service is running",
  "service": "messaging-service",
  "port": 6007
}
```

## Integration with API Gateway

The service is automatically proxied through the API Gateway at port 8080. All requests to `/messages/*` are forwarded to the messaging service.

Example:

```bash
# Direct access
curl http://localhost:6007/messages/user/507f1f77bcf86cd799439011

# Through API Gateway
curl http://localhost:8080/messages/user/507f1f77bcf86cd799439011
```

## Future Enhancements

- [ ] Add authentication middleware
- [ ] Implement WebSocket for real-time messaging
- [ ] Add message attachments support
- [ ] Implement message search functionality
- [ ] Add typing indicators
- [ ] Support for message reactions/emojis
- [ ] Message editing capability
- [ ] Conversation archiving
- [ ] Message delivery status (sent, delivered, read)
- [ ] Push notification integration
- [ ] Block/report user functionality
- [ ] Message retention policies
- [ ] Conversation threading
- [ ] Rich media support (images, files)

## Best Practices

### Validation

- Always validate `senderId` matches either `userId` or `sellerId`
- Ensure `senderType` is either "user" or "seller"
- Validate MongoDB ObjectId format for IDs

### Read Status

- Mark messages as read when the conversation is opened
- Only mark messages where the reader is NOT the sender
- Use the `readerId` to identify who's reading

### Performance

- Conversations are indexed by `[userId, sellerId]` for fast queries
- Messages are indexed by `senderId` for sender-specific queries
- Consider pagination for conversations with many messages

## Security Notes

⚠️ **Important**: This service currently has public endpoints. In production:

- Add authentication middleware to verify user/seller identity
- Ensure users can only access their own messages
- Validate sender permissions before sending messages
- Implement rate limiting to prevent spam
- Add input sanitization to prevent XSS attacks

## Troubleshooting

### Service won't start

- Check if port 6007 is available
- Verify MongoDB connection string in `.env`
- Ensure Prisma client is generated

### Messages not saving

- Verify `COMMUNICATION_DATABASE_URL` is set correctly
- Check MongoDB database is accessible
- Ensure collection name is "messaging"

### API Gateway not proxying

- Verify API Gateway is running on port 8080
- Check if messaging service is running on port 6007
- Ensure `/messages` route is configured in gateway
