/**
 * Lighthouse Performance Testing Configuration
 */

const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'interactive',
      'total-blocking-time',
      'cumulative-layout-shift',
      'server-response-time',
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images',
      'efficient-animated-content',
      'preload-lcp-image',
      'uses-rel-preconnect',
      'uses-rel-preload',
      'critical-request-chains',
      'user-timings',
      'bootup-time',
      'mainthread-work-breakdown',
      'dom-size',
      'font-display',
      'third-party-summary',
      'third-party-facades',
      'lcp-lazy-loaded',
      'layout-shift-elements',
      'uses-passive-event-listeners',
      'no-document-write',
      'uses-http2',
      'uses-long-cache-ttl',
      'total-byte-weight',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'duplicated-javascript',
      'legacy-javascript'
    ],
    skipAudits: [
      'canonical',
      'hreflang',
      'plugins',
      'is-crawlable'
    ],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36 Chrome-Lighthouse'
  },
  audits: [
    'metrics/first-contentful-paint',
    'metrics/largest-contentful-paint',
    'metrics/first-meaningful-paint',
    'metrics/speed-index',
    'metrics/interactive',
    'metrics/total-blocking-time',
    'metrics/cumulative-layout-shift'
  ],
  categories: {
    performance: {
      title: 'Performance',
      auditRefs: [
        { id: 'first-contentful-paint', weight: 10 },
        { id: 'largest-contentful-paint', weight: 25 },
        { id: 'first-meaningful-paint', weight: 10 },
        { id: 'speed-index', weight: 10 },
        { id: 'interactive', weight: 10 },
        { id: 'total-blocking-time', weight: 30 },
        { id: 'cumulative-layout-shift', weight: 5 }
      ]
    }
  }
};

// Mobile configuration
const lighthouseMobileConfig = {
  ...lighthouseConfig,
  settings: {
    ...lighthouseConfig.settings,
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 750
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false
    }
  }
};

// Performance thresholds
const performanceThresholds = {
  desktop: {
    'first-contentful-paint': 1800,
    'largest-contentful-paint': 2500,
    'first-meaningful-paint': 2000,
    'speed-index': 3000,
    'interactive': 3800,
    'total-blocking-time': 300,
    'cumulative-layout-shift': 0.1,
    'server-response-time': 600
  },
  mobile: {
    'first-contentful-paint': 3000,
    'largest-contentful-paint': 4000,
    'first-meaningful-paint': 3500,
    'speed-index': 5800,
    'interactive': 6500,
    'total-blocking-time': 600,
    'cumulative-layout-shift': 0.25,
    'server-response-time': 600
  }
};

// Test URLs
const testUrls = [
  { url: 'http://localhost:3001/', name: 'Home Page' },
  { url: 'http://localhost:3001/users', name: 'Users Page' },
  { url: 'http://localhost:3001/analytics', name: 'Analytics Page' },
  { url: 'http://localhost:3001/content/courses', name: 'Courses Page' },
  { url: 'http://localhost:3001/content/lessons', name: 'Lessons Page' },
  { url: 'http://localhost:3001/content/vocabulary', name: 'Vocabulary Page' },
  { url: 'http://localhost:3001/ai-tools/import', name: 'AI Tools Page' },
  { url: 'http://localhost:3001/system/config', name: 'System Config Page' }
];

module.exports = {
  lighthouseConfig,
  lighthouseMobileConfig,
  performanceThresholds,
  testUrls
};
