#!/bin/bash

# Docker Deployment Script for Turkish Learning Admin Panel
# Usage: ./scripts/docker-deploy.sh [production|development|staging]

set -e

# Configuration
ENVIRONMENT=${1:-production}
IMAGE_NAME="turkish-learning/admin-panel"
CONTAINER_NAME="turkish-admin-panel"
NETWORK_NAME="turkish-learning-network"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

log_info "🚀 Starting Docker deployment for $ENVIRONMENT environment"

# Step 1: Build the image
log_step "1. Building Docker image..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker build --target dev -t $IMAGE_NAME:dev .
    IMAGE_TAG="dev"
else
    docker build --target production -t $IMAGE_NAME:latest .
    IMAGE_TAG="latest"
fi
log_info "✅ Docker image built successfully"

# Step 2: Stop existing container
log_step "2. Stopping existing container..."
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    docker stop $CONTAINER_NAME
    log_info "✅ Existing container stopped"
else
    log_info "ℹ️  No existing container found"
fi

# Step 3: Remove existing container
if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
    docker rm $CONTAINER_NAME
    log_info "✅ Existing container removed"
fi

# Step 4: Create network if it doesn't exist
log_step "3. Setting up Docker network..."
if ! docker network ls | grep -q $NETWORK_NAME; then
    docker network create $NETWORK_NAME
    log_info "✅ Docker network created"
else
    log_info "ℹ️  Docker network already exists"
fi

# Step 5: Run the container
log_step "4. Starting new container..."
if [ "$ENVIRONMENT" = "development" ]; then
    # Development mode with volume mounts
    docker run -d \
        --name $CONTAINER_NAME \
        --network $NETWORK_NAME \
        -p 3004:3003 \
        -v $(pwd):/app \
        -v /app/node_modules \
        -v /app/.next \
        -e NODE_ENV=development \
        -e PORT=3003 \
        -e NEXT_TELEMETRY_DISABLED=1 \
        --restart unless-stopped \
        $IMAGE_NAME:$IMAGE_TAG
    
    log_info "✅ Development container started on port 3004"
    log_info "🌐 Access the application at: http://localhost:3004"
else
    # Production mode
    docker run -d \
        --name $CONTAINER_NAME \
        --network $NETWORK_NAME \
        -p 3003:3003 \
        -e NODE_ENV=production \
        -e PORT=3003 \
        -e NEXT_TELEMETRY_DISABLED=1 \
        -e NEXT_PUBLIC_API_URL=http://localhost:3003/api \
        -e NEXT_PUBLIC_APP_NAME="Turkish Learning Admin" \
        -e NEXT_PUBLIC_APP_VERSION=1.0.0 \
        -e NEXT_PUBLIC_APP_ENV=production \
        --restart unless-stopped \
        $IMAGE_NAME:$IMAGE_TAG
    
    log_info "✅ Production container started on port 3003"
    log_info "🌐 Access the application at: http://localhost:3003"
fi

# Step 6: Wait for container to be ready
log_step "5. Waiting for application to start..."
sleep 10

# Step 7: Health check
log_step "6. Running health check..."
if [ "$ENVIRONMENT" = "development" ]; then
    HEALTH_URL="http://localhost:3004"
else
    HEALTH_URL="http://localhost:3003/api/health"
fi

for i in {1..30}; do
    if curl -f $HEALTH_URL > /dev/null 2>&1; then
        log_info "✅ Health check passed"
        break
    elif [ $i -eq 30 ]; then
        log_error "❌ Health check failed after 30 attempts"
        log_error "Container logs:"
        docker logs $CONTAINER_NAME --tail 20
        exit 1
    else
        log_warn "⏳ Waiting for application to be ready... (attempt $i/30)"
        sleep 2
    fi
done

# Step 8: Display container information
log_step "7. Container information:"
echo "----------------------------------------"
docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "----------------------------------------"

# Step 9: Display useful commands
log_info "🎉 Deployment completed successfully!"
echo ""
log_info "Useful commands:"
echo "  docker logs $CONTAINER_NAME           - View container logs"
echo "  docker exec -it $CONTAINER_NAME sh    - Access container shell"
echo "  docker stop $CONTAINER_NAME           - Stop the container"
echo "  docker restart $CONTAINER_NAME        - Restart the container"
echo ""

if [ "$ENVIRONMENT" = "development" ]; then
    log_info "Development mode features:"
    echo "  - Hot reload enabled"
    echo "  - Source code mounted as volume"
    echo "  - Available at: http://localhost:3004"
else
    log_info "Production mode features:"
    echo "  - Optimized build"
    echo "  - Health checks enabled"
    echo "  - Available at: http://localhost:3003"
fi

log_info "🚀 Your Turkish Learning Admin Panel is now running in Docker!"
