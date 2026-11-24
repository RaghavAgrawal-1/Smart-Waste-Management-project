# SmartWaste API Documentation

Base URL: `http://localhost:5000/api`

---

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained from the `/api/auth/login` endpoint and expire after `7d` by default.

---

## 1. Auth Routes (`/api/auth`)

### POST `/api/auth/register`
Register a new user account.

**Auth required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "John@1234",
  "phone": "9876543210",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "9876543210"
  }
}
```

---

### POST `/api/auth/login`
Authenticate and receive a JWT.

**Auth required:** No

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "John@1234"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### GET `/api/auth/profile`
Get the authenticated user's profile.

**Auth required:** Yes (any role)

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "9876543210",
    "addresses": [],
    "profileImage": null,
    "isActive": true,
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
}
```

---

### PUT `/api/auth/profile`
Update the authenticated user's profile.

**Auth required:** Yes (any role)

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9000000001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Updated",
    "phone": "9000000001"
  }
}
```

---

### POST `/api/auth/address`
Add a new pickup/delivery address to the user's profile.

**Auth required:** Yes (any role)

**Request Body:**
```json
{
  "label": "Home",
  "street": "12 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "isDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address added successfully",
  "addresses": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "label": "Home",
      "street": "12 MG Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "isDefault": true
    }
  ]
}
```

---

## 2. Scrap Routes (`/api/scrap`)

### GET `/api/scrap/categories`
Retrieve all active scrap categories with pricing.

**Auth required:** No

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "name": "Newspapers & Books",
      "description": "Old newspapers, magazines, books",
      "pricePerKg": 12,
      "unit": "kg",
      "acceptedMaterials": ["Newspapers", "Magazines", "Books", "Cardboard"],
      "conditionRequirements": "Dry and clean, no wet paper",
      "isActive": true
    }
  ]
}
```

---

### GET `/api/scrap/categories/:id`
Get a single scrap category by ID.

**Auth required:** No

**Response:**
```json
{
  "success": true,
  "category": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "name": "Newspapers & Books",
    "description": "Old newspapers, magazines, books",
    "pricePerKg": 12,
    "unit": "kg",
    "acceptedMaterials": ["Newspapers", "Magazines"],
    "conditionRequirements": "Dry and clean",
    "isActive": true
  }
}
```

---

### POST `/api/scrap/listings`
Create a new scrap listing for pickup.

**Auth required:** Yes (`customer`)

**Request Body:**
```json
{
  "items": [
    {
      "category": "64f1a2b3c4d5e6f7a8b9c0d3",
      "estimatedWeight": 5,
      "condition": "good"
    },
    {
      "category": "64f1a2b3c4d5e6f7a8b9c0d4",
      "estimatedWeight": 2,
      "condition": "fair"
    }
  ],
  "pickupAddress": {
    "street": "12 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "landmark": "Near City Mall"
  },
  "preferredDate": "2024-11-20",
  "preferredTimeSlot": "morning",
  "additionalNotes": "Please call before coming"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "listing": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "customer": "64f1a2b3c4d5e6f7a8b9c0d1",
    "items": [...],
    "totalEstimatedWeight": 7,
    "totalEstimatedValue": 84,
    "status": "pending",
    "preferredDate": "2024-11-20T00:00:00.000Z",
    "preferredTimeSlot": "morning",
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

---

### GET `/api/scrap/my-listings`
Get all scrap listings created by the authenticated customer.

**Auth required:** Yes (`customer`)

**Response:**
```json
{
  "success": true,
  "listings": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
      "items": [...],
      "totalEstimatedWeight": 7,
      "totalEstimatedValue": 84,
      "status": "completed",
      "preferredDate": "2024-11-20T00:00:00.000Z",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

---

## 3. Pickup Routes (`/api/pickups`)

### POST `/api/pickups`
Create a pickup request from a scrap listing.

**Auth required:** Yes (`customer`)

**Request Body:**
```json
{
  "listing": "64f1a2b3c4d5e6f7a8b9c0d5",
  "scheduledDate": "2024-11-20",
  "timeSlot": "morning"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pickup request created",
  "pickup": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "listing": "64f1a2b3c4d5e6f7a8b9c0d5",
    "customer": "64f1a2b3c4d5e6f7a8b9c0d1",
    "scheduledDate": "2024-11-20T00:00:00.000Z",
    "timeSlot": "morning",
    "status": "pending",
    "createdAt": "2024-11-15T10:00:00.000Z"
  }
}
```

---

### GET `/api/pickups/my-pickups`
Get all pickup requests for the authenticated customer.

**Auth required:** Yes (`customer`)

**Response:**
```json
{
  "success": true,
  "pickups": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
      "listing": { "_id": "...", "totalEstimatedWeight": 7 },
      "agent": { "_id": "...", "name": "Ravi Kumar", "phone": "9123456789" },
      "scheduledDate": "2024-11-20T00:00:00.000Z",
      "status": "confirmed",
      "actualWeight": null
    }
  ]
}
```

---

### GET `/api/pickups/agent-pickups`
Get all pickups assigned to the authenticated agent.

**Auth required:** Yes (`agent`)

**Response:**
```json
{
  "success": true,
  "pickups": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
      "customer": { "name": "John Doe", "phone": "9876543210" },
      "listing": { "totalEstimatedWeight": 7, "pickupAddress": {...} },
      "scheduledDate": "2024-11-20T00:00:00.000Z",
      "status": "confirmed"
    }
  ]
}
```

---

### GET `/api/pickups/:id`
Get a single pickup request by ID.

**Auth required:** Yes (customer who owns it, or assigned agent, or admin)

**Response:**
```json
{
  "success": true,
  "pickup": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "listing": {...},
    "customer": { "name": "John Doe", "email": "john@example.com" },
    "agent": { "name": "Ravi Kumar" },
    "scheduledDate": "2024-11-20T00:00:00.000Z",
    "timeSlot": "morning",
    "status": "in_progress",
    "actualWeight": null,
    "actualValue": null
  }
}
```

---

### PUT `/api/pickups/:id/status`
Update the status of a pickup request.

**Auth required:** Yes (`agent` or `admin`)

**Request Body:**
```json
{
  "status": "in_progress"
}
```

Valid statuses: `pending`, `confirmed`, `in_progress`, `collected`, `completed`, `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Pickup status updated",
  "pickup": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "status": "in_progress"
  }
}
```

---

### PUT `/api/pickups/:id/weight`
Record actual weighed quantity after collection.

**Auth required:** Yes (`agent`)

**Request Body:**
```json
{
  "actualWeight": 6.5,
  "weightBreakdown": [
    { "category": "64f1a2b3c4d5e6f7a8b9c0d3", "weight": 4.5 },
    { "category": "64f1a2b3c4d5e6f7a8b9c0d4", "weight": 2.0 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Weight recorded and payment initiated",
  "pickup": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "actualWeight": 6.5,
    "actualValue": 78,
    "status": "collected"
  }
}
```

---

## 4. Admin Routes (`/api/admin`)

> All admin routes require `Authorization: Bearer <token>` with `role: admin`.

### GET `/api/admin/dashboard`
Retrieve aggregated platform statistics.

**Auth required:** Yes (`admin`)

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 142,
    "totalCustomers": 120,
    "totalAgents": 20,
    "totalPickups": 310,
    "pendingPickups": 15,
    "completedPickups": 280,
    "totalRevenue": 125400,
    "totalScrapCollected": 1850.5,
    "recentPickups": [...],
    "topCategories": [...]
  }
}
```

---

### GET `/api/admin/users`
List all users with optional role filter.

**Auth required:** Yes (`admin`)

**Query Params:** `?role=customer&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "2024-11-01T10:00:00.000Z"
    }
  ],
  "total": 142,
  "page": 1,
  "pages": 8
}
```

---

### GET `/api/admin/categories`
List all scrap categories (including inactive).

**Auth required:** Yes (`admin`)

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "name": "Newspapers & Books",
      "pricePerKg": 12,
      "isActive": true
    }
  ]
}
```

---

### POST `/api/admin/categories`
Create a new scrap category.

**Auth required:** Yes (`admin`)

**Request Body:**
```json
{
  "name": "E-Waste",
  "description": "Old electronics and gadgets",
  "pricePerKg": 50,
  "unit": "kg",
  "acceptedMaterials": ["Phones", "Laptops", "Cables"],
  "conditionRequirements": "No broken CRT screens"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created",
  "category": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "name": "E-Waste",
    "pricePerKg": 50
  }
}
```

---

### PUT `/api/admin/categories/:id/price`
Update the per-kg price for a category.

**Auth required:** Yes (`admin`)

**Request Body:**
```json
{
  "pricePerKg": 55
}
```

**Response:**
```json
{
  "success": true,
  "message": "Price updated",
  "category": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "name": "E-Waste",
    "pricePerKg": 55
  }
}
```

---

### GET `/api/admin/pickups`
List all pickups with optional status filter.

**Auth required:** Yes (`admin`)

**Query Params:** `?status=pending&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "pickups": [...],
  "total": 310,
  "page": 1
}
```

---

### PUT `/api/admin/pickups/:id/assign`
Assign an agent to a pickup request.

**Auth required:** Yes (`admin`)

**Request Body:**
```json
{
  "agentId": "64f1a2b3c4d5e6f7a8b9c0d8"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Agent assigned successfully",
  "pickup": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "agent": "64f1a2b3c4d5e6f7a8b9c0d8",
    "status": "confirmed"
  }
}
```

---

### GET `/api/admin/transactions`
List all wallet transactions across all users.

**Auth required:** Yes (`admin`)

**Query Params:** `?type=credit&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
      "user": { "name": "John Doe", "email": "john@example.com" },
      "type": "credit",
      "amount": 78,
      "description": "Scrap pickup #64f1...c0d6 completed",
      "createdAt": "2024-11-20T12:00:00.000Z"
    }
  ],
  "total": 450
}
```

---

### GET `/api/admin/feedback`
List all feedback submissions.

**Auth required:** Yes (`admin`)

**Response:**
```json
{
  "success": true,
  "feedback": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0da",
      "customer": { "name": "John Doe" },
      "pickup": { "_id": "64f1a2b3c4d5e6f7a8b9c0d6" },
      "rating": 5,
      "comment": "Great service, very punctual!",
      "createdAt": "2024-11-20T13:00:00.000Z"
    }
  ]
}
```

---

## 5. Partner Routes (`/api/partners`)

### POST `/api/partners`
Register a new recycling partner.

**Auth required:** Yes (`admin`)

**Request Body:**
```json
{
  "name": "EcoRecycle Pvt Ltd",
  "email": "contact@ecorecycle.com",
  "phone": "9000000002",
  "address": {
    "street": "Industrial Area, Phase 2",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560058"
  },
  "acceptedCategories": ["64f1a2b3c4d5e6f7a8b9c0d3", "64f1a2b3c4d5e6f7a8b9c0d7"],
  "licenseNumber": "KA-RC-2024-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partner created",
  "partner": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0db",
    "name": "EcoRecycle Pvt Ltd",
    "isVerified": false
  }
}
```

---

### GET `/api/partners`
List all recycling partners.

**Auth required:** Yes (`admin`)

**Response:**
```json
{
  "success": true,
  "partners": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0db",
      "name": "EcoRecycle Pvt Ltd",
      "email": "contact@ecorecycle.com",
      "isVerified": true,
      "acceptedCategories": [...]
    }
  ]
}
```

---

### PUT `/api/partners/:id/verify`
Verify or unverify a recycling partner.

**Auth required:** Yes (`admin`)

**Request Body:**
```json
{
  "isVerified": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partner verification status updated",
  "partner": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0db",
    "name": "EcoRecycle Pvt Ltd",
    "isVerified": true
  }
}
```

---

### POST `/api/partners/:id/bulk-orders`
Create a bulk order from collected scrap to a recycling partner.

**Auth required:** Yes (`admin`)

**Request Body:**
```json
{
  "category": "64f1a2b3c4d5e6f7a8b9c0d3",
  "totalWeight": 500,
  "pricePerKg": 10,
  "pickups": ["64f1a2b3c4d5e6f7a8b9c0d6", "..."]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk order created",
  "order": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0dc",
    "partner": "64f1a2b3c4d5e6f7a8b9c0db",
    "category": "64f1a2b3c4d5e6f7a8b9c0d3",
    "totalWeight": 500,
    "totalValue": 5000,
    "status": "pending"
  }
}
```

---

## 6. Payment Routes (`/api/payments`)

### POST `/api/payments`
Create a payment / credit wallet after pickup completion.

**Auth required:** Yes (`agent` or `admin`)

**Request Body:**
```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "pickupId": "64f1a2b3c4d5e6f7a8b9c0d6",
  "amount": 78,
  "type": "credit",
  "description": "Payment for scrap pickup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed",
  "transaction": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
    "user": "64f1a2b3c4d5e6f7a8b9c0d1",
    "amount": 78,
    "type": "credit",
    "balance": 78
  }
}
```

---

### GET `/api/payments/history`
Get the authenticated user's transaction history.

**Auth required:** Yes (any role)

**Query Params:** `?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
      "type": "credit",
      "amount": 78,
      "description": "Scrap pickup payment",
      "createdAt": "2024-11-20T12:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1
}
```

---

### GET `/api/payments/wallet`
Get the authenticated user's current wallet balance.

**Auth required:** Yes (any role)

**Response:**
```json
{
  "success": true,
  "wallet": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0dd",
    "user": "64f1a2b3c4d5e6f7a8b9c0d1",
    "balance": 350.50,
    "totalEarned": 428.00,
    "totalWithdrawn": 77.50
  }
}
```

---

### POST `/api/payments/withdraw`
Request a wallet withdrawal.

**Auth required:** Yes (`customer`)

**Request Body:**
```json
{
  "amount": 200,
  "bankDetails": {
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank of India"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal request submitted. It will be processed within 2-3 business days.",
  "transaction": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0de",
    "type": "debit",
    "amount": 200,
    "status": "pending",
    "createdAt": "2024-11-20T14:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return a consistent error format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

| HTTP Status | Meaning |
|---|---|
| `200` | OK – Request succeeded |
| `201` | Created – Resource created |
| `400` | Bad Request – Validation error |
| `401` | Unauthorized – Missing or invalid token |
| `403` | Forbidden – Insufficient role permissions |
| `404` | Not Found – Resource does not exist |
| `500` | Internal Server Error |
