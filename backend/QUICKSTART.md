# Quick Start Guide

Get the backend up and running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database running
- npm or yarn

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/clubchamp_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-change-in-production"
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Step 3: Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Seed database with admin user and sample data
npm run db:seed
```

## Step 4: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Step 5: Test the API

### Option 1: Use the provided requests.http file

Open `requests.http` in VS Code with the REST Client extension and test endpoints.

### Option 2: Use curl

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sportclub.com","password":"admin123"}'
```

## Default Credentials

After seeding:
- **Email:** `admin@sportclub.com`
- **Password:** `admin123`

⚠️ **Change these in production!**

## Next Steps

1. Test all endpoints using `requests.http`
2. Connect your React frontend (see `FRONTEND_INTEGRATION.md`)
3. Review API documentation in `API.md`

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Ensure database exists

### Port Already in Use
- Change PORT in `.env` to a different port
- Or stop the process using port 5000

### Migration Errors
- Make sure database is empty or use `npx prisma migrate reset` (⚠️ deletes all data)
- Check Prisma schema for syntax errors

### CORS Errors
- Ensure FRONTEND_URL in `.env` matches your frontend URL
- Check browser console for specific CORS error messages

## Useful Commands

```bash
# Development server with auto-reload
npm run dev

# Production server
npm start

# View database in Prisma Studio
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration
│   ├── controllers/  # Request handlers
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── middlewares/  # Express middlewares
│   └── utils/        # Utilities
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.js       # Seed script
└── package.json
```

## Need Help?

- Check `API.md` for endpoint documentation
- Review `FRONTEND_INTEGRATION.md` for frontend setup
- See `README.md` for detailed information

