#!/usr/bin/env node

/**
 * Comprehensive Bug Fix Script for Turkish Learning Admin Panel
 * This script automatically fixes the identified bugs and issues
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class BugFixer {
  constructor() {
    this.fixedIssues = [];
    this.errors = [];
  }

  async fixAll() {
    console.log('🔧 Starting comprehensive bug fixes...\n');

    try {
      await this.fixTypeScriptErrors();
      await this.fixUnusedImports();
      await this.fixConsoleStatements();
      await this.fixPackageJsonIssues();
      await this.fixNextConfigSecurity();
      await this.fixDataAccessPatterns();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Error during bug fixing:', error.message);
    }
  }

  async fixTypeScriptErrors() {
    console.log('🔍 Fixing TypeScript errors...');

    // Fix unused imports in exercises page
    await this.fixFile(
      'src/app/ai-tools/exercises/page.tsx',
      (content) => {
        return content
          .replace(/import.*PlayIcon.*from.*@heroicons\/react\/24\/outline.*;\n/g, '')
          .replace(/import.*XMarkIcon.*from.*@heroicons\/react\/24\/outline.*;\n/g, '')
          .replace(/PlayIcon,\s*/g, '')
          .replace(/XMarkIcon,?\s*/g, '');
      },
      'Removed unused PlayIcon and XMarkIcon imports'
    );

    // Fix unused useEffect import
    await this.fixFile(
      'src/app/ai-tools/import/page.tsx',
      (content) => {
        return content.replace(
          /import { useState, useEffect } from 'react';/,
          "import { useState } from 'react';"
        );
      },
      'Removed unused useEffect import'
    );

    // Fix data access pattern in import page
    await this.fixFile(
      'src/app/ai-tools/import/page.tsx',
      (content) => {
        return content.replace(
          /const importJobs = importJobsResponse\?\.data\?\.data \|\| \[\];/,
          'const importJobs = importJobsResponse?.data || [];'
        );
      },
      'Fixed data access pattern in import jobs'
    );

    console.log('✅ TypeScript errors fixed');
  }

  async fixUnusedImports() {
    console.log('🔍 Fixing unused imports...');

    const filesToFix = [
      {
        file: 'src/components/ai-tools/ExerciseGenerator.tsx',
        fixes: [
          { from: /XMarkIcon,\s*/, to: '' },
          { from: /PlusIcon,\s*/, to: '' },
          { from: /const \[selectedLesson, setSelectedLesson\] = useState<string>\(''\);/, to: '' }
        ]
      },
      {
        file: 'src/components/analytics/AnalyticsDashboard.tsx',
        fixes: [
          { from: /LineChart,\s*/, to: '' },
          { from: /Line,\s*/, to: '' },
          { from: /const userMetrics = userMetricsData\?\.data;/, to: '' }
        ]
      },
      {
        file: 'src/components/analytics/ReportsManager.tsx',
        fixes: [
          { from: /CalendarIcon,\s*/, to: '' },
          { from: /EyeIcon,\s*/, to: '' }
        ]
      }
    ];

    for (const { file, fixes } of filesToFix) {
      await this.fixFile(
        file,
        (content) => {
          let result = content;
          fixes.forEach(({ from, to }) => {
            result = result.replace(from, to);
          });
          return result;
        },
        `Fixed unused imports in ${file}`
      );
    }

    console.log('✅ Unused imports fixed');
  }

  async fixConsoleStatements() {
    console.log('🔍 Removing console.log statements...');

    const filesToFix = [
      'src/app/ai-tools/review/page.tsx',
      'src/app/content/vocabulary/page.tsx',
      'src/lib/api.ts'
    ];

    for (const file of filesToFix) {
      await this.fixFile(
        file,
        (content) => {
          return content.replace(/console\.log\([^)]*\);?\n?/g, '');
        },
        `Removed console.log statements from ${file}`
      );
    }

    console.log('✅ Console statements removed');
  }

  async fixPackageJsonIssues() {
    console.log('🔍 Fixing package.json issues...');

    const packageJsonPath = 'package.json';
    try {
      const content = await fs.readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);

      // Move devtools to devDependencies
      if (packageJson.dependencies && packageJson.dependencies['@tanstack/react-query-devtools']) {
        if (!packageJson.devDependencies) {
          packageJson.devDependencies = {};
        }
        packageJson.devDependencies['@tanstack/react-query-devtools'] = 
          packageJson.dependencies['@tanstack/react-query-devtools'];
        delete packageJson.dependencies['@tanstack/react-query-devtools'];

        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.fixedIssues.push('Moved @tanstack/react-query-devtools to devDependencies');
      }
    } catch (error) {
      this.errors.push(`Failed to fix package.json: ${error.message}`);
    }

    console.log('✅ Package.json issues fixed');
  }

  async fixNextConfigSecurity() {
    console.log('🔍 Adding security headers to Next.js config...');

    const nextConfigPath = 'next.config.js';
    try {
      let content = await fs.readFile(nextConfigPath, 'utf8');
      
      // Add security headers if not present
      if (!content.includes('Content-Security-Policy')) {
        const securityHeaders = `
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },`;

        content = content.replace(
          /module\.exports = nextConfig/,
          `module.exports = {
  ...nextConfig,${securityHeaders}
}`
        );

        await fs.writeFile(nextConfigPath, content);
        this.fixedIssues.push('Added security headers to Next.js config');
      }
    } catch (error) {
      this.errors.push(`Failed to fix Next.js config: ${error.message}`);
    }

    console.log('✅ Security headers added');
  }

  async fixDataAccessPatterns() {
    console.log('🔍 Fixing data access patterns...');

    // Fix CourseList component
    await this.fixFile(
      'src/components/content/CourseList.tsx',
      (content) => {
        return content
          .replace(
            /const courses = coursesResponse\?\.data\?\.data\?\.items \|\| \[\];/,
            'const courses = coursesResponse?.data || [];'
          )
          .replace(
            /const totalCourses = coursesResponse\?\.data\?\.data\?\.total \|\|/,
            'const totalCourses = coursesResponse?.data?.length ||'
          );
      },
      'Fixed data access patterns in CourseList'
    );

    // Fix analytics data access
    await this.fixFile(
      'src/components/analytics/AnalyticsDashboard.tsx',
      (content) => {
        return content
          .replace(/analytics\?\.(userGrowth|activeUserGrowth|courseGrowth|completionRate|completionRateChange|chartData|levelDistribution)/g, 
                   'analytics?.metrics?.$1')
          .replace(/analytics\.chartData/g, 'analytics?.chartData')
          .replace(/analytics\.completionRate/g, 'analytics?.completionRate');
      },
      'Fixed analytics data access patterns'
    );

    console.log('✅ Data access patterns fixed');
  }

  async fixFile(filePath, transformer, description) {
    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const newContent = transformer(content);
      
      if (content !== newContent) {
        await fs.writeFile(fullPath, newContent);
        this.fixedIssues.push(description);
      }
    } catch (error) {
      this.errors.push(`Failed to fix ${filePath}: ${error.message}`);
    }
  }

  async generateReport() {
    console.log('\n📋 Bug Fix Report:');
    console.log('==================');
    
    console.log(`\n✅ Fixed Issues (${this.fixedIssues.length}):`);
    this.fixedIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });

    if (this.errors.length > 0) {
      console.log(`\n❌ Errors (${this.errors.length}):`);
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      fixedIssues: this.fixedIssues,
      errors: this.errors,
      summary: {
        totalFixed: this.fixedIssues.length,
        totalErrors: this.errors.length,
        success: this.errors.length === 0
      }
    };

    await fs.writeFile('reports/bug-fix-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to reports/bug-fix-report.json');
  }
}

// Run the bug fixer
if (require.main === module) {
  const fixer = new BugFixer();
  fixer.fixAll().catch(console.error);
}

module.exports = BugFixer;
