# Turkish Learning Platform - Testing Guide

Comprehensive testing guide covering all aspects of quality assurance for the Turkish Learning Platform Admin Panel.

## 📋 Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Setup and Configuration](#setup-and-configuration)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [AI/ML Testing](#aiml-testing)
- [Best Practices](#best-practices)

## 🎯 Testing Philosophy

Our testing strategy follows the **Testing Pyramid** approach:

```
        /\
       /  \
      / E2E \     ← Few, High-level, Slow
     /______\
    /        \
   /Integration\ ← Some, Medium-level, Medium
  /__________\
 /            \
/  Unit Tests  \  ← Many, Low-level, Fast
/______________\
```

### Testing Principles

1. **Fast Feedback**: Unit tests provide immediate feedback
2. **Confidence**: Integration tests ensure components work together
3. **User Experience**: E2E tests validate complete user journeys
4. **Performance**: Load tests ensure scalability
5. **Security**: Security tests protect against vulnerabilities
6. **AI Quality**: Specialized tests for AI/ML components

## 🧪 Test Types

### 1. Unit Tests
- **Purpose**: Test individual components and functions
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, utilities, hooks
- **Speed**: Very fast (< 1s per test)

### 2. Integration Tests
- **Purpose**: Test API endpoints and service integration
- **Framework**: Jest + Supertest
- **Coverage**: API routes, database operations, external services
- **Speed**: Fast (1-5s per test)

### 3. End-to-End Tests
- **Purpose**: Test complete user workflows
- **Framework**: Playwright
- **Coverage**: User journeys, cross-browser compatibility
- **Speed**: Slow (10-60s per test)

### 4. Performance Tests
- **Purpose**: Test application performance and scalability
- **Framework**: Lighthouse + K6
- **Coverage**: Page load times, API response times, load testing
- **Speed**: Medium to slow (30s-5min per test)

### 5. Security Tests
- **Purpose**: Test for security vulnerabilities
- **Framework**: Custom security scanner + npm audit
- **Coverage**: Dependencies, code patterns, configuration
- **Speed**: Medium (1-2min per scan)

### 6. AI/ML Tests
- **Purpose**: Test AI-powered features
- **Framework**: Custom testing framework
- **Coverage**: Content generation, speech recognition, classification
- **Speed**: Slow (varies based on AI service)

## ⚙️ Setup and Configuration

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup test database (optional)
npm run test:db:setup
```

### Test Configuration Files

#### `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}

module.exports = createJestConfig(customJestConfig)
```

#### `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 🚀 Running Tests

### Quick Commands

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # E2E tests
npm run test:performance # Performance tests
npm run test:security    # Security tests

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- users.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create user"
```

### Detailed Test Execution

#### Unit Tests
```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:coverage

# Run specific component tests
npm test -- components/Layout.test.tsx

# Run in watch mode for development
npm run test:watch

# Debug tests
npm test -- --detectOpenHandles --forceExit
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run API tests only
npm test -- tests/integration/api.test.ts

# Run with verbose output
npm test -- --verbose tests/integration/
```

#### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test tests/e2e/admin-panel.spec.ts

# Debug E2E tests
npx playwright test --debug

# Generate test report
npx playwright show-report
```

#### Performance Tests
```bash
# Run performance tests
npm run test:performance

# Run Lighthouse audit
npm run lighthouse

# Run load tests
npm run test:load

# Custom performance test
node scripts/run-performance-tests.js --url=http://localhost:3001
```

#### Security Tests
```bash
# Run security scan
npm run security:scan

# Run dependency audit
npm audit

# Fix security issues
npm audit fix

# Custom security tests
npm run test:security
```

## ✍️ Writing Tests

### Unit Test Example

```typescript
// tests/components/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserCard from '../../src/components/users/UserCard';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('UserCard Component', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'STUDENT',
    isActive: true,
  };

  it('renders user information correctly', () => {
    renderWithProviders(<UserCard user={mockUser} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('STUDENT')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    const onEdit = jest.fn();
    renderWithProviders(<UserCard user={mockUser} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('shows active status correctly', () => {
    renderWithProviders(<UserCard user={mockUser} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
// tests/integration/users-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import apiClient from '../../src/lib/api';

describe('Users API Integration', () => {
  beforeAll(async () => {
    // Setup test environment
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test environment
    await cleanupTestDatabase();
  });

  it('should fetch users with pagination', async () => {
    const response = await apiClient.getUsers({ page: 1, limit: 10 });
    
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.items).toBeInstanceOf(Array);
    expect(response.data.total).toBeGreaterThanOrEqual(0);
    expect(response.data.page).toBe(1);
    expect(response.data.limit).toBe(10);
  });

  it('should create a new user', async () => {
    const newUser = {
      email: 'newuser@example.com',
      fullName: 'New User',
      role: 'STUDENT',
      password: 'securepassword123'
    };

    const response = await apiClient.createUser(newUser);
    
    expect(response.success).toBe(true);
    expect(response.data.email).toBe(newUser.email);
    expect(response.data.id).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'admin@turkishlearning.com');
    await page.fill('[data-testid=password]', 'admin123');
    await page.click('[data-testid=login-button]');
    
    // Navigate to users page
    await page.goto('/users');
  });

  test('should display users list', async ({ page }) => {
    await expect(page.getByText('User Management')).toBeVisible();
    await expect(page.getByText('Ahmet Yılmaz')).toBeVisible();
    await expect(page.getByText('Sarah Johnson')).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await page.fill('[data-testid=search-input]', 'Ahmet');
    await page.press('[data-testid=search-input]', 'Enter');
    
    await expect(page.getByText('Ahmet Yılmaz')).toBeVisible();
    await expect(page.getByText('Sarah Johnson')).not.toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await page.click('[data-testid=create-user-button]');
    
    await page.fill('[data-testid=user-email]', 'newuser@example.com');
    await page.fill('[data-testid=user-name]', 'New User');
    await page.selectOption('[data-testid=user-role]', 'STUDENT');
    
    await page.click('[data-testid=save-user-button]');
    
    await expect(page.getByText('User created successfully')).toBeVisible();
    await expect(page.getByText('newuser@example.com')).toBeVisible();
  });
});
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  performance-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:performance

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm audit
      - run: npm run test:security
```

### Test Reports

Tests generate comprehensive reports:

- **Coverage Reports**: HTML and LCOV formats
- **E2E Reports**: Playwright HTML report with screenshots
- **Performance Reports**: Lighthouse and custom performance metrics
- **Security Reports**: Vulnerability assessment reports

## 📈 Performance Testing

### Lighthouse Testing

```bash
# Run Lighthouse audit
npm run test:performance

# Custom Lighthouse test
lighthouse http://localhost:3001 \
  --output=html \
  --output-path=./reports/lighthouse-report.html \
  --chrome-flags="--headless"
```

### Load Testing with K6

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const response = http.get('http://localhost:3001/');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  sleep(1);
}
```

## 🔒 Security Testing

### Automated Security Scanning

```bash
# Run security scan
npm run security:scan

# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Custom security tests
npm run test:security
```

### Security Test Categories

1. **Dependency Vulnerabilities**: npm audit
2. **Code Patterns**: Custom static analysis
3. **Configuration Security**: Environment and deployment configs
4. **Input Validation**: XSS, SQL injection prevention
5. **Authentication**: JWT and session security

## 🤖 AI/ML Testing

### Content Generation Testing

```typescript
// tests/ai/content-generation.test.ts
describe('AI Content Generation', () => {
  it('should generate grammatically correct Turkish sentences', async () => {
    const result = await aiService.generateContent({
      topic: 'greetings',
      level: 'BEGINNER',
      count: 3
    });

    expect(result.sentences).toHaveLength(3);
    expect(result.accuracy).toBeGreaterThan(0.9);
    expect(result.grammarScore).toBeGreaterThan(0.9);
  });
});
```

### Speech Recognition Testing

```typescript
// tests/ai/speech-recognition.test.ts
describe('Speech Recognition', () => {
  it('should accurately recognize clear Turkish speech', async () => {
    const mockAudioData = generateMockAudio('Merhaba, nasılsın?');
    
    const result = await speechService.recognizeSpeech(mockAudioData);
    
    expect(result.transcript).toBe('Merhaba, nasılsın?');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
```

## 📝 Best Practices

### Test Organization

1. **File Naming**: Use `.test.ts` or `.spec.ts` suffix
2. **Directory Structure**: Mirror source code structure
3. **Test Grouping**: Use `describe` blocks for logical grouping
4. **Test Naming**: Use descriptive test names

### Test Quality

1. **AAA Pattern**: Arrange, Act, Assert
2. **Single Responsibility**: One assertion per test
3. **Test Independence**: Tests should not depend on each other
4. **Mock External Dependencies**: Use mocks for external services

### Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Test Data**: Use minimal test data
3. **Cleanup**: Clean up after tests
4. **Selective Testing**: Run only relevant tests during development

### Maintenance

1. **Regular Updates**: Keep test dependencies updated
2. **Flaky Test Management**: Fix or remove flaky tests
3. **Coverage Monitoring**: Maintain good test coverage
4. **Documentation**: Document complex test scenarios

## 📊 Test Metrics

### Coverage Targets

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Performance Targets

- **Unit Tests**: < 1s per test
- **Integration Tests**: < 5s per test
- **E2E Tests**: < 60s per test
- **Load Tests**: Handle 100 concurrent users

### Quality Gates

- All tests must pass
- Coverage thresholds must be met
- No high-severity security vulnerabilities
- Performance budgets must be maintained

---

**Last Updated**: December 2024
**Version**: 1.0.0
