# 🚀 Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### 🔐 Security
- [ ] Update all default passwords and secrets
- [ ] Generate secure JWT secrets (minimum 32 characters)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper CORS origins
- [ ] Enable security headers in Nginx
- [ ] Configure rate limiting
- [ ] Set up firewall rules (UFW)
- [ ] Disable debug mode and development features

### 🌐 Domain & DNS
- [ ] Domain purchased and configured
- [ ] DNS A record pointing to VPS IP
- [ ] DNS AAAA record for IPv6 (if applicable)
- [ ] WWW subdomain configured
- [ ] SSL certificate obtained and configured

### 🖥️ Server Configuration
- [ ] VPS meets minimum requirements (2GB RAM, 2 CPU cores)
- [ ] Ubuntu 20.04/22.04 LTS installed
- [ ] Non-root user created with sudo privileges
- [ ] SSH key authentication configured
- [ ] Automatic security updates enabled
- [ ] Fail2ban installed and configured

### 📦 Application Setup
- [ ] Node.js 18.x LTS installed
- [ ] PM2 process manager installed and configured
- [ ] Nginx web server installed and configured
- [ ] Application built successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] Health check endpoint working

## 🔧 Environment Variables to Update

### Required Updates in `.env.production`:
```bash
# Domains (CRITICAL - Update these)
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXTAUTH_URL=https://yourdomain.com
ADMIN_BASE_URL=https://yourdomain.com
WEB_BASE_URL=https://yourdomain.com

# Security Secrets (CRITICAL - Generate new ones)
NEXTAUTH_SECRET=your-super-secure-secret-key-here-min-32-chars
JWT_SECRET=your-jwt-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters
SESSION_SECRET=your-session-secret-at-least-32-characters
ENCRYPTION_KEY=your-encryption-key-exactly-32-chars

# Email Configuration (Update with your SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# External Services (Optional but recommended)
OPENAI_API_KEY=your-openai-api-key-if-using-ai-features
SENTRY_DSN=your-sentry-dsn-for-error-tracking
```

### Generate Secure Secrets:
```bash
# Generate 32-character secrets
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 Deployment Steps

### 1. Server Preparation
```bash
# Connect to VPS
ssh deploy@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required software
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/turkish-learning-admin.git
cd turkish-learning-admin/admin-panel

# Install dependencies and build
npm ci --only=production
npm run build

# Configure environment
cp .env.production.example .env.production
nano .env.production  # Update with your values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow the instructions
```

### 3. Nginx Configuration
```bash
# Copy and update Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/turkish-learning-admin
# Edit the file to replace yourdomain.com with your actual domain
sudo nano /etc/nginx/sites-available/turkish-learning-admin

# Enable site
sudo ln -s /etc/nginx/sites-available/turkish-learning-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate
```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Firewall Setup
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## ✅ Post-Deployment Verification

### Application Health
- [ ] Application starts without errors: `pm2 status`
- [ ] Health check responds: `curl https://yourdomain.com/api/health`
- [ ] Login page loads: `curl https://yourdomain.com/login`
- [ ] Admin login works with test credentials
- [ ] All main pages load without errors

### Security Verification
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate is valid and trusted
- [ ] Security headers are present
- [ ] Rate limiting is working
- [ ] No sensitive information in client-side code

### Performance Verification
- [ ] Page load times are acceptable (< 3 seconds)
- [ ] Static assets are cached properly
- [ ] Gzip compression is working
- [ ] Memory usage is reasonable (< 80% of available)

## 🔍 Monitoring Setup

### Log Monitoring
```bash
# Application logs
pm2 logs turkish-learning-admin

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
```

### Performance Monitoring
```bash
# System resources
htop
df -h
free -h

# Application performance
pm2 monit
```

## 🚨 Backup Strategy

### Database Backup (if applicable)
```bash
# Setup automated backups
sudo crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

### Application Backup
```bash
# Backup application files
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/turkish-learning-admin
```

## 🔄 Maintenance Tasks

### Regular Updates
- [ ] Setup automatic security updates
- [ ] Schedule regular dependency updates
- [ ] Monitor for security vulnerabilities
- [ ] Update SSL certificates before expiry

### Performance Optimization
- [ ] Monitor and optimize database queries
- [ ] Implement caching strategies
- [ ] Optimize static asset delivery
- [ ] Monitor and scale resources as needed

## 📞 Emergency Procedures

### Application Issues
```bash
# Restart application
pm2 restart turkish-learning-admin

# Check logs for errors
pm2 logs turkish-learning-admin --lines 100

# Rollback to previous version
git checkout previous-stable-tag
npm run build
pm2 restart turkish-learning-admin
```

### Server Issues
```bash
# Check system resources
df -h
free -h
top

# Restart services
sudo systemctl restart nginx
sudo systemctl restart pm2-deploy
```

## 📋 Final Checklist

- [ ] All environment variables updated with production values
- [ ] SSL certificate installed and working
- [ ] Application accessible via HTTPS
- [ ] Admin login working
- [ ] All features tested in production environment
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented
- [ ] Emergency procedures documented
- [ ] Team notified of deployment
- [ ] Documentation updated

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Application loads at https://yourdomain.com
2. ✅ Admin can login successfully
3. ✅ All main features work as expected
4. ✅ SSL certificate is valid
5. ✅ Performance is acceptable
6. ✅ Monitoring is in place
7. ✅ Backups are configured

## 📞 Support

If you encounter issues during deployment:
1. Check the logs: `pm2 logs turkish-learning-admin`
2. Verify configuration: `sudo nginx -t`
3. Check system resources: `htop`, `df -h`, `free -h`
4. Review this checklist for missed steps
5. Consult the DEPLOYMENT_GUIDE.md for detailed instructions
