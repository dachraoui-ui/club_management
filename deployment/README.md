# Docker Deployment for Club Management System

## Quick Start

### 1. Setup Environment Variables
```bash
cd deployment

# Copy the example environment file
cp .env.example .env

# Edit .env and update the values (especially secrets for production)
```

### 2. Build and Run with Docker Compose
```bash
cd deployment

# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432

## Individual Docker Commands

### Build Images Separately

**Backend:**
```bash
# From project root
docker build -f deployment/backend.Dockerfile -t clubchamp-backend .
```

**Frontend:**
```bash
# From project root
docker build -f deployment/frontend.Dockerfile -t clubchamp-frontend .
```

### Run Containers Separately

**Backend (requires external PostgreSQL):**
```bash
docker run -d \
  --name clubchamp-backend \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  clubchamp-backend
```

**Frontend:**
```bash
docker run -d \
  --name clubchamp-frontend \
  -p 3000:80 \
  clubchamp-frontend
```

## Database Management

### Run Migrations
```bash
cd deployment
docker-compose exec backend npx prisma migrate deploy
```

### Seed Database
```bash
cd deployment
docker-compose exec backend node prisma/seed.js
```

### Access Database Shell
```bash
cd deployment
docker-compose exec postgres psql -U clubchamp -d clubchamp
```

### Reset Database
```bash
cd deployment
docker-compose down -v  # This removes volumes (all data!)
docker-compose up -d --build
```

## Production Deployment

### Important Security Steps:
1. Change all default passwords in `.env`
2. Use strong, unique JWT secrets
3. Set proper CORS origins
4. Consider using Docker secrets for sensitive data
5. Use HTTPS in production (configure nginx or use a reverse proxy)

### Build for Production
```bash
cd deployment

# Build with production optimizations
docker-compose build

# Start services
docker-compose up -d
```

## Troubleshooting

### View Container Logs
```bash
cd deployment
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Restart a Service
```bash
cd deployment
docker-compose restart backend
```

### Rebuild a Single Service
```bash
cd deployment
docker-compose up -d --build backend
```

### Check Container Health
```bash
cd deployment
docker-compose ps
docker inspect clubchamp-backend
```

### Common Issues

1. **Database connection failed**: Wait for PostgreSQL to be healthy before backend starts
2. **Frontend can't reach backend**: Check CORS_ORIGIN and VITE_API_URL settings
3. **Migrations not running**: Ensure DATABASE_URL is correct and database is accessible

## File Structure

```
deployment/
├── backend.Dockerfile    # Backend Docker image
├── frontend.Dockerfile   # Frontend Docker image (multi-stage)
├── docker-compose.yml    # Orchestrate all services
├── nginx.conf            # Nginx configuration for frontend
├── .env.example          # Example environment variables
└── README.md             # This file
```
