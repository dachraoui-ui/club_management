#!/usr/bin/env node

/**
 * Environment Setup Script
 * Creates .env files for frontend and backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backend .env content
const backendEnv = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
# Replace with your PostgreSQL connection string
# Format: postgresql://username:password@host:port/database?schema=public
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clubchamp_db?schema=public"

# JWT Secrets
# ⚠️ IMPORTANT: Change these to strong, random secrets in production!
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-in-production-min-32-chars

# JWT Token Expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS - Frontend URL
# Update this to match your frontend URL (Vite default is port 8080)
FRONTEND_URL=http://localhost:8080

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10
`;

// Frontend .env content
const frontendEnv = `# Frontend Environment Variables
# Vite requires VITE_ prefix for environment variables

# Backend API URL
# Update this to match your backend server URL
VITE_API_URL=http://localhost:5000/api

# Optional: App Configuration
VITE_APP_NAME=ClubChamp
VITE_APP_VERSION=1.0.0
`;

// Create backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExamplePath = path.join(__dirname, 'backend', '.env.example');

if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Created backend/.env');
} else {
  console.log('⚠️  backend/.env already exists, skipping...');
}

if (!fs.existsSync(backendEnvExamplePath)) {
  fs.writeFileSync(backendEnvExamplePath, backendEnv);
  console.log('✅ Created backend/.env.example');
}

// Create frontend .env
const frontendEnvPath = path.join(__dirname, '.env');
const frontendEnvExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Created .env (frontend)');
} else {
  console.log('⚠️  .env (frontend) already exists, skipping...');
}

if (!fs.existsSync(frontendEnvExamplePath)) {
  fs.writeFileSync(frontendEnvExamplePath, frontendEnv);
  console.log('✅ Created .env.example (frontend)');
}

console.log('\n📝 Next steps:');
console.log('1. Edit backend/.env and update DATABASE_URL with your PostgreSQL credentials');
console.log('2. Edit backend/.env and generate strong JWT_SECRET and JWT_REFRESH_SECRET');
console.log('3. Edit .env and verify VITE_API_URL matches your backend URL');
console.log('\n💡 See ENV_SETUP.md for detailed instructions');

