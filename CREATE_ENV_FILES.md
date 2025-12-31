# Create .env Files

Since `.env` files are gitignored, you need to create them manually. Here are two ways to do it:

## Method 1: Using the Setup Script (Recommended)

Run this command in the root directory:

```bash
npm run setup:env
```

This will automatically create:
- `backend/.env`
- `backend/.env.example`
- `.env` (frontend)
- `.env.example` (frontend)

## Method 2: Manual Creation

### Backend .env File

1. Create `backend/.env` file
2. Copy and paste this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
# Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clubchamp_db?schema=public"

# JWT Secrets
# ⚠️ IMPORTANT: Change these to strong, random secrets in production!
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-in-production-min-32-chars

# JWT Token Expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS - Frontend URL
FRONTEND_URL=http://localhost:8080

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10
```

### Frontend .env File

1. Create `.env` file in the root directory
2. Copy and paste this content:

```env
# Frontend Environment Variables
# Vite requires VITE_ prefix for environment variables

# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Optional: App Configuration
VITE_APP_NAME=ClubChamp
VITE_APP_VERSION=1.0.0
```

## Important: Update These Values

### Backend `.env`:
1. **DATABASE_URL** - Update with your PostgreSQL credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/clubchamp_db?schema=public"
   ```

2. **JWT_SECRET** and **JWT_REFRESH_SECRET** - Generate strong random secrets:
   ```bash
   # Generate a random secret (32+ characters)
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. **FRONTEND_URL** - Should match your frontend URL (default: http://localhost:8080)

### Frontend `.env`:
1. **VITE_API_URL** - Should match your backend URL (default: http://localhost:5000/api)

## Quick Commands

### Windows (PowerShell):
```powershell
# Backend
New-Item -Path "backend\.env" -ItemType File -Force
# Then copy the content above into the file

# Frontend
New-Item -Path ".env" -ItemType File -Force
# Then copy the content above into the file
```

### Linux/Mac:
```bash
# Backend
cat > backend/.env << 'EOF'
# [paste backend .env content here]
EOF

# Frontend
cat > .env << 'EOF'
# [paste frontend .env content here]
EOF
```

## Verify Setup

After creating the files:

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

3. **Test connection:**
   - Backend: http://localhost:5000/health
   - Frontend: http://localhost:8080
   - Login: admin@sportclub.com / admin123

## Need Help?

See `ENV_SETUP.md` for detailed configuration instructions.

