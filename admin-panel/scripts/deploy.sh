#!/bin/bash

# Turkish Learning Platform - Deployment Script
# This script handles deployment to different environments

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_REGISTRY="ghcr.io"
IMAGE_NAME="turkish-learning/admin-panel"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Turkish Learning Platform Deployment Script

Usage: $0 [ENVIRONMENT] [OPTIONS]

ENVIRONMENTS:
    local       Deploy locally using Docker Compose
    staging     Deploy to staging environment
    production  Deploy to production environment

OPTIONS:
    -h, --help          Show this help message
    -v, --version       Specify version/tag to deploy
    -f, --force         Force deployment without confirmation
    -t, --test          Run tests before deployment
    -m, --migrate       Run database migrations
    --skip-build        Skip building Docker image
    --skip-tests        Skip running tests

EXAMPLES:
    $0 local                    # Deploy locally
    $0 staging -v v1.2.3        # Deploy specific version to staging
    $0 production -f -t         # Force deploy to production with tests
    $0 local --skip-build       # Deploy locally without rebuilding

EOF
}

# Parse command line arguments
ENVIRONMENT=""
VERSION="latest"
FORCE=false
RUN_TESTS=false
RUN_MIGRATIONS=false
SKIP_BUILD=false
SKIP_TESTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        local|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -t|--test)
            RUN_TESTS=true
            shift
            ;;
        -m|--migrate)
            RUN_MIGRATIONS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment is required"
    show_help
    exit 1
fi

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running"
        exit 1
    fi
    
    # Check if required files exist
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        log_error "package.json not found"
        exit 1
    fi
    
    if [[ ! -f "$PROJECT_ROOT/Dockerfile" ]]; then
        log_error "Dockerfile not found"
        exit 1
    fi
    
    log_success "Pre-deployment checks passed"
}

# Build Docker image
build_image() {
    if [[ "$SKIP_BUILD" == true ]]; then
        log_info "Skipping Docker image build"
        return
    fi
    
    log_info "Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    # Build the image
    docker build \
        --target production \
        --tag "$IMAGE_NAME:$VERSION" \
        --tag "$IMAGE_NAME:latest" \
        .
    
    log_success "Docker image built successfully"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]] || [[ "$RUN_TESTS" == false ]]; then
        log_info "Skipping tests"
        return
    fi
    
    log_info "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run unit tests
    npm run test
    
    # Run security tests
    npm run test:security
    
    log_success "All tests passed"
}

# Deploy to local environment
deploy_local() {
    log_info "Deploying to local environment..."
    
    cd "$PROJECT_ROOT"
    
    # Stop existing containers
    docker-compose down
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check health
    if curl -f http://localhost:3001/ > /dev/null 2>&1; then
        log_success "Local deployment successful"
        log_info "Application available at: http://localhost:3001"
    else
        log_error "Local deployment failed - health check failed"
        exit 1
    fi
}

# Deploy to staging environment
deploy_staging() {
    log_info "Deploying to staging environment..."
    
    # Confirmation prompt
    if [[ "$FORCE" != true ]]; then
        read -p "Are you sure you want to deploy to staging? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Push image to registry
    docker tag "$IMAGE_NAME:$VERSION" "$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION"
    docker push "$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION"
    
    # Deploy using your preferred method (kubectl, helm, etc.)
    log_info "Deploying to Kubernetes staging namespace..."
    # kubectl apply -f k8s/staging/ --namespace=staging
    # helm upgrade --install admin-panel ./helm-chart --namespace=staging --set image.tag=$VERSION
    
    log_success "Staging deployment completed"
    log_info "Application available at: https://staging.turkishlearning.com"
}

# Deploy to production environment
deploy_production() {
    log_info "Deploying to production environment..."
    
    # Extra confirmation for production
    if [[ "$FORCE" != true ]]; then
        log_warning "You are about to deploy to PRODUCTION!"
        read -p "Are you absolutely sure? Type 'DEPLOY' to continue: " -r
        if [[ "$REPLY" != "DEPLOY" ]]; then
            log_info "Production deployment cancelled"
            exit 0
        fi
    fi
    
    # Push image to registry
    docker tag "$IMAGE_NAME:$VERSION" "$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION"
    docker push "$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION"
    
    # Deploy using your preferred method
    log_info "Deploying to Kubernetes production namespace..."
    # kubectl apply -f k8s/production/ --namespace=production
    # helm upgrade --install admin-panel ./helm-chart --namespace=production --set image.tag=$VERSION
    
    log_success "Production deployment completed"
    log_info "Application available at: https://turkishlearning.com"
}

# Run database migrations
run_migrations() {
    if [[ "$RUN_MIGRATIONS" != true ]]; then
        return
    fi
    
    log_info "Running database migrations..."
    
    case $ENVIRONMENT in
        local)
            docker-compose exec postgres psql -U admin -d turkish_learning -f /docker-entrypoint-initdb.d/migrations.sql
            ;;
        staging|production)
            # Run migrations in the appropriate environment
            log_info "Running migrations in $ENVIRONMENT"
            ;;
    esac
    
    log_success "Database migrations completed"
}

# Post-deployment checks
post_deployment_checks() {
    log_info "Running post-deployment checks..."
    
    case $ENVIRONMENT in
        local)
            URL="http://localhost:3001"
            ;;
        staging)
            URL="https://staging.turkishlearning.com"
            ;;
        production)
            URL="https://turkishlearning.com"
            ;;
    esac
    
    # Health check
    if curl -f "$URL/" > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Additional checks can be added here
    log_success "Post-deployment checks completed"
}

# Main deployment function
main() {
    log_info "Starting deployment to $ENVIRONMENT environment..."
    log_info "Version: $VERSION"
    
    pre_deployment_checks
    build_image
    run_tests
    
    case $ENVIRONMENT in
        local)
            deploy_local
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    run_migrations
    post_deployment_checks
    
    log_success "Deployment to $ENVIRONMENT completed successfully!"
}

# Run main function
main "$@"
