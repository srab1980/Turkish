# 🚀 Hostinger VPS Deployment Guide

This guide will help you deploy the Turkish Learning Admin Panel to a Hostinger VPS server.

## 📋 Prerequisites

### VPS Requirements
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB SSD minimum (50GB recommended)
- **CPU**: 2 cores minimum
- **OS**: Ubuntu 20.04/22.04 LTS
- **Domain**: Pointed to your VPS IP address

### Local Requirements
- Git repository with your code
- Domain name configured with DNS pointing to VPS
- SSH access to your VPS

## 🔧 Step 1: Initial VPS Setup

### Connect to your VPS
```bash
ssh root@your-vps-ip
```

### Update system and create user
```bash
# Update system
apt update && apt upgrade -y

# Create a new user (replace 'deploy' with your preferred username)
adduser deploy
usermod -aG sudo deploy

# Switch to new user
su - deploy
```

### Install essential packages
```bash
sudo apt install -y curl wget git unzip software-properties-common ufw
```

## 🔧 Step 2: Install Required Software

### Install Node.js 18.x (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by the command above
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install Certbot for SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
```

## 🔧 Step 3: Prepare Your Application

### Upload your code to the VPS
```bash
# Option 1: Clone from Git repository
git clone https://github.com/yourusername/turkish-learning-admin.git
cd turkish-learning-admin/admin-panel

# Option 2: Upload via SCP
# scp -r ./admin-panel deploy@your-vps-ip:/home/deploy/
```

### Install dependencies and build
```bash
cd /home/deploy/turkish-learning-admin/admin-panel
npm ci --only=production
npm run build
```

## 🔧 Step 4: Configure Environment

### Update environment variables
```bash
# Copy and edit production environment file
cp .env.example .env.production
nano .env.production
```

**Important variables to update:**
```bash
# Replace with your actual domain
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXTAUTH_URL=https://yourdomain.com

# Generate secure secrets
NEXTAUTH_SECRET=your-super-secure-secret-key-here
JWT_SECRET=your-jwt-secret-at-least-32-characters
SESSION_SECRET=your-session-secret-at-least-32-characters

# Update domain references
ADMIN_BASE_URL=https://yourdomain.com
WEB_BASE_URL=https://yourdomain.com
```

### Update PM2 configuration
```bash
nano ecosystem.config.js
```

Update the domain in the configuration:
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3003,
  NEXT_PUBLIC_API_URL: 'https://yourdomain.com/api',
  // ... other variables
}
```

## 🔧 Step 5: Configure Nginx

### Update Nginx configuration
```bash
# Edit the nginx.conf file
nano nginx.conf
```

Replace `yourdomain.com` with your actual domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### Apply Nginx configuration
```bash
sudo cp nginx.conf /etc/nginx/sites-available/turkish-learning-admin
sudo ln -s /etc/nginx/sites-available/turkish-learning-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Step 6: Setup SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to obtain your SSL certificate.

## 🔧 Step 7: Deploy Application

### Start the application with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### Configure firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🔧 Step 8: Automated Deployment (Optional)

Make the deployment script executable and run it:
```bash
chmod +x deploy.sh
./deploy.sh production
```

## 🔍 Step 9: Verification

### Check application status
```bash
pm2 status
pm2 logs turkish-learning-admin
```

### Test the application
```bash
# Test local connection
curl http://localhost:3003

# Test external connection
curl https://yourdomain.com
```

### Monitor logs
```bash
# Application logs
pm2 logs turkish-learning-admin

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Step 10: Maintenance Commands

### Application Management
```bash
# Restart application
pm2 restart turkish-learning-admin

# Stop application
pm2 stop turkish-learning-admin

# View detailed info
pm2 show turkish-learning-admin

# Monitor in real-time
pm2 monit
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Renew certificates
sudo certbot renew
```

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   pm2 logs turkish-learning-admin
   # Check for Node.js version compatibility
   node --version
   ```

2. **502 Bad Gateway**
   ```bash
   # Check if application is running
   pm2 status
   # Check Nginx configuration
   sudo nginx -t
   ```

3. **SSL Certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   # Renew if needed
   sudo certbot renew
   ```

4. **Permission issues**
   ```bash
   # Fix ownership
   sudo chown -R deploy:deploy /var/www/turkish-learning-admin
   ```

## 📊 Monitoring & Logs

### Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/turkish-learning-admin
```

Add:
```
/var/log/pm2/turkish-learning-admin*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 deploy deploy
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Monitor Resources
```bash
# Check system resources
htop
df -h
free -h

# Check application performance
pm2 monit
```

## 🎉 Success!

Your Turkish Learning Admin Panel should now be running at:
- **HTTPS**: https://yourdomain.com
- **Admin Login**: Use the credentials from your application

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs turkish-learning-admin`
2. Verify Nginx configuration: `sudo nginx -t`
3. Check system resources: `htop` and `df -h`
4. Ensure all services are running: `pm2 status` and `sudo systemctl status nginx`
