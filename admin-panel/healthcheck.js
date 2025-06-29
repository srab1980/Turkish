#!/usr/bin/env node

/**
 * Health Check Script for Turkish Learning Platform Admin Panel
 * This script performs basic health checks for the application
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const TIMEOUT = 5000; // 5 seconds

/**
 * Perform HTTP health check
 */
function httpHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'healthy', statusCode: res.statusCode });
      } else {
        reject(new Error(`HTTP health check failed with status ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(new Error(`HTTP health check failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTP health check timed out'));
    });

    req.end();
  });
}

/**
 * Check if required files exist
 */
function fileSystemHealthCheck() {
  const requiredFiles = [
    'package.json',
    '.next/BUILD_ID'
  ];

  const missingFiles = [];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
  }

  return { status: 'healthy', message: 'All required files present' };
}

/**
 * Check memory usage
 */
function memoryHealthCheck() {
  const memoryUsage = process.memoryUsage();
  const maxHeapSize = 512 * 1024 * 1024; // 512MB threshold

  if (memoryUsage.heapUsed > maxHeapSize) {
    throw new Error(`High memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
  }

  return {
    status: 'healthy',
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
    rss: Math.round(memoryUsage.rss / 1024 / 1024)
  };
}

/**
 * Check process uptime
 */
function uptimeHealthCheck() {
  const uptime = process.uptime();
  
  return {
    status: 'healthy',
    uptime: Math.round(uptime),
    uptimeFormatted: formatUptime(uptime)
  };
}

/**
 * Format uptime in human readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Check environment variables
 */
function environmentHealthCheck() {
  const requiredEnvVars = ['NODE_ENV'];
  const missingEnvVars = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
  }

  return {
    status: 'healthy',
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version
  };
}

/**
 * Run all health checks
 */
async function runHealthChecks() {
  const results = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {}
  };

  const checks = [
    { name: 'http', fn: httpHealthCheck },
    { name: 'filesystem', fn: fileSystemHealthCheck },
    { name: 'memory', fn: memoryHealthCheck },
    { name: 'uptime', fn: uptimeHealthCheck },
    { name: 'environment', fn: environmentHealthCheck }
  ];

  let hasFailures = false;

  for (const check of checks) {
    try {
      results.checks[check.name] = await check.fn();
    } catch (error) {
      results.checks[check.name] = {
        status: 'unhealthy',
        error: error.message
      };
      hasFailures = true;
    }
  }

  if (hasFailures) {
    results.status = 'unhealthy';
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  try {
    const results = await runHealthChecks();
    
    if (results.status === 'healthy') {
      console.log('✅ Health check passed');
      if (process.env.VERBOSE === 'true') {
        console.log(JSON.stringify(results, null, 2));
      }
      process.exit(0);
    } else {
      console.error('❌ Health check failed');
      console.error(JSON.stringify(results, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    process.exit(1);
  }
}

// Run health check if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runHealthChecks,
  httpHealthCheck,
  fileSystemHealthCheck,
  memoryHealthCheck,
  uptimeHealthCheck,
  environmentHealthCheck
};
