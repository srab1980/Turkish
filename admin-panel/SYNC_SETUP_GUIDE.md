# 🔄 Local to VPS Sync Setup Guide

This guide will help you set up automatic synchronization between your local development environment and your Hostinger VPS.

## 🎯 **Sync Options Available**

### **Option 1: GitHub Actions CI/CD (Recommended)**
- ✅ Automatic deployment on git push
- ✅ Built-in testing and validation
- ✅ Rollback capabilities
- ✅ Professional workflow

### **Option 2: Direct SSH Deployment**
- ✅ Instant deployment from local machine
- ✅ No GitHub dependency
- ✅ Full control over deployment process

### **Option 3: File Watching Auto-Deploy**
- ✅ Automatic deployment on file changes
- ✅ Real-time sync during development
- ✅ Debounced deployments

### **Option 4: Webhook-Based Deployment**
- ✅ Instant deployment via webhooks
- ✅ Can be triggered from anywhere
- ✅ Integration with external services

## 🚀 **Quick Setup (Recommended Path)**

### **Step 1: Setup SSH Connection**
```bash
# Run the SSH setup script
npm run sync:setup

# This will:
# - Generate SSH keys
# - Copy keys to your VPS
# - Test the connection
# - Create .env.deploy file
```

### **Step 2: Test Manual Deployment**
```bash
# Deploy current changes to VPS
npm run sync:deploy
```

### **Step 3: Enable Auto-Sync (Optional)**
```bash
# Watch for changes and auto-deploy
npm run sync:watch
```

## 🔧 **Detailed Setup Instructions**

### **Option 1: GitHub Actions Setup**

#### **1. Create GitHub Repository**
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/yourusername/turkish-learning-admin.git
git push -u origin main
```

#### **2. Add GitHub Secrets**
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VPS_HOST`: Your VPS IP address
- `VPS_USERNAME`: Your VPS username (e.g., deploy)
- `VPS_SSH_KEY`: Your private SSH key content
- `VPS_PORT`: SSH port (usually 22)

#### **3. Enable GitHub Actions**
The workflow file is already created at `.github/workflows/deploy.yml`

#### **4. Deploy by Pushing to Main**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### **Option 2: Direct SSH Deployment Setup**

#### **1. Run SSH Setup**
```bash
npm run sync:setup
```

#### **2. Configure VPS Details**
The script will ask for:
- VPS IP address
- Username (default: deploy)
- SSH port (default: 22)
- Email for SSH key

#### **3. Deploy Commands**
```bash
# One-time deployment
npm run sync:deploy

# Watch for changes and auto-deploy
npm run sync:watch
```

### **Option 3: Webhook Setup**

#### **1. Install Webhook Server on VPS**
```bash
# On your VPS
cd /var/www/turkish-learning-admin/admin-panel
npm install express
pm2 start webhook-server.js --name turkish-webhook
```

#### **2. Configure GitHub Webhook**
1. Go to GitHub repository → Settings → Webhooks
2. Add webhook URL: `http://your-vps-ip:9000/webhook`
3. Set content type: `application/json`
4. Set secret: `your-webhook-secret`
5. Select events: `Push events`

#### **3. Update Environment Variables**
```bash
# On your VPS, create webhook environment
echo "WEBHOOK_SECRET=your-webhook-secret" >> .env.webhook
echo "WEBHOOK_PORT=9000" >> .env.webhook
echo "REPO_PATH=/var/www/turkish-learning-admin" >> .env.webhook
```

## 📋 **Configuration Files**

### **.env.deploy** (Created by setup script)
```bash
VPS_HOST=your-vps-ip
VPS_USER=deploy
VPS_PORT=22
SSH_KEY_PATH=~/.ssh/id_rsa
```

### **GitHub Secrets Required**
- `VPS_HOST`: Your VPS IP
- `VPS_USERNAME`: VPS username
- `VPS_SSH_KEY`: Private SSH key content
- `VPS_PORT`: SSH port

## 🎮 **Usage Commands**

### **Setup Commands**
```bash
npm run sync:setup          # Initial SSH setup
```

### **Deployment Commands**
```bash
npm run sync:deploy         # Deploy current changes
npm run sync:watch          # Watch and auto-deploy
npm run webhook:start       # Start webhook server
npm run webhook:pm2         # Start webhook with PM2
```

### **GitHub Actions**
```bash
git push origin main        # Triggers automatic deployment
```

## 🔍 **Monitoring & Troubleshooting**

### **Check Deployment Status**
```bash
# On VPS - Check application status
pm2 status
pm2 logs turkish-learning-admin

# Check webhook server (if using)
pm2 logs turkish-webhook
```

### **Manual Deployment Test**
```bash
# Test SSH connection
ssh deploy@your-vps-ip

# Test deployment script
./scripts/deploy-to-vps.sh
```

### **Common Issues**

#### **SSH Connection Failed**
```bash
# Regenerate SSH keys
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
ssh-copy-id deploy@your-vps-ip
```

#### **Permission Denied**
```bash
# Fix file permissions on VPS
sudo chown -R deploy:deploy /var/www/turkish-learning-admin
chmod +x /var/www/turkish-learning-admin/admin-panel/scripts/*.sh
```

#### **Build Failures**
```bash
# Check Node.js version on VPS
node --version  # Should be 18.x

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🚦 **Deployment Workflow**

### **Development Workflow**
1. **Make changes** in your local environment
2. **Test locally**: `npm run dev`
3. **Deploy**: Choose your preferred method:
   - `git push origin main` (GitHub Actions)
   - `npm run sync:deploy` (Direct SSH)
   - Save files (if using `npm run sync:watch`)

### **Production Workflow**
1. **Changes detected** (git push or file change)
2. **Automatic testing** (if using GitHub Actions)
3. **Build application** on VPS
4. **Deploy with zero downtime**
5. **Health check** verification
6. **Rollback** if deployment fails

## 🔒 **Security Considerations**

### **SSH Security**
- Use SSH keys instead of passwords
- Disable root login
- Change default SSH port
- Use fail2ban for intrusion prevention

### **Webhook Security**
- Use strong webhook secrets
- Validate webhook signatures
- Restrict webhook access by IP
- Monitor webhook logs

### **Environment Variables**
- Never commit secrets to git
- Use different secrets for production
- Rotate secrets regularly
- Use environment-specific configurations

## 🎉 **Success Verification**

Your sync setup is working when:

1. ✅ **SSH connection** works without password
2. ✅ **Manual deployment** completes successfully
3. ✅ **Application restarts** after deployment
4. ✅ **Health check** passes after deployment
5. ✅ **Changes appear** on live site

### **Test Your Setup**
```bash
# 1. Test SSH
ssh deploy@your-vps-ip "echo 'SSH works'"

# 2. Test deployment
npm run sync:deploy

# 3. Check application
curl https://yourdomain.com/api/health

# 4. Test auto-sync (if enabled)
echo "// Test change" >> src/test.js
# Wait for auto-deployment
```

## 📞 **Support & Troubleshooting**

### **Logs to Check**
```bash
# Application logs
pm2 logs turkish-learning-admin

# Deployment logs
tail -f /var/log/deploy.log

# System logs
sudo journalctl -f

# Webhook logs (if using)
pm2 logs turkish-webhook
```

### **Emergency Rollback**
```bash
# On VPS - rollback to previous version
cd /var/www/turkish-learning-admin
git checkout HEAD~1
cd admin-panel
npm run build
pm2 restart turkish-learning-admin
```

Your local-to-VPS sync is now ready! Choose the method that best fits your workflow and start deploying with confidence! 🚀
