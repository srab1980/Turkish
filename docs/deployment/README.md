# Deployment Guide

This guide covers deploying the Turkish Language Learning Platform to production environments.

## Prerequisites

- Docker and Docker Compose
- Kubernetes cluster (optional)
- Domain names and SSL certificates
- Environment variables configured
- Database backups and migration strategy

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with all required environment variables:

```bash
# Database
POSTGRES_DB=turkish_learning
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key

# API Keys
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Domain Configuration
CORS_ORIGIN=https://admin.turkishlearning.com
NEXT_PUBLIC_API_URL=https://api.turkishlearning.com/api/v1
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.turkishlearning.com/api/v1
NEXTAUTH_URL=https://admin.turkishlearning.com
NEXTAUTH_SECRET=your-nextauth-secret

# Monitoring
GRAFANA_ADMIN_PASSWORD=your-grafana-password
GRAFANA_SECRET_KEY=your-grafana-secret
FLOWER_BASIC_AUTH=admin:your-flower-password

# External Services
SENTRY_DSN=your-sentry-dsn
```

### 2. SSL Certificates

Obtain SSL certificates for your domains:

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d api.turkishlearning.com
sudo certbot certonly --standalone -d admin.turkishlearning.com
sudo certbot certonly --standalone -d ai.turkishlearning.com

# Copy certificates to nginx/ssl directory
sudo cp /etc/letsencrypt/live/api.turkishlearning.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.turkishlearning.com/privkey.pem nginx/ssl/
```

## Deployment Options

### Option 1: Docker Compose (Recommended for small to medium deployments)

1. **Prepare the environment:**
   ```bash
   git clone <repository-url>
   cd turkish-learning-platform
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

2. **Build and deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run migration:run
   ```

4. **Seed initial data:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run seed
   ```

5. **Verify deployment:**
   ```bash
   curl https://api.turkishlearning.com/health
   curl https://admin.turkishlearning.com/api/health
   curl https://ai.turkishlearning.com/health
   ```

### Option 2: Kubernetes (Recommended for large-scale deployments)

1. **Prepare Kubernetes cluster:**
   ```bash
   # Create namespace
   kubectl apply -f k8s/namespace.yaml
   
   # Apply configurations and secrets
   kubectl apply -f k8s/configmap.yaml
   ```

2. **Deploy database and cache:**
   ```bash
   kubectl apply -f k8s/postgres.yaml
   kubectl apply -f k8s/redis.yaml
   ```

3. **Deploy applications:**
   ```bash
   kubectl apply -f k8s/backend.yaml
   kubectl apply -f k8s/ai-services.yaml
   kubectl apply -f k8s/admin-panel.yaml
   ```

4. **Deploy ingress and monitoring:**
   ```bash
   kubectl apply -f k8s/ingress.yaml
   kubectl apply -f k8s/monitoring.yaml
   ```

5. **Verify deployment:**
   ```bash
   kubectl get pods -n turkish-learning
   kubectl get services -n turkish-learning
   ```

## Database Management

### Initial Setup

1. **Create database and user:**
   ```sql
   CREATE DATABASE turkish_learning;
   CREATE USER turkish_app WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE turkish_learning TO turkish_app;
   ```

2. **Run migrations:**
   ```bash
   # Docker Compose
   docker-compose exec backend npm run migration:run
   
   # Kubernetes
   kubectl exec -it deployment/backend -n turkish-learning -- npm run migration:run
   ```

### Backup Strategy

1. **Automated backups:**
   ```bash
   # Create backup script
   cat > backup-db.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_FILE="turkish_learning_backup_$DATE.sql"
   
   docker-compose exec -T postgres pg_dump -U postgres turkish_learning > $BACKUP_FILE
   
   # Upload to S3 or your backup storage
   aws s3 cp $BACKUP_FILE s3://your-backup-bucket/database/
   
   # Keep only last 30 days of backups locally
   find . -name "turkish_learning_backup_*.sql" -mtime +30 -delete
   EOF
   
   chmod +x backup-db.sh
   
   # Add to crontab for daily backups
   echo "0 2 * * * /path/to/backup-db.sh" | crontab -
   ```

2. **Restore from backup:**
   ```bash
   # Stop applications
   docker-compose stop backend ai-services admin-panel
   
   # Restore database
   docker-compose exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS turkish_learning;"
   docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE turkish_learning;"
   docker-compose exec -T postgres psql -U postgres turkish_learning < backup_file.sql
   
   # Start applications
   docker-compose start backend ai-services admin-panel
   ```

## Monitoring and Logging

### Prometheus and Grafana

1. **Access monitoring dashboards:**
   - Prometheus: https://prometheus.turkishlearning.com
   - Grafana: https://grafana.turkishlearning.com
   - Flower (Celery): https://flower.turkishlearning.com

2. **Import Grafana dashboards:**
   ```bash
   # Dashboards are automatically provisioned from monitoring/grafana/dashboards/
   # Custom dashboards can be imported via Grafana UI
   ```

### Log Management

1. **Centralized logging with ELK Stack:**
   ```bash
   # Enable logging profile
   docker-compose --profile logging -f docker-compose.prod.yml up -d
   
   # Access Kibana
   # https://kibana.turkishlearning.com
   ```

2. **Log rotation:**
   ```bash
   # Configure logrotate
   cat > /etc/logrotate.d/turkish-learning << 'EOF'
   /var/log/turkish-learning/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 644 root root
       postrotate
           docker-compose restart nginx
       endscript
   }
   EOF
   ```

## Security Configuration

### 1. Firewall Rules

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 5432/tcp   # PostgreSQL (internal only)
ufw deny 6379/tcp   # Redis (internal only)
ufw enable
```

### 2. SSL/TLS Configuration

Update `nginx/nginx.prod.conf` with strong SSL settings:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3. Rate Limiting

Configure rate limiting in Nginx:

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;
    
    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
        }
        
        location /api/v1/auth/ {
            limit_req zone=auth burst=10 nodelay;
        }
    }
}
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_courses_status ON courses(status);
CREATE INDEX CONCURRENTLY idx_lessons_course_id ON lessons(course_id);
CREATE INDEX CONCURRENTLY idx_exercises_lesson_id ON exercises(lesson_id);

-- Analyze tables
ANALYZE users, courses, lessons, exercises;
```

### 2. Redis Configuration

```bash
# Optimize Redis for production
echo "maxmemory 2gb" >> redis.conf
echo "maxmemory-policy allkeys-lru" >> redis.conf
echo "save 900 1" >> redis.conf
echo "save 300 10" >> redis.conf
echo "save 60 10000" >> redis.conf
```

### 3. Application Optimization

```bash
# Enable production optimizations
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

# Enable compression
export COMPRESSION_ENABLED=true

# Configure caching
export CACHE_TTL=3600
export ENABLE_CACHING=true
```

## Scaling

### Horizontal Scaling

1. **Scale backend services:**
   ```bash
   # Docker Compose
   docker-compose up -d --scale backend=3
   
   # Kubernetes
   kubectl scale deployment backend --replicas=5 -n turkish-learning
   ```

2. **Scale AI services:**
   ```bash
   # Docker Compose
   docker-compose up -d --scale ai-services=2
   
   # Kubernetes
   kubectl scale deployment ai-services --replicas=3 -n turkish-learning
   ```

### Database Scaling

1. **Read replicas:**
   ```yaml
   # Add to docker-compose.prod.yml
   postgres-replica:
     image: postgres:15-alpine
     environment:
       POSTGRES_MASTER_SERVICE: postgres
       POSTGRES_REPLICA_USER: replica
       POSTGRES_REPLICA_PASSWORD: replica_password
   ```

2. **Connection pooling:**
   ```bash
   # Use PgBouncer for connection pooling
   docker run -d --name pgbouncer \
     -e DATABASES_HOST=postgres \
     -e DATABASES_PORT=5432 \
     -e DATABASES_USER=postgres \
     -e DATABASES_PASSWORD=password \
     -e DATABASES_DBNAME=turkish_learning \
     pgbouncer/pgbouncer:latest
   ```

## Troubleshooting

### Common Issues

1. **Database connection issues:**
   ```bash
   # Check database connectivity
   docker-compose exec backend npm run db:check
   
   # View database logs
   docker-compose logs postgres
   ```

2. **Memory issues:**
   ```bash
   # Monitor memory usage
   docker stats
   
   # Increase memory limits in docker-compose.prod.yml
   deploy:
     resources:
       limits:
         memory: 2G
   ```

3. **SSL certificate issues:**
   ```bash
   # Renew certificates
   sudo certbot renew
   
   # Reload nginx
   docker-compose exec nginx nginx -s reload
   ```

### Health Checks

```bash
# Check all services
curl -f https://api.turkishlearning.com/health
curl -f https://admin.turkishlearning.com/api/health
curl -f https://ai.turkishlearning.com/health

# Check database
docker-compose exec postgres pg_isready -U postgres

# Check Redis
docker-compose exec redis redis-cli ping
```

## Maintenance

### Regular Maintenance Tasks

1. **Weekly tasks:**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Clean Docker images
   docker system prune -f
   
   # Backup database
   ./backup-db.sh
   ```

2. **Monthly tasks:**
   ```bash
   # Update Docker images
   docker-compose pull
   docker-compose up -d
   
   # Analyze database performance
   docker-compose exec postgres psql -U postgres -d turkish_learning -c "SELECT * FROM pg_stat_activity;"
   ```

3. **Quarterly tasks:**
   ```bash
   # Review and rotate logs
   logrotate -f /etc/logrotate.d/turkish-learning
   
   # Security audit
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image turkish-learning/backend:latest
   ```

## Support and Documentation

- **Monitoring**: Access Grafana dashboards for real-time metrics
- **Logs**: Check centralized logs in Kibana or container logs
- **Alerts**: Configure Prometheus alerts for critical issues
- **Documentation**: Keep deployment documentation updated
- **Runbooks**: Create runbooks for common operational tasks

For additional support, refer to the main README.md and API documentation.
