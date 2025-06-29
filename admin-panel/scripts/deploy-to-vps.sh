#!/bin/bash

# Local to VPS Deployment Script
# This script deploys changes from your local machine to VPS

set -e

# Configuration
VPS_HOST="${VPS_HOST:-your-vps-ip}"
VPS_USER="${VPS_USER:-deploy}"
VPS_PORT="${VPS_PORT:-22}"
APP_PATH="/var/www/turkish-learning-admin"
LOCAL_PATH="."

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

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    log_error "SSH key not found. Please set up SSH key authentication first."
    echo "Run: ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'"
    echo "Then: ssh-copy-id $VPS_USER@$VPS_HOST"
    exit 1
fi

# Check if we can connect to VPS
log_step "1. Testing VPS connection..."
if ssh -o ConnectTimeout=10 -p $VPS_PORT $VPS_USER@$VPS_HOST "echo 'Connection successful'" > /dev/null 2>&1; then
    log_info "✅ VPS connection successful"
else
    log_error "❌ Cannot connect to VPS. Please check your SSH configuration."
    exit 1
fi

# Build application locally
log_step "2. Building application locally..."
npm run build
log_info "✅ Application built successfully"

# Create deployment package
log_step "3. Creating deployment package..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PACKAGE_NAME="turkish-admin-$TIMESTAMP.tar.gz"

tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='.env.local' \
    -czf $PACKAGE_NAME .

log_info "✅ Package created: $PACKAGE_NAME"

# Upload package to VPS
log_step "4. Uploading package to VPS..."
scp -P $VPS_PORT $PACKAGE_NAME $VPS_USER@$VPS_HOST:/tmp/
log_info "✅ Package uploaded"

# Deploy on VPS
log_step "5. Deploying on VPS..."
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
    set -e
    
    # Create backup
    if [ -d "$APP_PATH" ]; then
        sudo cp -r $APP_PATH $APP_PATH-backup-$TIMESTAMP
        echo "✅ Backup created"
    fi
    
    # Extract new version
    cd /tmp
    tar -xzf $PACKAGE_NAME
    
    # Move to application directory
    sudo rm -rf $APP_PATH/admin-panel
    sudo mkdir -p $APP_PATH
    sudo mv admin-panel $APP_PATH/
    sudo chown -R $VPS_USER:$VPS_USER $APP_PATH
    
    # Install dependencies and build
    cd $APP_PATH/admin-panel
    npm ci --only=production
    npm run build
    
    # Restart application
    pm2 restart turkish-learning-admin || pm2 start ecosystem.config.js --env production
    
    # Health check
    sleep 10
    if curl -f http://localhost:3003/api/health > /dev/null 2>&1; then
        echo "✅ Deployment successful"
        # Clean up old backups (keep last 3)
        cd $APP_PATH-backup-* 2>/dev/null | head -n -3 | xargs rm -rf 2>/dev/null || true
    else
        echo "❌ Health check failed, rolling back"
        pm2 stop turkish-learning-admin
        sudo rm -rf $APP_PATH/admin-panel
        sudo mv $APP_PATH-backup-$TIMESTAMP/admin-panel $APP_PATH/
        pm2 start turkish-learning-admin
        exit 1
    fi
    
    # Clean up
    rm -f /tmp/$PACKAGE_NAME
EOF

# Clean up local package
rm -f $PACKAGE_NAME

log_info "🎉 Deployment completed successfully!"
log_info "Your application is now live at: https://yourdomain.com"

# Show application status
log_step "6. Application status:"
ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "pm2 status && pm2 logs turkish-learning-admin --lines 5"
