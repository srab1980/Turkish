# 🚀 GitHub Actions CI/CD Setup Guide

This guide will help you set up automated deployment using GitHub Actions for your Turkish Learning Admin Panel.

## 📋 Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **VPS Access**: SSH access to your Hostinger VPS
3. **Domain Configured**: Your domain pointing to the VPS

## 🔧 Step 1: Create GitHub Repository

### If you don't have a repository yet:
```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Turkish Learning Admin Panel"

# Create repository on GitHub (via web interface)
# Then add remote origin
git remote add origin https://github.com/yourusername/turkish-learning-admin.git

# Push to GitHub
git push -u origin main
```

## 🔐 Step 2: Configure GitHub Secrets

### Navigate to Repository Settings:
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Required Secrets:

#### **VPS_HOST**
- **Name**: `VPS_HOST`
- **Value**: Your VPS IP address (e.g., `123.456.789.012`)

#### **VPS_USERNAME**
- **Name**: `VPS_USERNAME`
- **Value**: Your VPS username (e.g., `deploy`)

#### **VPS_SSH_KEY**
- **Name**: `VPS_SSH_KEY`
- **Value**: Your private SSH key content

To get your SSH key:
```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Display private key content
cat ~/.ssh/id_rsa
```

Copy the entire content including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[key content]
-----END OPENSSH PRIVATE KEY-----
```

#### **VPS_PORT** (Optional)
- **Name**: `VPS_PORT`
- **Value**: SSH port (default: `22`)

#### **SLACK_WEBHOOK** (Optional)
- **Name**: `SLACK_WEBHOOK`
- **Value**: Your Slack webhook URL for notifications

## 🔑 Step 3: Setup SSH Key on VPS

### Copy your public key to VPS:
```bash
# Copy public key to VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub deploy@your-vps-ip

# Or manually:
cat ~/.ssh/id_rsa.pub | ssh deploy@your-vps-ip 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
```

### Test SSH connection:
```bash
ssh deploy@your-vps-ip "echo 'SSH connection successful'"
```

## 📁 Step 4: Prepare VPS Directory Structure

### On your VPS, create the application directory:
```bash
# Connect to VPS
ssh deploy@your-vps-ip

# Create application directory
sudo mkdir -p /var/www/turkish-learning-admin
sudo chown deploy:deploy /var/www/turkish-learning-admin

# Clone your repository
cd /var/www
git clone https://github.com/yourusername/turkish-learning-admin.git

# Set permissions
sudo chown -R deploy:deploy turkish-learning-admin
```

## 🔧 Step 5: Configure VPS Environment

### Install required software (if not already done):
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Setup PM2 ecosystem:
```bash
cd /var/www/turkish-learning-admin/admin-panel

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🚀 Step 6: Test GitHub Actions

### Create a test commit:
```bash
# Make a small change
echo "// Test deployment" >> src/test-deploy.js

# Commit and push
git add .
git commit -m "Test: GitHub Actions deployment"
git push origin main
```

### Monitor the deployment:
1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the workflow run
4. Check the logs for any errors

## 📊 Step 7: Verify Deployment

### Check if deployment was successful:
```bash
# On your VPS, check application status
pm2 status

# Check application logs
pm2 logs turkish-learning-admin

# Test application health
curl http://localhost:3003/api/health

# Test external access
curl https://yourdomain.com/api/health
```

## 🔍 Troubleshooting

### Common Issues:

#### **SSH Connection Failed**
```bash
# Check SSH key format
cat ~/.ssh/id_rsa | head -1
# Should show: -----BEGIN OPENSSH PRIVATE KEY-----

# Test SSH connection manually
ssh -i ~/.ssh/id_rsa deploy@your-vps-ip
```

#### **Permission Denied**
```bash
# Fix VPS permissions
sudo chown -R deploy:deploy /var/www/turkish-learning-admin
chmod 755 /var/www/turkish-learning-admin
```

#### **Build Failures**
```bash
# Check Node.js version on VPS
node --version  # Should be 18.x

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **PM2 Issues**
```bash
# Restart PM2
pm2 restart turkish-learning-admin

# Check PM2 logs
pm2 logs turkish-learning-admin --lines 50

# Reset PM2
pm2 delete all
pm2 start ecosystem.config.js --env production
```

## 📝 Workflow Explanation

### What happens when you push to main:

1. **Test Job**:
   - Checks out code
   - Installs dependencies
   - Runs linting and type checking
   - Builds application

2. **Deploy Job** (only if tests pass):
   - Validates required secrets
   - Connects to VPS via SSH
   - Creates backup of current version
   - Pulls latest changes
   - Installs dependencies
   - Builds application
   - Restarts with PM2
   - Runs health check
   - Rolls back if deployment fails

3. **Notify Job** (optional):
   - Sends Slack notification about deployment status

## 🔄 Customizing the Workflow

### Modify deployment branches:
```yaml
on:
  push:
    branches: [ main, staging, production ]  # Add more branches
```

### Add environment-specific deployments:
```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/staging'
  # staging deployment steps

- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  # production deployment steps
```

### Add more tests:
```yaml
- name: Run security tests
  run: npm run test:security

- name: Run performance tests
  run: npm run test:performance
```

## 🎉 Success Criteria

Your GitHub Actions setup is working when:

1. ✅ **Secrets are configured** in GitHub repository
2. ✅ **SSH connection** works from GitHub to VPS
3. ✅ **Workflow runs** without errors
4. ✅ **Application deploys** successfully
5. ✅ **Health check** passes after deployment
6. ✅ **Live site** reflects your changes

## 📞 Support

### Useful GitHub Actions logs:
- Check the **Actions** tab in your repository
- Look for failed steps in red
- Expand log sections for detailed error messages

### VPS debugging:
```bash
# Check system resources
htop
df -h
free -h

# Check application status
pm2 status
pm2 logs turkish-learning-admin

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t
```

## 🚀 Next Steps

Once GitHub Actions is working:

1. **Set up staging environment** for testing
2. **Add more comprehensive tests** to the workflow
3. **Configure notifications** (Slack, email, etc.)
4. **Set up monitoring** and alerting
5. **Implement feature branch deployments**

Your automated deployment pipeline is now ready! Every push to the main branch will automatically deploy your changes to the VPS. 🎉
