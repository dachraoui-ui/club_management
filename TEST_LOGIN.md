# Testing Login - Step by Step

Since your backend health check works, let's test the login endpoint directly.

## Step 1: Check Backend is Running

Open browser: `http://localhost:5000/health`
- Should show: `{"status":"ok","message":"Server is running"}`

## Step 2: Test Login Endpoint Directly

Open browser console (F12) and run:

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@sportclub.com',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Step 3: Check Browser Console

When you try to login from the frontend:
1. Open browser console (F12)
2. Go to "Network" tab
3. Try to login
4. Look for the request to `/api/auth/login`
5. Check:
   - Status code (200 = success, 401 = wrong credentials, 0 = network error)
   - Response body
   - CORS errors (red text)

## Common Issues

### CORS Error in Console
**Symptom:** Red error about CORS policy

**Fix:** 
1. Make sure backend/.env has: `FRONTEND_URL=http://localhost:8080`
2. **Restart backend server** after changing .env
3. Check backend terminal shows: `🌐 CORS enabled for: http://localhost:8080`

### Network Error (Status 0)
**Symptom:** Request fails with no response

**Possible causes:**
- Backend not running
- Wrong API URL
- Firewall blocking

**Fix:**
- Verify backend is running: `http://localhost:5000/health`
- Check frontend .env: `VITE_API_URL=http://localhost:5000/api`
- Restart frontend after changing .env

### 401 Unauthorized
**Symptom:** Status 401, "Invalid email or password"

**Fix:**
- Make sure database is seeded: `cd backend && npm run db:seed`
- Use correct credentials:
  - Email: `admin@sportclub.com`
  - Password: `admin123`

### 500 Internal Server Error
**Symptom:** Status 500, server error

**Fix:**
- Check backend terminal for error messages
- Verify database connection
- Check DATABASE_URL in backend/.env

## Quick Test Commands

### Test from PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@sportclub.com","password":"admin123"}' | Select-Object -ExpandProperty Content
```

### Check if backend sees the request:
Look at your backend terminal - you should see the request logged when you try to login.

