import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 50 }, // Ramp up to 50 users
    { duration: '5m', target: 50 }, // Stay at 50 users
    { duration: '5m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
};

const BASE_URL = 'http://localhost:3001';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
];

export function setup() {
  // Setup phase - create test data if needed
  console.log('Setting up load test environment...');
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const baseUrl = data.baseUrl;
  
  // Test scenario: User browsing and interaction
  testUserBrowsing(baseUrl);
  
  sleep(1);
}

function testUserBrowsing(baseUrl) {
  // 1. Load home page
  let response = http.get(`${baseUrl}/`);
  check(response, {
    'home page loads': (r) => r.status === 200,
    'home page response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // 2. Navigate to users page
  response = http.get(`${baseUrl}/users`);
  check(response, {
    'users page loads': (r) => r.status === 200,
    'users page has content': (r) => r.body.includes('User Management'),
    'users page response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // 3. Navigate to analytics page
  response = http.get(`${baseUrl}/analytics`);
  check(response, {
    'analytics page loads': (r) => r.status === 200,
    'analytics page has metrics': (r) => r.body.includes('Analytics Overview'),
    'analytics page response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // 4. Navigate to courses page
  response = http.get(`${baseUrl}/content/courses`);
  check(response, {
    'courses page loads': (r) => r.status === 200,
    'courses page has content': (r) => r.body.includes('Course Management'),
    'courses page response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // 5. Navigate to lessons page
  response = http.get(`${baseUrl}/content/lessons`);
  check(response, {
    'lessons page loads': (r) => r.status === 200,
    'lessons page has content': (r) => r.body.includes('Lessons'),
    'lessons page response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // 6. Navigate to vocabulary page
  response = http.get(`${baseUrl}/content/vocabulary`);
  check(response, {
    'vocabulary page loads': (r) => r.status === 200,
    'vocabulary page has content': (r) => r.body.includes('Vocabulary'),
    'vocabulary page response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // 7. Navigate to AI tools
  response = http.get(`${baseUrl}/ai-tools/import`);
  check(response, {
    'AI tools page loads': (r) => r.status === 200,
    'AI tools page has content': (r) => r.body.includes('Content Import'),
    'AI tools page response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  sleep(1);

  // 8. Navigate to system config
  response = http.get(`${baseUrl}/system/config`);
  check(response, {
    'system config page loads': (r) => r.status === 200,
    'system config page has content': (r) => r.body.includes('System Configuration'),
    'system config page response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
}

// Stress test scenario
export function stressTest() {
  const baseUrl = BASE_URL;
  
  // Rapid page navigation
  const pages = [
    '/',
    '/users',
    '/analytics',
    '/content/courses',
    '/content/lessons',
    '/content/vocabulary',
    '/content/exercises',
    '/content/grammar',
    '/ai-tools/import',
    '/ai-tools/exercises',
    '/ai-tools/review',
    '/system/config',
    '/system/features'
  ];

  pages.forEach(page => {
    const response = http.get(`${baseUrl}${page}`);
    check(response, {
      [`${page} loads under stress`]: (r) => r.status === 200,
      [`${page} response time < 3s`]: (r) => r.timings.duration < 3000,
    }) || errorRate.add(1);
    
    sleep(0.1); // Minimal sleep for stress testing
  });
}

// API load testing scenario
export function apiLoadTest() {
  const baseUrl = 'http://localhost:3000/api'; // Backend API
  
  // Test API endpoints if backend is available
  const apiEndpoints = [
    '/health',
    '/admin/users',
    '/admin/courses',
    '/admin/analytics'
  ];

  apiEndpoints.forEach(endpoint => {
    const response = http.get(`${baseUrl}${endpoint}`, {
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json'
      }
    });
    
    // More lenient checks for API since backend might not be running
    check(response, {
      [`API ${endpoint} responds`]: (r) => r.status < 500,
      [`API ${endpoint} response time < 5s`]: (r) => r.timings.duration < 5000,
    });
  });
}

export function teardown(data) {
  // Cleanup phase
  console.log('Cleaning up load test environment...');
}

// Alternative test configurations for different scenarios

// Spike test configuration
export const spikeTestOptions = {
  stages: [
    { duration: '10s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '10s', target: 0 },   // Drop to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // More lenient for spike test
    http_req_failed: ['rate<0.1'],
  },
};

// Soak test configuration (long duration)
export const soakTestOptions = {
  stages: [
    { duration: '5m', target: 20 },   // Ramp up
    { duration: '30m', target: 20 },  // Stay at 20 users for 30 minutes
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

// Breakpoint test configuration
export const breakpointTestOptions = {
  executor: 'ramping-arrival-rate',
  startRate: 1,
  timeUnit: '1s',
  preAllocatedVUs: 50,
  maxVUs: 200,
  stages: [
    { target: 10, duration: '5m' },
    { target: 20, duration: '5m' },
    { target: 50, duration: '5m' },
    { target: 100, duration: '5m' },
    { target: 200, duration: '5m' },
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<10000'],
  },
};
