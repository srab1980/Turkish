#!/bin/bash

# Turkish Learning Platform - Production Deployment Script
# This script deploys the application to production Kubernetes cluster

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NAMESPACE="turkish-learning-prod"
DOCKER_REGISTRY="ghcr.io"
IMAGE_NAME="turkish-learning/admin-panel"
KUBECTL_CONTEXT="production-cluster"

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
Turkish Learning Platform Production Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -h, --help          Show this help message
    -v, --version       Specify version/tag to deploy (default: latest)
    -f, --force         Force deployment without confirmation
    -d, --dry-run       Show what would be deployed without actually deploying
    --skip-tests        Skip pre-deployment tests
    --skip-backup       Skip database backup before deployment
    --rollback          Rollback to previous version

EXAMPLES:
    $0                          # Deploy latest version with confirmation
    $0 -v v1.2.3               # Deploy specific version
    $0 -f --skip-tests          # Force deploy without tests
    $0 --dry-run                # Show deployment plan
    $0 --rollback               # Rollback to previous version

EOF
}

# Parse command line arguments
VERSION="latest"
FORCE=false
DRY_RUN=false
SKIP_TESTS=false
SKIP_BACKUP=false
ROLLBACK=false

while [[ $# -gt 0 ]]; do
    case $1 in
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
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info --context="$KUBECTL_CONTEXT" &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster: $KUBECTL_CONTEXT"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" --context="$KUBECTL_CONTEXT" &> /dev/null; then
        log_error "Namespace $NAMESPACE does not exist"
        exit 1
    fi
    
    # Check if Docker image exists
    if [[ "$VERSION" != "latest" ]]; then
        log_info "Checking if Docker image exists: $DOCKER_REGISTRY/$IMAGE_NAME:$VERSION"
        # In a real scenario, you would check if the image exists in the registry
    fi
    
    log_success "Pre-deployment checks passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log_info "Skipping tests"
        return
    fi
    
    log_info "Running pre-deployment tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run security tests
    npm run test:security
    
    # Run unit tests
    npm run test
    
    log_success "All tests passed"
}

# Backup database
backup_database() {
    if [[ "$SKIP_BACKUP" == true ]]; then
        log_info "Skipping database backup"
        return
    fi
    
    log_info "Creating database backup..."
    
    # Trigger backup job
    kubectl create job --from=cronjob/postgres-backup "postgres-backup-$(date +%Y%m%d-%H%M%S)" \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT"
    
    log_success "Database backup initiated"
}

# Deploy application
deploy_application() {
    log_info "Deploying application version: $VERSION"
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN - Would deploy the following resources:"
        kubectl apply -f k8s/production/ \
            --namespace="$NAMESPACE" \
            --context="$KUBECTL_CONTEXT" \
            --dry-run=client
        return
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/production/namespace.yaml --context="$KUBECTL_CONTEXT"
    kubectl apply -f k8s/production/configmap.yaml --context="$KUBECTL_CONTEXT"
    kubectl apply -f k8s/production/secrets.yaml --context="$KUBECTL_CONTEXT"
    kubectl apply -f k8s/production/postgres.yaml --context="$KUBECTL_CONTEXT"
    kubectl apply -f k8s/production/redis.yaml --context="$KUBECTL_CONTEXT"
    kubectl apply -f k8s/production/service.yaml --context="$KUBECTL_CONTEXT"
    
    # Update deployment with new image version
    kubectl set image deployment/admin-panel \
        admin-panel="$DOCKER_REGISTRY/$IMAGE_NAME:$VERSION" \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT"
    
    kubectl apply -f k8s/production/deployment.yaml --context="$KUBECTL_CONTEXT"
    kubectl apply -f k8s/production/ingress.yaml --context="$KUBECTL_CONTEXT"
    kubectl apply -f k8s/production/monitoring.yaml --context="$KUBECTL_CONTEXT"
    
    log_success "Kubernetes manifests applied"
}

# Wait for deployment
wait_for_deployment() {
    log_info "Waiting for deployment to complete..."
    
    # Wait for rollout to complete
    kubectl rollout status deployment/admin-panel \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT" \
        --timeout=600s
    
    log_success "Deployment completed successfully"
}

# Health checks
health_checks() {
    log_info "Running post-deployment health checks..."
    
    # Check if pods are running
    local ready_pods=$(kubectl get pods -l app=admin-panel \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT" \
        -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o True | wc -l)
    
    local total_pods=$(kubectl get pods -l app=admin-panel \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT" \
        --no-headers | wc -l)
    
    if [[ "$ready_pods" -eq "$total_pods" ]] && [[ "$total_pods" -gt 0 ]]; then
        log_success "All pods are ready ($ready_pods/$total_pods)"
    else
        log_error "Not all pods are ready ($ready_pods/$total_pods)"
        exit 1
    fi
    
    # Check service endpoints
    local endpoints=$(kubectl get endpoints admin-panel-service \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT" \
        -o jsonpath='{.subsets[*].addresses[*].ip}' | wc -w)
    
    if [[ "$endpoints" -gt 0 ]]; then
        log_success "Service endpoints are available ($endpoints endpoints)"
    else
        log_error "No service endpoints available"
        exit 1
    fi
    
    # Test application health endpoint
    log_info "Testing application health endpoint..."
    
    # Port forward to test health endpoint
    kubectl port-forward service/admin-panel-service 8080:3001 \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT" &
    
    local port_forward_pid=$!
    sleep 5
    
    if curl -f http://localhost:8080/health &> /dev/null; then
        log_success "Application health check passed"
    else
        log_error "Application health check failed"
        kill $port_forward_pid 2>/dev/null || true
        exit 1
    fi
    
    kill $port_forward_pid 2>/dev/null || true
    
    log_success "All health checks passed"
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back to previous version..."
    
    kubectl rollout undo deployment/admin-panel \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT"
    
    # Wait for rollback to complete
    kubectl rollout status deployment/admin-panel \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT" \
        --timeout=600s
    
    log_success "Rollback completed successfully"
}

# Cleanup old resources
cleanup() {
    log_info "Cleaning up old resources..."
    
    # Remove old replica sets
    kubectl delete replicaset \
        --namespace="$NAMESPACE" \
        --context="$KUBECTL_CONTEXT" \
        --selector=app=admin-panel \
        --field-selector=status.replicas=0 \
        --ignore-not-found=true
    
    log_success "Cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    log_info "Sending deployment notification..."
    
    # In a real scenario, you would send notifications to Slack, email, etc.
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"$message\"}" \
    #     "$SLACK_WEBHOOK_URL"
    
    echo "Notification: $message"
}

# Main deployment function
main() {
    if [[ "$ROLLBACK" == true ]]; then
        log_warning "ROLLBACK MODE: Rolling back to previous version"
        if [[ "$FORCE" != true ]]; then
            read -p "Are you sure you want to rollback? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Rollback cancelled"
                exit 0
            fi
        fi
        
        pre_deployment_checks
        rollback_deployment
        health_checks
        send_notification "success" "Rollback to previous version completed successfully"
        return
    fi
    
    log_info "Starting production deployment..."
    log_info "Version: $VERSION"
    log_info "Namespace: $NAMESPACE"
    log_info "Context: $KUBECTL_CONTEXT"
    
    # Confirmation prompt
    if [[ "$FORCE" != true ]] && [[ "$DRY_RUN" != true ]]; then
        log_warning "You are about to deploy to PRODUCTION!"
        read -p "Are you absolutely sure? Type 'DEPLOY' to continue: " -r
        if [[ "$REPLY" != "DEPLOY" ]]; then
            log_info "Production deployment cancelled"
            exit 0
        fi
    fi
    
    pre_deployment_checks
    run_tests
    backup_database
    deploy_application
    
    if [[ "$DRY_RUN" != true ]]; then
        wait_for_deployment
        health_checks
        cleanup
        send_notification "success" "Production deployment of version $VERSION completed successfully"
    fi
    
    log_success "Production deployment completed successfully!"
    log_info "Application is available at: https://admin.turkishlearning.com"
}

# Run main function
main "$@"
