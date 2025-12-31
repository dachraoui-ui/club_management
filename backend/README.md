# ClubChamp Backend API

Backend API for Sport Club Management System built with Node.js, Express.js, Prisma ORM, and PostgreSQL.

## Features

- 🔐 JWT Authentication with refresh tokens
- 👥 Role-based access control (Admin, Manager, Coach, Staff, Athlete)
- 📊 Complete CRUD operations for all modules
- 🔒 Secure password hashing with bcrypt
- ✅ Input validation with express-validator
- 🚦 Rate limiting for API protection
- 📈 Statistics and analytics endpoints

## Prerequisites

- Node.js 20+ 
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

3. Set up database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with admin user
npm run db:seed
```

## Running the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Default Admin Credentials

After seeding:
- Email: `admin@sportclub.com`
- Password: `admin123`

**⚠️ Change the default password in production!**

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `PATCH /api/auth/change-password` - Change password

### Members
- `GET /api/members` - Get all members (with pagination, search, filters)
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create member (Admin/Manager)
- `PUT /api/members/:id` - Update member (Admin/Manager)
- `DELETE /api/members/:id` - Delete member (Admin)

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create subscription (Admin/Manager)
- `PUT /api/subscriptions/:id` - Update subscription (Admin/Manager)
- `PATCH /api/subscriptions/:id/renew` - Renew subscription

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team (Admin/Manager)
- `PUT /api/teams/:id` - Update team (Admin/Manager/Coach)
- `DELETE /api/teams/:id` - Delete team (Admin)
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member from team

### Training Sessions
- `GET /api/trainings` - Get all trainings
- `GET /api/trainings/:id` - Get training by ID
- `GET /api/trainings/:id/attendance` - Get attendance list
- `POST /api/trainings` - Create training (Admin/Manager/Coach)
- `PUT /api/trainings/:id` - Update training
- `DELETE /api/trainings/:id` - Delete training
- `POST /api/trainings/:id/attendance` - Mark attendance

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Admin/Manager)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/participants` - Register for event
- `DELETE /api/events/:id/participants/:userId` - Unregister from event
- `PATCH /api/events/:id/participants/:userId` - Update participant result

### Finance
- `GET /api/finance/payments` - Get all payments
- `POST /api/finance/payments` - Record payment
- `GET /api/finance/expenses` - Get all expenses
- `POST /api/finance/expenses` - Record expense
- `GET /api/finance/sponsors` - Get all sponsors
- `POST /api/finance/sponsors` - Add sponsor
- `PUT /api/finance/sponsors/:id` - Update sponsor

### Statistics
- `GET /api/stats/dashboard` - Dashboard statistics
- `GET /api/stats/athletes` - Athlete statistics
- `GET /api/stats/finance` - Financial statistics
- `GET /api/stats/membership` - Membership distribution
- `GET /api/stats/sports` - Sports participation distribution

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

For paginated responses:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Database Management

### Prisma Studio
View and edit database data:
```bash
npm run db:studio
```

### Create Migration
```bash
npm run db:migrate
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Express middlewares
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seed script
└── package.json
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with expiration (access: 15min, refresh: 7 days)
- CORS protection
- Rate limiting on API endpoints
- Input validation on all endpoints
- Role-based authorization
- SQL injection prevention (Prisma)

## License

ISC

