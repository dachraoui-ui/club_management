# Deployment Guide - Club Management System

This guide explains how to deploy the application to production using free tier services.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │────▶│  Railway/Render │────▶│ Supabase/Neon   │
│   (Frontend)    │     │   (Backend)     │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Step 1: Deploy Database (Supabase - Free)

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to **Settings > Database**
4. Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Save this URL for the backend deployment

### Option B: Neon (Alternative)

1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from the dashboard

---

## Step 2: Deploy Backend (Railway - Free)

### Using Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub

2. Click **"New Project"** > **"Deploy from GitHub repo"**

3. Select your repository and choose the `backend` folder

4. Add these **Environment Variables** in Railway:
   ```
   DATABASE_URL=postgresql://... (from Supabase)
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-app.vercel.app
   NODE_ENV=production
   PORT=5000
   ```

5. Set the **Root Directory** to `backend`

6. Set the **Start Command** to:
   ```
   npx prisma migrate deploy && node src/server.js
   ```

7. Railway will give you a URL like `https://your-app.up.railway.app`

8. **Run database seed** (one time):
   - In Railway, go to your service
   - Open the **Shell** tab
   - Run: `node prisma/seed.js`

### Alternative: Using Render

1. Go to [render.com](https://render.com) and sign in

2. Click **"New +"** > **"Web Service"**

3. Connect your GitHub repository

4. Configure:
   - **Name**: clubchamp-backend
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && node src/server.js`

5. Add the same environment variables as Railway

6. Click **"Create Web Service"**

---

## Step 3: Deploy Frontend (Vercel - Free)

### Method 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. From project root, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project? **No**
   - Project name: **clubchamp-ui**
   - Directory: **./**: **Yes**
   - Override settings? **No**

4. Add environment variable in Vercel Dashboard:
   - Go to your project > **Settings** > **Environment Variables**
   - Add:
     ```
     VITE_API_URL=https://your-backend.up.railway.app/api
     ```

5. Redeploy:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard (Easier)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub

2. Click **"Add New..."** > **"Project"**

3. Import your GitHub repository

4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root, NOT backend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```

6. Click **"Deploy"**

---

## Step 4: Update CORS (Important!)

After getting your Vercel URL, update the backend's CORS settings:

1. In Railway/Render, update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```

2. Or update multiple origins in `backend/src/server.js`:
   ```javascript
   const allowedOrigins = [
     config.cors.origin,
     'https://your-app.vercel.app',
     'https://clubchamp-ui.vercel.app',
   ];
   ```

---

## Step 5: Test Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`

2. Login with:
   - **Email**: admin@clubchamp.com
   - **Password**: password123

---

## Environment Variables Summary

### Backend (Railway/Render)
| Variable | Value |
|----------|-------|
| DATABASE_URL | `postgresql://...` (from Supabase) |
| JWT_SECRET | Random 32+ char string |
| JWT_EXPIRES_IN | `24h` |
| JWT_REFRESH_SECRET | Random 32+ char string |
| JWT_REFRESH_EXPIRES_IN | `7d` |
| CORS_ORIGIN | `https://your-app.vercel.app` |
| NODE_ENV | `production` |
| PORT | `5000` |

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| VITE_API_URL | `https://your-backend.up.railway.app/api` |

---

## Troubleshooting

### CORS Errors
- Make sure `CORS_ORIGIN` in backend matches your Vercel URL exactly
- No trailing slash in the URL

### Database Connection Failed
- Check `DATABASE_URL` is correct
- Make sure SSL is enabled (add `?sslmode=require` if needed)

### Build Fails on Vercel
- Check that `vercel.json` exists in root
- Make sure `backend` folder is excluded from frontend build

### API Not Reachable
- Verify backend is running (check Railway/Render logs)
- Check `VITE_API_URL` is set correctly in Vercel

---

## Cost (Free Tiers)

| Service | Free Tier |
|---------|-----------|
| Vercel | Unlimited for hobby projects |
| Railway | $5 credit/month (plenty for small apps) |
| Render | 750 hours/month free |
| Supabase | 500MB database, unlimited API |
| Neon | 3GB storage, 1 compute |

---

## Quick Reference

After deployment, your URLs will be:
- **Frontend**: `https://clubchamp-ui.vercel.app`
- **Backend**: `https://clubchamp-backend.up.railway.app`
- **API**: `https://clubchamp-backend.up.railway.app/api`
