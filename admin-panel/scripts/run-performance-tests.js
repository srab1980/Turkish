#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');
const { lighthouseConfig, lighthouseMobileConfig, performanceThresholds, testUrls } = require('../tests/performance/lighthouse-config');

/**
 * Performance Test Runner
 */
class PerformanceTestRunner {
  constructor() {
    this.results = [];
    this.reportDir = path.join(__dirname, '../reports/performance');
  }

  async ensureReportDirectory() {
    try {
      await fs.mkdir(this.reportDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create report directory:', error);
    }
  }

  async runLighthouseTest(url, config, formFactor = 'desktop') {
    console.log(`Running Lighthouse test for ${url} (${formFactor})...`);
    
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port,
      };

      const runnerResult = await lighthouse(url, options, config);
      
      if (!runnerResult) {
        throw new Error('Lighthouse failed to return results');
      }

      const { lhr } = runnerResult;
      
      return {
        url,
        formFactor,
        score: lhr.categories.performance.score * 100,
        metrics: {
          'first-contentful-paint': lhr.audits['first-contentful-paint'].numericValue,
          'largest-contentful-paint': lhr.audits['largest-contentful-paint'].numericValue,
          'first-meaningful-paint': lhr.audits['first-meaningful-paint'].numericValue,
          'speed-index': lhr.audits['speed-index'].numericValue,
          'interactive': lhr.audits['interactive'].numericValue,
          'total-blocking-time': lhr.audits['total-blocking-time'].numericValue,
          'cumulative-layout-shift': lhr.audits['cumulative-layout-shift'].numericValue,
        },
        opportunities: lhr.audits,
        timestamp: new Date().toISOString()
      };
    } finally {
      await chrome.kill();
    }
  }

  async runAllTests() {
    console.log('Starting performance test suite...\n');
    await this.ensureReportDirectory();

    for (const testUrl of testUrls) {
      try {
        // Desktop test
        const desktopResult = await this.runLighthouseTest(
          testUrl.url, 
          lighthouseConfig, 
          'desktop'
        );
        desktopResult.name = testUrl.name;
        this.results.push(desktopResult);

        // Mobile test
        const mobileResult = await this.runLighthouseTest(
          testUrl.url, 
          lighthouseMobileConfig, 
          'mobile'
        );
        mobileResult.name = testUrl.name;
        this.results.push(mobileResult);

        console.log(`✅ Completed tests for ${testUrl.name}`);
        console.log(`   Desktop Score: ${desktopResult.score.toFixed(1)}`);
        console.log(`   Mobile Score: ${mobileResult.score.toFixed(1)}\n`);

      } catch (error) {
        console.error(`❌ Failed to test ${testUrl.name}:`, error.message);
        
        // Add failed result
        this.results.push({
          url: testUrl.url,
          name: testUrl.name,
          formFactor: 'desktop',
          score: 0,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    await this.generateReports();
    this.analyzeResults();
  }

  async generateReports() {
    // Generate JSON report
    const jsonReport = {
      summary: this.generateSummary(),
      results: this.results,
      thresholds: performanceThresholds,
      generatedAt: new Date().toISOString()
    };

    await fs.writeFile(
      path.join(this.reportDir, 'performance-results.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // Generate HTML report
    const htmlReport = this.generateHtmlReport(jsonReport);
    await fs.writeFile(
      path.join(this.reportDir, 'performance-report.html'),
      htmlReport
    );

    // Generate CSV report
    const csvReport = this.generateCsvReport();
    await fs.writeFile(
      path.join(this.reportDir, 'performance-results.csv'),
      csvReport
    );

    console.log(`📊 Reports generated in ${this.reportDir}`);
  }

  generateSummary() {
    const summary = {
      totalTests: this.results.length,
      passedTests: 0,
      failedTests: 0,
      averageScores: {
        desktop: 0,
        mobile: 0
      },
      criticalIssues: []
    };

    const desktopResults = this.results.filter(r => r.formFactor === 'desktop' && !r.error);
    const mobileResults = this.results.filter(r => r.formFactor === 'mobile' && !r.error);

    summary.passedTests = desktopResults.length + mobileResults.length;
    summary.failedTests = this.results.filter(r => r.error).length;

    if (desktopResults.length > 0) {
      summary.averageScores.desktop = desktopResults.reduce((sum, r) => sum + r.score, 0) / desktopResults.length;
    }

    if (mobileResults.length > 0) {
      summary.averageScores.mobile = mobileResults.reduce((sum, r) => sum + r.score, 0) / mobileResults.length;
    }

    // Identify critical issues
    this.results.forEach(result => {
      if (result.metrics) {
        const thresholds = performanceThresholds[result.formFactor];
        Object.entries(result.metrics).forEach(([metric, value]) => {
          if (thresholds[metric] && value > thresholds[metric]) {
            summary.criticalIssues.push({
              page: result.name,
              formFactor: result.formFactor,
              metric,
              value,
              threshold: thresholds[metric]
            });
          }
        });
      }
    });

    return summary;
  }

  generateHtmlReport(jsonReport) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .score { font-size: 24px; font-weight: bold; }
        .good { color: #4CAF50; }
        .average { color: #FF9800; }
        .poor { color: #F44336; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }
        .metric { background: #f9f9f9; padding: 10px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Performance Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Tests:</strong> ${jsonReport.summary.totalTests}</p>
        <p><strong>Passed:</strong> ${jsonReport.summary.passedTests}</p>
        <p><strong>Failed:</strong> ${jsonReport.summary.failedTests}</p>
        <p><strong>Average Desktop Score:</strong> ${jsonReport.summary.averageScores.desktop.toFixed(1)}</p>
        <p><strong>Average Mobile Score:</strong> ${jsonReport.summary.averageScores.mobile.toFixed(1)}</p>
        <p><strong>Generated:</strong> ${jsonReport.generatedAt}</p>
    </div>

    ${jsonReport.results.map(result => `
        <div class="result">
            <h3>${result.name} (${result.formFactor})</h3>
            ${result.error ? `<p style="color: red;">Error: ${result.error}</p>` : `
                <div class="score ${result.score >= 90 ? 'good' : result.score >= 50 ? 'average' : 'poor'}">
                    Score: ${result.score.toFixed(1)}/100
                </div>
                <div class="metrics">
                    ${Object.entries(result.metrics).map(([metric, value]) => `
                        <div class="metric">
                            <strong>${metric.replace(/-/g, ' ').toUpperCase()}:</strong><br>
                            ${typeof value === 'number' ? value.toFixed(0) + 'ms' : value}
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `).join('')}

    ${jsonReport.summary.criticalIssues.length > 0 ? `
        <h2>Critical Issues</h2>
        <table>
            <tr>
                <th>Page</th>
                <th>Device</th>
                <th>Metric</th>
                <th>Value</th>
                <th>Threshold</th>
            </tr>
            ${jsonReport.summary.criticalIssues.map(issue => `
                <tr>
                    <td>${issue.page}</td>
                    <td>${issue.formFactor}</td>
                    <td>${issue.metric}</td>
                    <td>${issue.value.toFixed(0)}ms</td>
                    <td>${issue.threshold}ms</td>
                </tr>
            `).join('')}
        </table>
    ` : ''}
</body>
</html>`;
  }

  generateCsvReport() {
    const headers = ['Page', 'Form Factor', 'Score', 'FCP', 'LCP', 'FMP', 'SI', 'TTI', 'TBT', 'CLS', 'Timestamp'];
    const rows = this.results.map(result => [
      result.name,
      result.formFactor,
      result.score?.toFixed(1) || 'Error',
      result.metrics?.['first-contentful-paint']?.toFixed(0) || 'N/A',
      result.metrics?.['largest-contentful-paint']?.toFixed(0) || 'N/A',
      result.metrics?.['first-meaningful-paint']?.toFixed(0) || 'N/A',
      result.metrics?.['speed-index']?.toFixed(0) || 'N/A',
      result.metrics?.['interactive']?.toFixed(0) || 'N/A',
      result.metrics?.['total-blocking-time']?.toFixed(0) || 'N/A',
      result.metrics?.['cumulative-layout-shift']?.toFixed(3) || 'N/A',
      result.timestamp
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  analyzeResults() {
    console.log('\n📈 Performance Analysis:');
    
    const summary = this.generateSummary();
    
    console.log(`Average Desktop Score: ${summary.averageScores.desktop.toFixed(1)}/100`);
    console.log(`Average Mobile Score: ${summary.averageScores.mobile.toFixed(1)}/100`);
    
    if (summary.criticalIssues.length > 0) {
      console.log(`\n⚠️  ${summary.criticalIssues.length} Critical Performance Issues Found:`);
      summary.criticalIssues.forEach(issue => {
        console.log(`   ${issue.page} (${issue.formFactor}): ${issue.metric} = ${issue.value.toFixed(0)}ms (threshold: ${issue.threshold}ms)`);
      });
    } else {
      console.log('\n✅ No critical performance issues found!');
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (summary.averageScores.desktop < 90) {
      console.log('   - Optimize desktop performance to achieve 90+ score');
    }
    if (summary.averageScores.mobile < 90) {
      console.log('   - Optimize mobile performance to achieve 90+ score');
    }
    if (summary.criticalIssues.some(i => i.metric === 'largest-contentful-paint')) {
      console.log('   - Optimize Largest Contentful Paint (LCP) by optimizing images and critical resources');
    }
    if (summary.criticalIssues.some(i => i.metric === 'total-blocking-time')) {
      console.log('   - Reduce Total Blocking Time (TBT) by optimizing JavaScript execution');
    }
  }
}

// Run the tests
async function main() {
  const runner = new PerformanceTestRunner();
  await runner.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PerformanceTestRunner;
