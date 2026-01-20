# Docker Deployment for Club Management System

This guide explains how to deploy the Club Management System using pre-built Docker images.

## Quick Start (Using Docker Images)

### 1. Create docker-compose.yml

Create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: clubchamp-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-clubchamp}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-clubchamp123}
      POSTGRES_DB: ${POSTGRES_DB:-clubchamp}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-clubchamp}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    image: ghcr.io/dachraoui-ui/clubchamp-backend:latest
    container_name: clubchamp-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://${POSTGRES_USER:-clubchamp}:${POSTGRES_PASSWORD:-clubchamp123}@postgres:5432/${POSTGRES_DB:-clubchamp}?schema=public
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-change-in-production}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-24h}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-your-refresh-secret-key-change-in-production}
      JWT_REFRESH_EXPIRES_IN: ${JWT_REFRESH_EXPIRES_IN:-7d}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000}
    ports:
      - "5001:5000"
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "npx prisma migrate deploy && node src/server.js"

  # Frontend
  frontend:
    image: ghcr.io/dachraoui-ui/clubchamp-frontend:latest
    container_name: clubchamp-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Setup Environment Variables

Create a `.env` file in the same directory:

```bash
# Database Configuration
POSTGRES_USER=clubchamp
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=clubchamp

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# API URL (used by frontend)
VITE_API_URL=http://localhost:5001/api
```

### 3. Pull and Run Docker Images

```bash
# Pull the latest images
docker-compose pull

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Database**: localhost:5433

## Using Specific Image Versions

Instead of `latest`, you can use specific version tags:

```yaml
backend:
  image: ghcr.io/dachraoui-ui/clubchamp-backend:v1.0.0

frontend:
  image: ghcr.io/dachraoui-ui/clubchamp-frontend:v1.0.0
```

## Run Containers Individually

### Pull Images
```bash
docker pull ghcr.io/dachraoui-ui/clubchamp-backend:latest
docker pull ghcr.io/dachraoui-ui/clubchamp-frontend:latest
```

### Run Backend (requires external PostgreSQL)
```bash
docker run -d \
  --name clubchamp-backend \
  -p 5001:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret-key-min-32-chars" \
  -e JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars" \
  -e CORS_ORIGIN="http://localhost:3000" \
  ghcr.io/dachraoui-ui/clubchamp-backend:latest
```

### Run Frontend
```bash
docker run -d \
  --name clubchamp-frontend \
  -p 3000:80 \
  ghcr.io/dachraoui-ui/clubchamp-frontend:latest
```

## Database Management

### Run Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Seed Database
```bash
docker-compose exec backend node prisma/seed.js
```

### Access Database Shell
```bash
docker-compose exec postgres psql -U clubchamp -d clubchamp
```

### Reset Database
```bash
docker-compose down -v  # This removes volumes (all data!)
docker-compose up -d
```

## Updating to Latest Images

```bash
# Pull latest images
docker-compose pull

# Recreate containers with new images
docker-compose up -d

# Remove old unused images (optional)
docker image prune -f
```

## Production Deployment

### Important Security Steps:
1. Change all default passwords in `.env`
2. Use strong, unique JWT secrets (minimum 32 characters)
3. Set proper CORS origins for your domain
4. Consider using Docker secrets for sensitive data
5. Use HTTPS in production (configure nginx or use a reverse proxy)

### Production docker-compose.yml Example

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: clubchamp-db
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: ghcr.io/dachraoui-ui/clubchamp-backend:latest
    container_name: clubchamp-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_REFRESH_EXPIRES_IN: ${JWT_REFRESH_EXPIRES_IN}
      CORS_ORIGIN: ${CORS_ORIGIN}
    ports:
      - "5001:5000"
    depends_on:
      postgres:
        condition: service_healthy
    command: >
      sh -c "npx prisma migrate deploy && node src/server.js"

  frontend:
    image: ghcr.io/dachraoui-ui/clubchamp-frontend:latest
    container_name: clubchamp-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Troubleshooting

### View Container Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Restart a Service
```bash
docker-compose restart backend
```

### Check Container Health
```bash
docker-compose ps
docker inspect clubchamp-backend
```

### Common Issues

1. **Database connection failed**: Wait for PostgreSQL to be healthy before backend starts
2. **Frontend can't reach backend**: Check CORS_ORIGIN and ensure backend is running
3. **Migrations not running**: Ensure DATABASE_URL is correct and database is accessible
4. **Image pull failed**: Ensure you have access to the container registry

## Building Images Locally (Development)

If you need to build images locally instead of using pre-built ones:

### Build Backend
```bash
# From project root
docker build -f deployment/backend.Dockerfile -t clubchamp-backend .
```

### Build Frontend
```bash
# From project root
docker build -f deployment/frontend.Dockerfile \
  --build-arg VITE_API_URL=http://localhost:5001/api \
  -t clubchamp-frontend .
```

### Use Local Images in docker-compose.yml
Replace the `image:` lines with `build:` configuration:

```yaml
backend:
  build:
    context: ..
    dockerfile: deployment/backend.Dockerfile

frontend:
  build:
    context: ..
    dockerfile: deployment/frontend.Dockerfile
    args:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:5001/api}
```

## File Structure

```
deployment/
├── backend.Dockerfile    # Backend Docker image definition
├── frontend.Dockerfile   # Frontend Docker image definition (multi-stage)
├── docker-compose.yml    # Orchestrate all services (for local building)
├── nginx.conf            # Nginx configuration for frontend
└── README.md             # This file
```
