# Troubleshooting Network Error on Login

## The Problem
You're seeing "Network error. Please check your connection." when trying to sign in.

## Common Causes & Solutions

### 1. Backend Server Not Running ⚠️ MOST COMMON

**Check:**
- Is the backend server running?
- Open a terminal and check if you see: `🚀 Server running on port 5000`

**Solution:**
```bash
# Open a new terminal
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📝 Environment: development
🌐 CORS enabled for: http://localhost:8080
```

### 2. Missing Frontend .env File

**Check:**
- Do you have a `.env` file in the root directory?

**Solution:**
Create `.env` in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Then restart your frontend dev server.

### 3. Backend .env Configuration

**Check:**
- Does `backend/.env` exist?
- Is `FRONTEND_URL` set correctly?

**Solution:**
Make sure `backend/.env` has:
```env
FRONTEND_URL=http://localhost:8080
```

Your frontend runs on port 8080 (from vite.config.ts), so CORS must allow this.

### 4. Database Not Connected

**Check:**
- Is PostgreSQL running?
- Is DATABASE_URL correct in `backend/.env`?

**Solution:**
```bash
cd backend
# Check if database connection works
npm run db:studio
```

### 5. Port Conflicts

**Check:**
- Is port 5000 already in use?
- Is port 8080 already in use?

**Solution:**
- Change backend port in `backend/.env`: `PORT=5001`
- Update frontend `.env`: `VITE_API_URL=http://localhost:5001/api`

## Quick Fix Checklist

1. ✅ Backend server running? → `cd backend && npm run dev`
2. ✅ Frontend .env exists? → Create `.env` with `VITE_API_URL=http://localhost:5000/api`
3. ✅ Backend .env has FRONTEND_URL? → Set `FRONTEND_URL=http://localhost:8080`
4. ✅ Database connected? → Check PostgreSQL is running
5. ✅ Restart both servers after .env changes

## Test Backend Connection

Open browser and go to:
```
http://localhost:5000/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

If this doesn't work, the backend isn't running!

## Still Not Working?

1. Check browser console (F12) for detailed error messages
2. Check backend terminal for error logs
3. Verify both servers are running in separate terminals
4. Make sure no firewall is blocking localhost connections

