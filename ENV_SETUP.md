# Environment Variables Setup Guide

This guide will help you set up the `.env` files for both frontend and backend.

## Backend Setup

### Step 1: Create Backend .env File

1. Navigate to the `backend` folder
2. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

### Step 2: Configure Backend Environment Variables

Edit `backend/.env` and update the following:

#### Required Variables:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/clubchamp_db?schema=public"
```
**Replace:**
- `username` - Your PostgreSQL username (usually `postgres`)
- `password` - Your PostgreSQL password
- `localhost:5432` - Your database host and port
- `clubchamp_db` - Your database name

#### Security Variables (IMPORTANT):

```env
# Generate strong random secrets for production!
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-in-production-min-32-chars
```

**⚠️ For Production:**
Generate strong random secrets (at least 32 characters):
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Optional Variables:

```env
# Server port (default: 5000)
PORT=5000

# Environment (development/production)
NODE_ENV=development

# Frontend URL for CORS (should match your frontend)
FRONTEND_URL=http://localhost:8080

# JWT expiry times
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Bcrypt salt rounds
BCRYPT_SALT_ROUNDS=10
```

## Frontend Setup

### Step 1: Create Frontend .env File

1. In the root directory (where `package.json` is)
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

### Step 2: Configure Frontend Environment Variables

Edit `.env` and update:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

**Note:** 
- Vite requires the `VITE_` prefix for environment variables
- Update the port if your backend runs on a different port
- For production, use your production API URL

## Quick Setup Commands

### Backend:
```bash
cd backend
cp .env.example .env
# Then edit .env with your database credentials
```

### Frontend:
```bash
cp .env.example .env
# Then edit .env with your API URL
```

## Example Configuration

### Backend `.env` (Development):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/clubchamp_db?schema=public"
JWT_SECRET=dev-secret-key-min-32-characters-long-for-development
JWT_REFRESH_SECRET=dev-refresh-secret-key-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:8080
BCRYPT_SALT_ROUNDS=10
```

### Frontend `.env` (Development):
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ClubChamp
```

## Production Configuration

### Backend Production `.env`:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@db-host:5432/clubchamp_prod?schema=public"
JWT_SECRET=<strong-random-secret-32-chars-min>
JWT_REFRESH_SECRET=<strong-random-secret-32-chars-min>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=https://your-frontend-domain.com
BCRYPT_SALT_ROUNDS=10
```

### Frontend Production `.env`:
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=ClubChamp
```

## Verification

### Backend:
1. Start the server: `cd backend && npm run dev`
2. Check for errors in console
3. Test: `curl http://localhost:5000/health`

### Frontend:
1. Start the dev server: `npm run dev`
2. Check browser console for API connection errors
3. Try logging in with default credentials

## Troubleshooting

### Backend can't connect to database:
- Verify PostgreSQL is running
- Check DATABASE_URL format is correct
- Ensure database exists: `createdb clubchamp_db`

### Frontend can't connect to API:
- Verify backend is running on the correct port
- Check VITE_API_URL matches backend URL
- Check CORS settings in backend `.env` (FRONTEND_URL)

### CORS errors:
- Ensure FRONTEND_URL in backend `.env` matches your frontend URL
- Check both servers are running
- Verify ports match (frontend: 8080, backend: 5000)

## Security Notes

1. **Never commit `.env` files to git** - They're already in `.gitignore`
2. **Use strong secrets in production** - Generate random strings
3. **Keep secrets secure** - Don't share `.env` files
4. **Use different secrets for each environment** - Dev, staging, production

## Next Steps

After setting up `.env` files:

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

2. **Frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Test the connection:**
   - Login with: `admin@sportclub.com` / `admin123`
   - Check browser console for errors

