#!/bin/bash

# SSH Setup Script for VPS Connection
# This script helps set up SSH key authentication for seamless deployment

set -e

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

# Get VPS details
echo "🔐 SSH Setup for VPS Deployment"
echo "================================"
echo ""

read -p "Enter your VPS IP address: " VPS_HOST
read -p "Enter your VPS username (default: deploy): " VPS_USER
VPS_USER=${VPS_USER:-deploy}
read -p "Enter your VPS SSH port (default: 22): " VPS_PORT
VPS_PORT=${VPS_PORT:-22}
read -p "Enter your email for SSH key: " EMAIL

# Check if SSH key already exists
if [ -f ~/.ssh/id_rsa ]; then
    log_warn "SSH key already exists at ~/.ssh/id_rsa"
    read -p "Do you want to use the existing key? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        log_step "Generating new SSH key..."
        ssh-keygen -t rsa -b 4096 -C "$EMAIL" -f ~/.ssh/id_rsa_vps
        SSH_KEY_PATH="~/.ssh/id_rsa_vps"
    else
        SSH_KEY_PATH="~/.ssh/id_rsa"
    fi
else
    log_step "Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -C "$EMAIL"
    SSH_KEY_PATH="~/.ssh/id_rsa"
fi

# Copy SSH key to VPS
log_step "Copying SSH key to VPS..."
if ssh-copy-id -i $SSH_KEY_PATH -p $VPS_PORT $VPS_USER@$VPS_HOST; then
    log_info "✅ SSH key copied successfully"
else
    log_error "❌ Failed to copy SSH key"
    echo "Please manually copy your public key to the VPS:"
    echo "cat $SSH_KEY_PATH.pub | ssh -p $VPS_PORT $VPS_USER@$VPS_HOST 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'"
    exit 1
fi

# Test SSH connection
log_step "Testing SSH connection..."
if ssh -o ConnectTimeout=10 -p $VPS_PORT $VPS_USER@$VPS_HOST "echo 'SSH connection successful'"; then
    log_info "✅ SSH connection test successful"
else
    log_error "❌ SSH connection test failed"
    exit 1
fi

# Create environment file for deployment scripts
log_step "Creating environment configuration..."
cat > .env.deploy << EOF
# VPS Configuration for Deployment
VPS_HOST=$VPS_HOST
VPS_USER=$VPS_USER
VPS_PORT=$VPS_PORT
SSH_KEY_PATH=$SSH_KEY_PATH
EOF

log_info "✅ Environment configuration saved to .env.deploy"

# Update package.json with deployment scripts
log_step "Adding deployment scripts to package.json..."
if command -v jq &> /dev/null; then
    # Use jq if available
    jq '.scripts.deploy = "source .env.deploy && ./scripts/deploy-to-vps.sh" | 
        .scripts["deploy:watch"] = "source .env.deploy && ./scripts/watch-and-deploy.sh" |
        .scripts["deploy:quick"] = "source .env.deploy && ./scripts/deploy-to-vps.sh --quick"' package.json > package.json.tmp && mv package.json.tmp package.json
else
    # Manual update
    log_warn "jq not found. Please manually add these scripts to package.json:"
    echo '"deploy": "source .env.deploy && ./scripts/deploy-to-vps.sh"'
    echo '"deploy:watch": "source .env.deploy && ./scripts/watch-and-deploy.sh"'
    echo '"deploy:quick": "source .env.deploy && ./scripts/deploy-to-vps.sh --quick"'
fi

# Make scripts executable
chmod +x scripts/*.sh

log_info "🎉 SSH setup completed successfully!"
echo ""
log_info "Available deployment commands:"
echo "  npm run deploy         - Deploy current changes to VPS"
echo "  npm run deploy:watch   - Watch for changes and auto-deploy"
echo "  npm run deploy:quick   - Quick deploy without full build"
echo ""
log_info "Manual deployment:"
echo "  ./scripts/deploy-to-vps.sh"
echo "  ./scripts/watch-and-deploy.sh"
echo ""
log_warn "Next steps:"
echo "1. Test deployment: npm run deploy"
echo "2. Set up GitHub Actions for automated CI/CD"
echo "3. Configure webhooks for instant deployment"
