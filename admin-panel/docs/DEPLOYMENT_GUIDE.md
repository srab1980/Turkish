# Turkish Learning Platform - Deployment Guide

This comprehensive guide covers all aspects of deploying the Turkish Learning Platform Admin Panel from development to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Production Deployment](#production-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn 1.22.0+)
- **Docker**: 20.10.0 or higher (for containerized deployment)
- **Kubernetes**: 1.24.0 or higher (for production deployment)
- **PostgreSQL**: 13.0 or higher
- **Redis**: 6.0 or higher

### Development Tools

- **Git**: Version control
- **kubectl**: Kubernetes command-line tool
- **Helm**: Kubernetes package manager (optional)
- **Docker Compose**: Multi-container Docker applications

### External Services

- **OpenAI API**: For AI-powered content generation
- **Google Cloud Services**: For authentication and storage
- **Monitoring Services**: Prometheus, Grafana, Sentry

## 🌍 Environment Setup

### Environment Variables

Create environment files for different stages:

#### `.env.local` (Development)
```bash
# Application
NODE_ENV=development
PORT=3001
NEXT_TELEMETRY_DISABLED=1

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WEB_URL=http://localhost:3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=turkish_learning_dev
DB_USERNAME=dev_user
DB_PASSWORD=dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=dev_redis_password

# Authentication
JWT_SECRET=your_development_jwt_secret_32_chars
SESSION_SECRET=your_development_session_secret_32_chars

# External Services
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### `.env.staging` (Staging)
```bash
# Application
NODE_ENV=staging
PORT=3001
NEXT_TELEMETRY_DISABLED=1

# API URLs
NEXT_PUBLIC_API_URL=https://api-staging.turkishlearning.com
NEXT_PUBLIC_WEB_URL=https://staging.turkishlearning.com

# Database
DB_HOST=postgres-staging.internal
DB_PORT=5432
DB_NAME=turkish_learning_staging
DB_USERNAME=staging_user
DB_PASSWORD=staging_secure_password

# Redis
REDIS_HOST=redis-staging.internal
REDIS_PORT=6379
REDIS_PASSWORD=staging_redis_password

# Authentication
JWT_SECRET=staging_jwt_secret_32_characters_long
SESSION_SECRET=staging_session_secret_32_characters

# External Services
OPENAI_API_KEY=staging_openai_api_key
GOOGLE_CLIENT_ID=staging_google_client_id
GOOGLE_CLIENT_SECRET=staging_google_client_secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

#### `.env.production` (Production)
```bash
# Application
NODE_ENV=production
PORT=3001
NEXT_TELEMETRY_DISABLED=1

# API URLs
NEXT_PUBLIC_API_URL=https://api.turkishlearning.com
NEXT_PUBLIC_WEB_URL=https://turkishlearning.com

# Database (use secrets management in production)
DB_HOST=postgres-prod.internal
DB_PORT=5432
DB_NAME=turkish_learning
DB_USERNAME=prod_user
DB_PASSWORD=${DB_PASSWORD_SECRET}

# Redis
REDIS_HOST=redis-prod.internal
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD_SECRET}

# Authentication
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}

# External Services
OPENAI_API_KEY=${OPENAI_API_KEY}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
PROMETHEUS_METRICS_PATH=/metrics
```

## 🚀 Local Development

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone https://github.com/turkish-learning/admin-panel.git
   cd admin-panel
   npm install
   cp .env.example .env.local
   ```

2. **Start Dependencies**
   ```bash
   # Using Docker Compose
   docker-compose -f docker-compose.dev.yml up -d postgres redis
   
   # Or start manually
   # PostgreSQL and Redis should be running
   ```

3. **Initialize Database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Admin Panel: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Development Workflow

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test
npm run test:e2e

# Build for production
npm run build

# Start production server
npm run start
```

## 🧪 Testing

### Test Suites

1. **Unit Tests**
   ```bash
   npm run test
   npm run test:watch
   npm run test:coverage
   ```

2. **Integration Tests**
   ```bash
   npm run test:integration
   ```

3. **End-to-End Tests**
   ```bash
   npm run test:e2e
   npm run test:e2e:headed
   ```

4. **Performance Tests**
   ```bash
   npm run test:performance
   ```

5. **Security Tests**
   ```bash
   npm run test:security
   npm run security:scan
   ```

6. **All Tests**
   ```bash
   npm run test:all
   ```

### Test Configuration

- **Jest**: Unit and integration tests
- **Playwright**: E2E testing across browsers
- **Lighthouse**: Performance testing
- **Custom Security Scanner**: Vulnerability assessment

## 🐳 Docker Deployment

### Single Container

```bash
# Build image
docker build -t turkish-learning/admin-panel:latest .

# Run container
docker run -d \
  --name admin-panel \
  -p 3001:3001 \
  --env-file .env.production \
  turkish-learning/admin-panel:latest
```

### Docker Compose

#### Development
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Production
```bash
# Start production stack
docker-compose up -d

# Scale admin panel
docker-compose up -d --scale admin-panel=3

# Update service
docker-compose pull admin-panel
docker-compose up -d admin-panel
```

### Multi-Stage Build

The Dockerfile uses multi-stage builds for optimization:

1. **Dependencies Stage**: Install production dependencies
2. **Builder Stage**: Build the application
3. **Runner Stage**: Minimal runtime image

## ☸️ Kubernetes Deployment

### Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Configure cluster access
kubectl config use-context production-cluster

# Verify connection
kubectl cluster-info
```

### Deployment Steps

1. **Create Namespace**
   ```bash
   kubectl apply -f k8s/production/namespace.yaml
   ```

2. **Apply Secrets** (Update with actual values first)
   ```bash
   # Edit secrets with actual values
   kubectl apply -f k8s/production/secrets.yaml
   ```

3. **Apply Configuration**
   ```bash
   kubectl apply -f k8s/production/configmap.yaml
   ```

4. **Deploy Database**
   ```bash
   kubectl apply -f k8s/production/postgres.yaml
   ```

5. **Deploy Cache**
   ```bash
   kubectl apply -f k8s/production/redis.yaml
   ```

6. **Deploy Application**
   ```bash
   kubectl apply -f k8s/production/deployment.yaml
   kubectl apply -f k8s/production/service.yaml
   ```

7. **Configure Ingress**
   ```bash
   kubectl apply -f k8s/production/ingress.yaml
   ```

8. **Setup Monitoring**
   ```bash
   kubectl apply -f k8s/production/monitoring.yaml
   ```

### Verification

```bash
# Check deployment status
kubectl get deployments -n turkish-learning-prod

# Check pods
kubectl get pods -n turkish-learning-prod

# Check services
kubectl get services -n turkish-learning-prod

# Check ingress
kubectl get ingress -n turkish-learning-prod

# View logs
kubectl logs -f deployment/admin-panel -n turkish-learning-prod
```

## 🌐 Production Deployment

### Automated Deployment

Use the deployment script for automated deployments:

```bash
# Deploy to production
./scripts/deploy-production.sh -v v1.2.3

# Force deploy without confirmation
./scripts/deploy-production.sh -f -v v1.2.3

# Dry run (show what would be deployed)
./scripts/deploy-production.sh --dry-run -v v1.2.3

# Rollback to previous version
./scripts/deploy-production.sh --rollback
```

### Manual Deployment

1. **Build and Push Image**
   ```bash
   # Build image
   docker build -t ghcr.io/turkish-learning/admin-panel:v1.2.3 .
   
   # Push to registry
   docker push ghcr.io/turkish-learning/admin-panel:v1.2.3
   ```

2. **Update Kubernetes Deployment**
   ```bash
   # Update image
   kubectl set image deployment/admin-panel \
     admin-panel=ghcr.io/turkish-learning/admin-panel:v1.2.3 \
     -n turkish-learning-prod
   
   # Wait for rollout
   kubectl rollout status deployment/admin-panel -n turkish-learning-prod
   ```

3. **Verify Deployment**
   ```bash
   # Check health
   kubectl exec -it deployment/admin-panel -n turkish-learning-prod -- \
     curl -f http://localhost:3001/health
   ```

### Blue-Green Deployment

```bash
# Deploy to green environment
kubectl apply -f k8s/production/deployment-green.yaml

# Test green environment
kubectl port-forward service/admin-panel-green 8080:3001 -n turkish-learning-prod

# Switch traffic to green
kubectl patch service admin-panel-service \
  -p '{"spec":{"selector":{"version":"green"}}}' \
  -n turkish-learning-prod

# Remove blue environment
kubectl delete deployment admin-panel-blue -n turkish-learning-prod
```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Application health
curl -f https://admin.turkishlearning.com/health

# Kubernetes health
kubectl get pods -n turkish-learning-prod
kubectl top pods -n turkish-learning-prod
```

### Monitoring Stack

1. **Prometheus**: Metrics collection
2. **Grafana**: Visualization and dashboards
3. **AlertManager**: Alert routing and management
4. **Sentry**: Error tracking and performance monitoring

### Backup Procedures

```bash
# Database backup
kubectl create job --from=cronjob/postgres-backup \
  postgres-backup-$(date +%Y%m%d-%H%M%S) \
  -n turkish-learning-prod

# Verify backup
kubectl logs job/postgres-backup-$(date +%Y%m%d-%H%M%S) -n turkish-learning-prod
```

### Scaling

```bash
# Horizontal scaling
kubectl scale deployment admin-panel --replicas=5 -n turkish-learning-prod

# Vertical scaling (update resources in deployment.yaml)
kubectl apply -f k8s/production/deployment.yaml
```

## 🔧 Troubleshooting

### Common Issues

1. **Pod Not Starting**
   ```bash
   kubectl describe pod <pod-name> -n turkish-learning-prod
   kubectl logs <pod-name> -n turkish-learning-prod
   ```

2. **Service Not Accessible**
   ```bash
   kubectl get endpoints -n turkish-learning-prod
   kubectl describe service admin-panel-service -n turkish-learning-prod
   ```

3. **Database Connection Issues**
   ```bash
   kubectl exec -it deployment/admin-panel -n turkish-learning-prod -- \
     pg_isready -h postgres-service -p 5432
   ```

4. **High Memory Usage**
   ```bash
   kubectl top pods -n turkish-learning-prod
   kubectl describe pod <pod-name> -n turkish-learning-prod
   ```

### Performance Optimization

1. **Enable Caching**
   - Redis for session storage
   - CDN for static assets
   - Application-level caching

2. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Read replicas

3. **Resource Limits**
   - Set appropriate CPU/memory limits
   - Use horizontal pod autoscaling
   - Monitor resource usage

### Security Checklist

- [ ] Secrets stored securely (not in code)
- [ ] HTTPS enabled with valid certificates
- [ ] Security headers configured
- [ ] Network policies applied
- [ ] Regular security scans performed
- [ ] Access logs monitored
- [ ] Backup encryption enabled

## 📞 Support

For deployment issues:

- **Documentation**: [docs/](../docs/)
- **Issues**: [GitHub Issues](https://github.com/turkish-learning/admin-panel/issues)
- **Emergency**: admin@turkishlearning.com

---

**Last Updated**: December 2024
**Version**: 1.0.0
