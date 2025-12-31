# Quick Fix: Network Error on Login

## The Issue
You're getting "Network error" when trying to sign in. This means the frontend can't reach the backend API.

## Solution (3 Steps)

### Step 1: Start the Backend Server

Open a **new terminal window** and run:

```bash
cd backend
npm run dev
```

**You should see:**
```
🚀 Server running on port 5000
📝 Environment: development
🌐 CORS enabled for: http://localhost:8080
```

**If you see errors:**
- Database connection error → Check PostgreSQL is running
- Port already in use → Change PORT in backend/.env
- Missing .env variables → Check backend/.env file

### Step 2: Verify Backend is Running

Open your browser and go to:
```
http://localhost:5000/health
```

**Should show:**
```json
{"status":"ok","message":"Server is running"}
```

If this doesn't work → Backend is not running!

### Step 3: Restart Frontend (if you changed .env)

If you just created/updated `.env`, restart the frontend:

```bash
# Stop frontend (Ctrl+C)
# Then restart:
npm run dev
```

## Common Issues

### ❌ Backend Not Running
**Symptom:** Network error, can't reach http://localhost:5000

**Fix:** Start backend server (Step 1 above)

### ❌ Database Not Connected
**Symptom:** Backend crashes on startup with database error

**Fix:**
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in backend/.env is correct
3. Create database: `createdb clubchamp_db` (if needed)

### ❌ Wrong Port
**Symptom:** Backend runs but frontend can't connect

**Fix:**
- Check backend runs on port 5000
- Check frontend .env has: `VITE_API_URL=http://localhost:5000/api`
- Check backend .env has: `FRONTEND_URL=http://localhost:8080`

### ❌ CORS Error
**Symptom:** Browser console shows CORS error

**Fix:**
- Make sure backend/.env has: `FRONTEND_URL=http://localhost:8080`
- Restart backend after changing .env

## Test It

1. Backend running? → http://localhost:5000/health
2. Frontend running? → http://localhost:8080
3. Try login with:
   - Email: `admin@sportclub.com`
   - Password: `admin123`

## Still Not Working?

1. **Check browser console (F12)** - Look for detailed error
2. **Check backend terminal** - Look for error messages
3. **Verify both are running** - You need TWO terminals:
   - Terminal 1: Backend (`cd backend && npm run dev`)
   - Terminal 2: Frontend (`npm run dev`)

