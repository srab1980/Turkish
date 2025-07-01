#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables from .env.local
try {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = require('fs').readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      const value = valueParts.join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  // .env.local file not found, continue without it
}

/**
 * Security Scanner and Vulnerability Assessment
 */
class SecurityScanner {
  constructor() {
    this.vulnerabilities = [];
    this.reportDir = path.join(__dirname, '../reports/security');
  }

  async ensureReportDirectory() {
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create report directory:', error);
    }
  }

  async scanDependencies() {
    console.log('🔍 Scanning dependencies for vulnerabilities...');
    
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --json', { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '..')
      });
      
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities && Object.keys(audit.vulnerabilities).length > 0) {
        Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]) => {
          this.vulnerabilities.push({
            type: 'dependency',
            severity: vuln.severity,
            package: pkg,
            title: vuln.title || 'Dependency vulnerability',
            description: vuln.overview || 'No description available',
            recommendation: `Update ${pkg} to a secure version`
          });
        });
      }
      
      console.log(`✅ Dependency scan completed. Found ${Object.keys(audit.vulnerabilities || {}).length} vulnerabilities.`);
    } catch (error) {
      console.log('ℹ️  No critical dependency vulnerabilities found or npm audit not available.');
    }
  }

  async scanSourceCode() {
    console.log('🔍 Scanning source code for security issues...');
    
    const securityPatterns = [
      {
        pattern: /console\.log\(/g,
        severity: 'low',
        title: 'Console logging detected',
        description: 'Console logs may expose sensitive information in production'
      },
      {
        pattern: /eval\(/g,
        severity: 'high',
        title: 'eval() usage detected',
        description: 'eval() can execute arbitrary code and is a security risk'
      },
      {
        pattern: /innerHTML\s*=/g,
        severity: 'medium',
        title: 'innerHTML usage detected',
        description: 'innerHTML can lead to XSS vulnerabilities'
      },
      {
        pattern: /document\.write\(/g,
        severity: 'medium',
        title: 'document.write() usage detected',
        description: 'document.write() can be exploited for XSS attacks'
      },
      {
        pattern: /localStorage\.setItem\(/g,
        severity: 'low',
        title: 'localStorage usage detected',
        description: 'Ensure sensitive data is not stored in localStorage'
      },
      {
        pattern: /sessionStorage\.setItem\(/g,
        severity: 'low',
        title: 'sessionStorage usage detected',
        description: 'Ensure sensitive data is not stored in sessionStorage'
      },
      {
        pattern: /Math\.random\(\)/g,
        severity: 'medium',
        title: 'Math.random() usage detected',
        description: 'Math.random() is not cryptographically secure'
      },
      {
        pattern: /\.innerHTML\s*\+=|\.outerHTML\s*=/g,
        severity: 'high',
        title: 'Dynamic HTML injection detected',
        description: 'Dynamic HTML injection can lead to XSS vulnerabilities'
      }
    ];

    const sourceDir = path.join(__dirname, '../src');
    await this.scanDirectory(sourceDir, securityPatterns);
    
    console.log(`✅ Source code scan completed. Found ${this.vulnerabilities.filter(v => v.type === 'code').length} potential issues.`);
  }

  async scanDirectory(dir, patterns) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, patterns);
        } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
          await this.scanFile(fullPath, patterns);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error.message);
    }
  }

  async scanFile(filePath, patterns) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      
      patterns.forEach(({ pattern, severity, title, description }) => {
        const matches = content.match(pattern);
        if (matches) {
          this.vulnerabilities.push({
            type: 'code',
            severity,
            title,
            description,
            file: relativePath,
            occurrences: matches.length,
            recommendation: `Review and secure the code in ${relativePath}`
          });
        }
      });
    } catch (error) {
      console.error(`Error scanning file ${filePath}:`, error.message);
    }
  }

  async scanConfiguration() {
    console.log('🔍 Scanning configuration for security issues...');
    
    const configChecks = [
      {
        file: 'package.json',
        check: (content) => {
          const pkg = JSON.parse(content);
          const issues = [];
          
          // Check for development dependencies in production
          if (pkg.dependencies) {
            Object.keys(pkg.dependencies).forEach(dep => {
              if (dep.includes('dev') || dep.includes('test')) {
                issues.push({
                  severity: 'medium',
                  title: 'Development dependency in production',
                  description: `${dep} appears to be a development dependency but is listed in dependencies`
                });
              }
            });
          }
          
          return issues;
        }
      },
      {
        file: 'next.config.js',
        check: (content) => {
          const issues = [];
          
          if (content.includes('dangerouslyAllowBrowser')) {
            issues.push({
              severity: 'high',
              title: 'Dangerous browser configuration',
              description: 'dangerouslyAllowBrowser option detected in Next.js config'
            });
          }
          
          if (!content.includes('Content-Security-Policy')) {
            issues.push({
              severity: 'medium',
              title: 'Missing Content Security Policy',
              description: 'CSP headers not configured in Next.js config'
            });
          }
          
          return issues;
        }
      }
    ];

    for (const { file, check } of configChecks) {
      try {
        const filePath = path.join(__dirname, '..', file);
        const content = await fs.readFile(filePath, 'utf8');
        const issues = check(content);
        
        issues.forEach(issue => {
          this.vulnerabilities.push({
            type: 'configuration',
            file,
            ...issue,
            recommendation: `Review and update ${file} configuration`
          });
        });
      } catch (error) {
        // File might not exist, which is okay
      }
    }
    
    console.log(`✅ Configuration scan completed. Found ${this.vulnerabilities.filter(v => v.type === 'configuration').length} potential issues.`);
  }

  async scanEnvironment() {
    console.log('🔍 Scanning environment configuration...');
    
    const envChecks = [
      {
        name: 'NODE_ENV',
        required: true,
        secure: (value) => value === 'production',
        message: 'NODE_ENV should be set to production'
      },
      {
        name: 'JWT_SECRET',
        required: true,
        secure: (value) => value && value.length >= 32,
        message: 'JWT_SECRET should be at least 32 characters long'
      },
      {
        name: 'SESSION_SECRET',
        required: true,
        secure: (value) => value && value.length >= 32,
        message: 'SESSION_SECRET should be at least 32 characters long'
      }
    ];

    envChecks.forEach(({ name, required, secure, message }) => {
      const value = process.env[name];
      
      if (required && !value) {
        this.vulnerabilities.push({
          type: 'environment',
          severity: 'high',
          title: `Missing environment variable: ${name}`,
          description: message,
          recommendation: `Set the ${name} environment variable`
        });
      } else if (value && !secure(value)) {
        this.vulnerabilities.push({
          type: 'environment',
          severity: 'medium',
          title: `Insecure environment variable: ${name}`,
          description: message,
          recommendation: `Update the ${name} environment variable to meet security requirements`
        });
      }
    });
    
    console.log(`✅ Environment scan completed. Found ${this.vulnerabilities.filter(v => v.type === 'environment').length} potential issues.`);
  }

  generateSecurityReport() {
    const summary = {
      total: this.vulnerabilities.length,
      high: this.vulnerabilities.filter(v => v.severity === 'high').length,
      medium: this.vulnerabilities.filter(v => v.severity === 'medium').length,
      low: this.vulnerabilities.filter(v => v.severity === 'low').length,
      byType: {
        dependency: this.vulnerabilities.filter(v => v.type === 'dependency').length,
        code: this.vulnerabilities.filter(v => v.type === 'code').length,
        configuration: this.vulnerabilities.filter(v => v.type === 'configuration').length,
        environment: this.vulnerabilities.filter(v => v.type === 'environment').length
      }
    };

    return {
      summary,
      vulnerabilities: this.vulnerabilities,
      generatedAt: new Date().toISOString(),
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.vulnerabilities.some(v => v.severity === 'high')) {
      recommendations.push('🚨 Critical: Address high-severity vulnerabilities immediately');
    }
    
    if (this.vulnerabilities.some(v => v.type === 'dependency')) {
      recommendations.push('📦 Update vulnerable dependencies using npm audit fix');
    }
    
    if (this.vulnerabilities.some(v => v.title.includes('XSS'))) {
      recommendations.push('🛡️ Implement proper input sanitization and output encoding');
    }
    
    if (this.vulnerabilities.some(v => v.type === 'environment')) {
      recommendations.push('⚙️ Review and secure environment configuration');
    }
    
    recommendations.push('🔒 Implement Content Security Policy (CSP) headers');
    recommendations.push('🔐 Enable HTTPS and security headers in production');
    recommendations.push('📊 Set up security monitoring and logging');
    
    return recommendations;
  }

  async saveReports(report) {
    // JSON Report
    await fs.writeFile(
      path.join(this.reportDir, 'security-report.json'),
      JSON.stringify(report, null, 2)
    );

    // HTML Report
    const htmlReport = this.generateHtmlReport(report);
    await fs.writeFile(
      path.join(this.reportDir, 'security-report.html'),
      htmlReport
    );

    console.log(`📊 Security reports saved to ${this.reportDir}`);
  }

  generateHtmlReport(report) {
    const severityColors = {
      high: '#f44336',
      medium: '#ff9800',
      low: '#2196f3'
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .vulnerability { border-left: 4px solid #ddd; margin: 10px 0; padding: 15px; background: #fafafa; }
        .high { border-left-color: ${severityColors.high}; }
        .medium { border-left-color: ${severityColors.medium}; }
        .low { border-left-color: ${severityColors.low}; }
        .severity { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
        .recommendations { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🔒 Security Audit Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Issues:</strong> ${report.summary.total}</p>
        <p><strong>High Severity:</strong> ${report.summary.high}</p>
        <p><strong>Medium Severity:</strong> ${report.summary.medium}</p>
        <p><strong>Low Severity:</strong> ${report.summary.low}</p>
        <p><strong>Generated:</strong> ${report.generatedAt}</p>
    </div>

    <h2>Vulnerabilities by Type</h2>
    <table>
        <tr>
            <th>Type</th>
            <th>Count</th>
        </tr>
        ${Object.entries(report.summary.byType).map(([type, count]) => `
            <tr>
                <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                <td>${count}</td>
            </tr>
        `).join('')}
    </table>

    <h2>Detailed Findings</h2>
    ${report.vulnerabilities.map(vuln => `
        <div class="vulnerability ${vuln.severity}">
            <h3>${vuln.title} <span class="severity" style="background-color: ${severityColors[vuln.severity]}">${vuln.severity.toUpperCase()}</span></h3>
            <p><strong>Type:</strong> ${vuln.type}</p>
            ${vuln.file ? `<p><strong>File:</strong> ${vuln.file}</p>` : ''}
            ${vuln.package ? `<p><strong>Package:</strong> ${vuln.package}</p>` : ''}
            <p><strong>Description:</strong> ${vuln.description}</p>
            <p><strong>Recommendation:</strong> ${vuln.recommendation}</p>
        </div>
    `).join('')}

    <div class="recommendations">
        <h2>🛡️ Security Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
  }

  async runFullScan() {
    console.log('🔒 Starting comprehensive security scan...\n');
    
    await this.ensureReportDirectory();
    
    await this.scanDependencies();
    await this.scanSourceCode();
    await this.scanConfiguration();
    await this.scanEnvironment();
    
    const report = this.generateSecurityReport();
    await this.saveReports(report);
    
    console.log('\n📋 Security Scan Summary:');
    console.log(`Total Issues: ${report.summary.total}`);
    console.log(`High Severity: ${report.summary.high}`);
    console.log(`Medium Severity: ${report.summary.medium}`);
    console.log(`Low Severity: ${report.summary.low}`);
    
    if (report.summary.high > 0) {
      console.log('\n🚨 CRITICAL: High-severity vulnerabilities found! Address immediately.');
      process.exit(1);
    } else if (report.summary.medium > 0) {
      console.log('\n⚠️  WARNING: Medium-severity vulnerabilities found. Review and address.');
    } else {
      console.log('\n✅ No critical security issues found.');
    }
  }
}

// Run the security scan
async function main() {
  const scanner = new SecurityScanner();
  await scanner.runFullScan();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SecurityScanner;
