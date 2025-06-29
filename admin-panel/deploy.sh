#!/bin/bash

# Turkish Learning Admin Panel - Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

# Configuration
APP_NAME="turkish-learning-admin"
APP_DIR="/var/www/$APP_NAME"
REPO_URL="https://github.com/yourusername/turkish-learning-admin.git"
DOMAIN="yourdomain.com"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root"
   exit 1
fi

# Environment setup
ENVIRONMENT=${1:-production}
log_info "Deploying to $ENVIRONMENT environment"

# Create application directory
log_info "Setting up application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    log_info "Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/main
else
    log_info "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
log_info "Installing dependencies..."
npm ci --only=production

# Build application
log_info "Building application..."
npm run build

# Setup environment variables
log_info "Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    log_warn ".env.production not found, creating from template..."
    cp .env.example .env.production
    log_warn "Please update .env.production with your actual values"
fi

# Setup PM2 configuration
log_info "Setting up PM2 configuration..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# Setup Nginx configuration
log_info "Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/$APP_NAME
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL certificate
log_info "Setting up SSL certificate..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log_info "Obtaining SSL certificate..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
else
    log_info "SSL certificate already exists"
fi

# Setup log directories
log_info "Setting up log directories..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Setup logrotate
log_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/$APP_NAME > /dev/null <<EOF
/var/log/pm2/$APP_NAME*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Setup firewall
log_info "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Save PM2 configuration
log_info "Saving PM2 configuration..."
pm2 save

# Final checks
log_info "Running final checks..."
if pm2 list | grep -q $APP_NAME; then
    log_info "✅ Application is running"
else
    log_error "❌ Application failed to start"
    exit 1
fi

if curl -f -s http://localhost:3003/health > /dev/null; then
    log_info "✅ Health check passed"
else
    log_warn "⚠️  Health check failed"
fi

log_info "🎉 Deployment completed successfully!"
log_info "Your application is now available at: https://$DOMAIN"
log_info ""
log_info "Useful commands:"
log_info "  pm2 status                 - Check application status"
log_info "  pm2 logs $APP_NAME         - View application logs"
log_info "  pm2 restart $APP_NAME      - Restart application"
log_info "  sudo nginx -t              - Test Nginx configuration"
log_info "  sudo systemctl reload nginx - Reload Nginx"
