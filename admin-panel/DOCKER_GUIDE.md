# 🐳 Docker Deployment Guide

This guide explains how to run your Turkish Learning Admin Panel using Docker.

## 📋 Prerequisites

- **Docker**: Install Docker Desktop or Docker Engine
- **Docker Compose**: Usually included with Docker Desktop
- **Git**: For cloning the repository

## 🚀 Quick Start

### **Option 1: Using Docker Compose (Recommended)**

#### **Production Deployment**
```bash
# Start the full stack
docker-compose up -d

# Access the application
open http://localhost:3003
```

#### **Development Mode**
```bash
# Start in development mode with hot reload
docker-compose --profile dev up -d admin-panel-dev

# Access the development server
open http://localhost:3004
```

#### **With Database and Cache**
```bash
# Start with PostgreSQL and Redis
docker-compose up -d admin-panel postgres redis

# Access the application
open http://localhost:3003
```

### **Option 2: Using Docker Commands**

#### **Build and Run Production**
```bash
# Build the image
docker build -t turkish-admin:latest .

# Run the container
docker run -d \
  --name turkish-admin \
  -p 3003:3003 \
  -e NODE_ENV=production \
  turkish-admin:latest

# Access the application
open http://localhost:3003
```

#### **Development with Volume Mounts**
```bash
# Build development image
docker build --target dev -t turkish-admin:dev .

# Run with source code mounted
docker run -d \
  --name turkish-admin-dev \
  -p 3004:3003 \
  -v $(pwd):/app \
  -v /app/node_modules \
  turkish-admin:dev

# Access the development server
open http://localhost:3004
```

### **Option 3: Using Deployment Script**
```bash
# Make script executable
chmod +x scripts/docker-deploy.sh

# Deploy to production
./scripts/docker-deploy.sh production

# Deploy to development
./scripts/docker-deploy.sh development
```

## 🔧 Configuration

### **Environment Variables**

#### **Production Environment**
```bash
NODE_ENV=production
PORT=3003
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_API_URL=http://localhost:3003/api
NEXT_PUBLIC_APP_NAME=Turkish Learning Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### **Development Environment**
```bash
NODE_ENV=development
PORT=3003
NEXT_TELEMETRY_DISABLED=1
```

### **Docker Compose Profiles**

#### **Available Profiles**
- **`default`**: Basic admin panel only
- **`dev`**: Development mode with hot reload
- **`nginx`**: Include Nginx reverse proxy
- **`cache`**: Include Redis cache
- **`database`**: Include PostgreSQL database
- **`monitoring`**: Include Prometheus and Grafana
- **`test`**: Testing environment
- **`load-test`**: Load testing with K6

#### **Using Profiles**
```bash
# Development with database
docker-compose --profile dev --profile database up -d

# Production with monitoring
docker-compose --profile monitoring up -d

# Full stack for testing
docker-compose --profile test --profile database --profile cache up -d
```

## 📊 Available Services

### **Core Services**
- **`admin-panel`**: Main application (port 3003)
- **`admin-panel-dev`**: Development version (port 3004)

### **Infrastructure Services**
- **`postgres`**: PostgreSQL database (port 5432)
- **`redis`**: Redis cache (port 6379)
- **`nginx`**: Reverse proxy (ports 80, 443)

### **Monitoring Services**
- **`prometheus`**: Metrics collection (port 9090)
- **`grafana`**: Dashboards (port 3000)

### **Testing Services**
- **`test-runner`**: Automated testing
- **`k6`**: Load testing

## 🔍 Management Commands

### **Container Management**
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs admin-panel
docker-compose logs -f admin-panel  # Follow logs

# Restart services
docker-compose restart admin-panel

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### **Development Commands**
```bash
# Rebuild and restart
docker-compose up -d --build admin-panel

# Access container shell
docker-compose exec admin-panel sh

# Run commands in container
docker-compose exec admin-panel npm run lint
docker-compose exec admin-panel npm run test
```

### **Database Management**
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U admin -d turkish_learning

# Backup database
docker-compose exec postgres pg_dump -U admin turkish_learning > backup.sql

# Restore database
docker-compose exec -T postgres psql -U admin -d turkish_learning < backup.sql
```

## 🔒 Security Considerations

### **Production Security**
- Change default passwords in docker-compose.yml
- Use secrets management for sensitive data
- Enable SSL/TLS in production
- Restrict network access
- Regular security updates

### **Environment Variables Security**
```bash
# Create .env file for sensitive data
echo "POSTGRES_PASSWORD=your-secure-password" > .env
echo "REDIS_PASSWORD=your-redis-password" >> .env

# Reference in docker-compose.yml
environment:
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

## 📈 Monitoring and Health Checks

### **Health Check Endpoints**
- **Application**: `http://localhost:3003/api/health`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3000` (admin/admin123)

### **Container Health**
```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' turkish-admin-panel
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Port Already in Use**
```bash
# Find process using port
lsof -i :3003

# Kill process
kill -9 <PID>

# Or use different port
docker-compose up -d -p 3005:3003
```

#### **Build Failures**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache admin-panel
```

#### **Container Won't Start**
```bash
# Check logs
docker-compose logs admin-panel

# Check container status
docker-compose ps

# Restart with fresh container
docker-compose down
docker-compose up -d
```

#### **Database Connection Issues**
```bash
# Check database status
docker-compose exec postgres pg_isready -U admin

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### **Performance Issues**
```bash
# Check resource usage
docker stats

# Increase memory limits
docker-compose up -d --memory=2g admin-panel

# Check disk space
docker system df
```

## 🔄 Updates and Maintenance

### **Updating the Application**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build admin-panel
```

### **Database Migrations**
```bash
# Run migrations
docker-compose exec admin-panel npm run migrate

# Seed database
docker-compose exec admin-panel npm run seed
```

### **Backup Strategy**
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U admin turkish_learning > backup_$DATE.sql
docker-compose exec redis redis-cli BGSAVE
EOF

chmod +x backup.sh
```

## 📞 Support

### **Useful Commands for Debugging**
```bash
# Container information
docker inspect turkish-admin-panel

# Resource usage
docker stats turkish-admin-panel

# Network information
docker network ls
docker network inspect turkish-learning-network

# Volume information
docker volume ls
docker volume inspect turkish-postgres-data
```

### **Log Locations**
- **Application logs**: `docker-compose logs admin-panel`
- **Database logs**: `docker-compose logs postgres`
- **Nginx logs**: `./logs/nginx/` (if using nginx profile)

Your Turkish Learning Admin Panel is now ready to run in Docker! 🐳🚀
