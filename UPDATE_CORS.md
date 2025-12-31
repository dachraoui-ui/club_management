# Update CORS for Port 8081

Your frontend is running on port **8081**, but the backend CORS was configured for port 8080.

## What I Fixed

✅ Updated `backend/src/server.js` to allow port 8081 in CORS
✅ Updated default CORS origin in `backend/src/config/env.js`

## What You Need to Do

### Update Backend .env File

Edit `backend/.env` and change this line:

**From:**
```env
FRONTEND_URL=http://localhost:8080
```

**To:**
```env
FRONTEND_URL=http://localhost:8081
```

### Restart Backend Server

**Important:** After updating `.env`, you MUST restart the backend:

1. Stop backend (Ctrl+C in backend terminal)
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```

You should see:
```
🚀 Server running on port 5000
🌐 CORS enabled for: http://localhost:8081
```

### Verify Frontend .env

Make sure your frontend `.env` (in root directory) has:
```env
VITE_API_URL=http://localhost:5000/api
```

## Test Login Again

After restarting the backend:
1. Go to `http://localhost:8081`
2. Try logging in with:
   - Email: `admin@sportclub.com`
   - Password: `admin123`

It should work now! 🎉

## If Still Not Working

Check browser console (F12) → Network tab → Look for the login request:
- If you see CORS error → Backend not restarted or wrong FRONTEND_URL
- If you see 401 → Wrong credentials or database not seeded
- If you see 500 → Check backend terminal for errors

