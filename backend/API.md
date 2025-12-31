# API Documentation

Complete API documentation for ClubChamp Backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sportclub.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@sportclub.com",
      "role": "Admin",
      ...
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Register (Admin only)
```http
POST /api/auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Athlete",
  "phone": "+1234567890"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}
```

#### Change Password
```http
PATCH /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Members

#### Get All Members
```http
GET /api/members?page=1&limit=10&search=john&status=Active&membershipType=Premium
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in name/email
- `status` - Filter by status (Active, Inactive, Pending)
- `membershipType` - Filter by membership type (Basic, Premium, Elite)

#### Get Member by ID
```http
GET /api/members/:id
Authorization: Bearer <token>
```

#### Create Member
```http
POST /api/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "member@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": "123 Main St",
  "emergencyContact": "+1234567891",
  "dateOfBirth": "1990-05-15",
  "sports": ["Football", "Basketball"],
  "membershipType": "Premium"
}
```

#### Update Member
```http
PUT /api/members/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Updated",
  "phone": "+1234567890"
}
```

#### Delete Member
```http
DELETE /api/members/:id
Authorization: Bearer <token>
```

### Subscriptions

#### Get All Subscriptions
```http
GET /api/subscriptions?page=1&limit=10&userId=...&status=Active&type=Premium
Authorization: Bearer <token>
```

#### Get Subscription by ID
```http
GET /api/subscriptions/:id
Authorization: Bearer <token>
```

#### Create Subscription
```http
POST /api/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "...",
  "type": "Premium",
  "status": "Active",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2025-01-01T00:00:00Z",
  "price": 150,
  "autoRenewal": true
}
```

#### Renew Subscription
```http
PATCH /api/subscriptions/:id/renew
Authorization: Bearer <token>
```

### Teams

#### Get All Teams
```http
GET /api/teams?search=thunder
Authorization: Bearer <token>
```

#### Get Team by ID
```http
GET /api/teams/:id
Authorization: Bearer <token>
```

#### Create Team
```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Thunder FC",
  "discipline": "Football",
  "coachId": "..."
}
```

#### Add Member to Team
```http
POST /api/teams/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "..."
}
```

#### Remove Member from Team
```http
DELETE /api/teams/:id/members/:userId
Authorization: Bearer <token>
```

### Training Sessions

#### Get All Trainings
```http
GET /api/trainings?status=Scheduled&dateFrom=2024-02-01&dateTo=2024-02-28&coachId=...
Authorization: Bearer <token>
```

#### Get Training by ID
```http
GET /api/trainings/:id
Authorization: Bearer <token>
```

#### Create Training
```http
POST /api/trainings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Football Practice",
  "date": "2024-02-10T00:00:00Z",
  "time": "09:00",
  "duration": "2 hours",
  "discipline": "Football",
  "coachId": "...",
  "location": "Main Field",
  "maxCapacity": 25,
  "status": "Scheduled",
  "notes": "Optional notes"
}
```

#### Mark Attendance
```http
POST /api/trainings/:id/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "athleteId": "...",
  "status": "Present"
}
```

#### Get Attendance List
```http
GET /api/trainings/:id/attendance
Authorization: Bearer <token>
```

### Events

#### Get All Events
```http
GET /api/events?type=Tournament&status=Upcoming&dateFrom=2024-02-01&dateTo=2024-02-28
Authorization: Bearer <token>
```

#### Get Event by ID
```http
GET /api/events/:id
Authorization: Bearer <token>
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Annual Sports Day",
  "description": "Our biggest event of the year",
  "date": "2024-03-15T00:00:00Z",
  "time": "08:00",
  "type": "Tournament",
  "location": "Main Sports Complex",
  "capacity": 500,
  "status": "Upcoming"
}
```

#### Register for Event
```http
POST /api/events/:id/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "..." // Optional, defaults to authenticated user
}
```

#### Unregister from Event
```http
DELETE /api/events/:id/participants/:userId
Authorization: Bearer <token>
```

#### Update Participant Result
```http
PATCH /api/events/:id/participants/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "result": "1st Place"
}
```

### Finance

#### Get All Payments
```http
GET /api/finance/payments?page=1&limit=10&memberId=...&status=Paid&type=Membership
Authorization: Bearer <token>
```

#### Record Payment
```http
POST /api/finance/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "memberId": "...",
  "amount": 150,
  "status": "Paid",
  "type": "Membership",
  "method": "Card",
  "date": "2024-02-01T00:00:00Z"
}
```

#### Get All Expenses
```http
GET /api/finance/expenses?page=1&limit=10&category=Equipment&dateFrom=2024-01-01&dateTo=2024-01-31
Authorization: Bearer <token>
```

#### Record Expense
```http
POST /api/finance/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Equipment purchase",
  "amount": 5000,
  "category": "Equipment",
  "date": "2024-01-15T00:00:00Z"
}
```

#### Get All Sponsors
```http
GET /api/finance/sponsors?status=Active&tier=Gold
Authorization: Bearer <token>
```

#### Add Sponsor
```http
POST /api/finance/sponsors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "SportTech Inc.",
  "amount": 50000,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T00:00:00Z",
  "status": "Active",
  "tier": "Gold",
  "logo": "https://example.com/logo.png"
}
```

### Statistics

#### Dashboard Statistics
```http
GET /api/stats/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMembers": 248,
    "activeTeams": 8,
    "upcomingTrainings": 12,
    "eventsThisMonth": 4,
    "monthlyRevenue": 45680,
    "memberGrowth": 12.5,
    "revenueGrowth": 8.3
  }
}
```

#### Athlete Statistics
```http
GET /api/stats/athletes
Authorization: Bearer <token>
```

#### Financial Statistics
```http
GET /api/stats/finance
Authorization: Bearer <token>
```

#### Membership Distribution
```http
GET /api/stats/membership
Authorization: Bearer <token>
```

#### Sports Distribution
```http
GET /api/stats/sports
Authorization: Bearer <token>
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Rate Limiting

- Auth endpoints: 5 requests per 15 minutes per IP
- Other endpoints: 100 requests per 15 minutes per IP

