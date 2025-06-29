#!/bin/bash

# Turkish Learning Admin Panel - VPS Setup Script
# This script prepares a fresh Ubuntu VPS for deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

log_info "🚀 Starting VPS setup for Turkish Learning Admin Panel"

# Step 1: Update system
log_step "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install essential packages
log_step "2. Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common ufw htop

# Step 3: Install Node.js
log_step "3. Installing Node.js 18.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log_info "✅ Node.js $NODE_VERSION installed"
log_info "✅ npm $NPM_VERSION installed"

# Step 4: Install PM2
log_step "4. Installing PM2 process manager..."
sudo npm install -g pm2

# Step 5: Install Nginx
log_step "5. Installing Nginx web server..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
log_info "✅ Nginx installed and started"

# Step 6: Install Certbot for SSL
log_step "6. Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx
log_info "✅ Certbot installed"

# Step 7: Configure firewall
log_step "7. Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable
log_info "✅ Firewall configured"

# Step 8: Create application directory
log_step "8. Creating application directory..."
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
log_info "✅ Application directory created"

# Step 9: Setup PM2 startup
log_step "9. Setting up PM2 startup script..."
pm2 startup | grep "sudo env" | bash
log_info "✅ PM2 startup configured"

# Step 10: Create log directories
log_step "10. Creating log directories..."
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
log_info "✅ Log directories created"

# Step 11: Install additional security tools
log_step "11. Installing security tools..."
sudo apt install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
log_info "✅ Fail2ban installed and configured"

# Step 12: Setup automatic security updates
log_step "12. Setting up automatic security updates..."
sudo apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades
sudo systemctl enable unattended-upgrades
log_info "✅ Automatic security updates configured"

# Step 13: Optimize system settings
log_step "13. Optimizing system settings..."
echo "fs.file-max = 65536" | sudo tee -a /etc/sysctl.conf
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
sudo sysctl -p
log_info "✅ System settings optimized"

# Step 14: Create swap file (if not exists)
log_step "14. Checking swap configuration..."
if [ ! -f /swapfile ]; then
    log_info "Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    log_info "✅ Swap file created"
else
    log_info "✅ Swap file already exists"
fi

# Step 15: Display system information
log_step "15. System information:"
echo "----------------------------------------"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "CPU: $(nproc) cores"
echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $4}') available"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"
echo "----------------------------------------"

# Final instructions
log_info "🎉 VPS setup completed successfully!"
echo ""
log_info "Next steps:"
echo "1. Upload your application code to /var/www/"
echo "2. Configure your domain DNS to point to this server"
echo "3. Update environment variables in .env.production"
echo "4. Run the deployment script: ./deploy.sh"
echo ""
log_info "Useful commands:"
echo "  pm2 status                 - Check running processes"
echo "  sudo nginx -t              - Test Nginx configuration"
echo "  sudo systemctl status nginx - Check Nginx status"
echo "  sudo ufw status            - Check firewall status"
echo "  htop                       - Monitor system resources"
echo ""
log_warn "Remember to:"
echo "- Change default passwords"
echo "- Configure SSH key authentication"
echo "- Set up regular backups"
echo "- Monitor system logs"

log_info "✅ Your VPS is now ready for deployment!"
