const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const REPO_PATH = process.env.REPO_PATH || '/var/www/turkish-learning-admin';

// Middleware
app.use(express.json());

// Logging function
const log = (message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
};

// Verify GitHub webhook signature
const verifySignature = (req, res, next) => {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        return res.status(401).json({ error: 'No signature provided' });
    }

    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    next();
};

// Deployment function
const deploy = () => {
    return new Promise((resolve, reject) => {
        const deployScript = path.join(REPO_PATH, 'admin-panel', 'deploy.sh');
        
        log('Starting deployment...');
        
        exec(`cd ${REPO_PATH} && ./admin-panel/deploy.sh production`, (error, stdout, stderr) => {
            if (error) {
                log(`Deployment error: ${error.message}`);
                reject(error);
                return;
            }
            
            if (stderr) {
                log(`Deployment stderr: ${stderr}`);
            }
            
            log(`Deployment stdout: ${stdout}`);
            log('Deployment completed successfully');
            resolve(stdout);
        });
    });
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Webhook endpoint
app.post('/webhook', verifySignature, async (req, res) => {
    const { ref, repository, commits } = req.body;
    
    log(`Received webhook for ${repository.full_name}`);
    log(`Branch: ${ref}`);
    log(`Commits: ${commits ? commits.length : 0}`);
    
    // Only deploy on push to main branch
    if (ref !== 'refs/heads/main') {
        log(`Ignoring push to ${ref} (not main branch)`);
        return res.json({ message: 'Ignored: not main branch' });
    }
    
    // Check if there are actual changes to deploy
    if (!commits || commits.length === 0) {
        log('No commits found, skipping deployment');
        return res.json({ message: 'No commits to deploy' });
    }
    
    try {
        // Start deployment
        res.json({ message: 'Deployment started' });
        
        const result = await deploy();
        log('Webhook deployment completed successfully');
        
        // Optional: Send notification (Slack, Discord, etc.)
        // await sendNotification('Deployment successful', result);
        
    } catch (error) {
        log(`Webhook deployment failed: ${error.message}`);
        
        // Optional: Send error notification
        // await sendNotification('Deployment failed', error.message);
    }
});

// Manual deployment endpoint (for testing)
app.post('/deploy', async (req, res) => {
    const { secret } = req.body;
    
    if (secret !== SECRET) {
        return res.status(401).json({ error: 'Invalid secret' });
    }
    
    try {
        log('Manual deployment triggered');
        const result = await deploy();
        res.json({ message: 'Deployment successful', output: result });
    } catch (error) {
        log(`Manual deployment failed: ${error.message}`);
        res.status(500).json({ error: 'Deployment failed', message: error.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    log(`Error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    log(`Webhook server running on port ${PORT}`);
    log(`Repository path: ${REPO_PATH}`);
    log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
    log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});
