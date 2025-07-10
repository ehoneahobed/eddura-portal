# Testing Infrastructure Guide

## Overview

This document outlines the comprehensive testing infrastructure implemented for the Eddura platform. The testing suite includes unit tests, integration tests, end-to-end tests, and performance tests to ensure code quality and reliability.

## Testing Stack

### Unit & Integration Testing
- **Jest**: Primary testing framework
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking
- **Supertest**: API endpoint testing

### End-to-End Testing
- **Cypress**: Browser automation and E2E testing
- **Custom Commands**: Reusable test actions

### Performance Testing
- **k6**: Load testing and performance benchmarking

### Coverage & Reporting
- **Jest Coverage**: Code coverage reporting
- **Codecov**: Coverage tracking and reporting

## Test Structure

```
tests/
├── unit/                    # Unit tests for components and utilities
│   └── components/
│       └── ui/
│           └── button.test.tsx
├── integration/             # Integration tests for API endpoints
│   └── api/
│       └── schools.test.ts
├── e2e/                     # End-to-end tests (Cypress)
│   └── auth.cy.ts
├── performance/             # Performance tests (k6)
│   └── load-test.js
└── utils/                   # Test utilities and helpers
    └── test-utils.tsx

cypress/
├── e2e/                     # Cypress E2E test specs
├── component/               # Cypress component tests
├── support/                 # Cypress support files
│   ├── e2e.ts
│   └── commands.ts
└── fixtures/                # Test data fixtures
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

### End-to-End Tests
```bash
# Run E2E tests in headless mode
npm run test:e2e

# Open Cypress test runner
npm run test:e2e:open
```

### Performance Tests
```bash
# Run performance tests
npm run test:performance

# Run with custom base URL
BASE_URL=https://staging.eddura.com npm run test:performance
```

### All Tests
```bash
# Run all test suites
npm run test:all
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for core business logic
- **Integration Tests**: 100% API endpoint coverage
- **E2E Tests**: Critical user journey coverage
- **Performance Tests**: Response time and throughput benchmarks

## Writing Tests

### Unit Tests

#### Component Testing
```typescript
import { render, screen } from '@/tests/utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

#### API Testing
```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/schools/route'

describe('Schools API', () => {
  it('returns schools with pagination', async () => {
    const request = new NextRequest('http://localhost:3000/api/schools')
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

### E2E Tests

#### Basic Test Structure
```typescript
describe('Authentication', () => {
  it('should login successfully', () => {
    cy.visit('/auth/signin')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/auth/signin')
  })
})
```

#### Custom Commands
```typescript
// Login as admin
cy.loginAsAdmin()

// Create test data
cy.createSchool({
  name: 'Test University',
  country: 'United States'
})

// Navigate to admin panel
cy.visitAdmin('/schools')
```

### Performance Tests

#### Load Test Structure
```javascript
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
}

export default function () {
  const response = http.get('http://localhost:3000/api/schools')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
}
```

## Test Data Management

### Mock Data Generators
```typescript
import { createMockUser, createMockSchool } from '@/tests/utils/test-utils'

const user = createMockUser({ role: 'admin' })
const school = createMockSchool({ name: 'Test University' })
```

### Database Seeding
```bash
# Seed test database
npm run seed

# Create test admin user
npm run create-admin
```

## Continuous Integration

### GitHub Actions Workflow
The testing infrastructure is integrated with GitHub Actions and runs on:
- Push to main/develop branches
- Pull requests to main/develop branches

### Workflow Jobs
1. **Unit Tests**: Jest tests with coverage reporting
2. **Integration Tests**: API tests with MongoDB service
3. **E2E Tests**: Cypress tests with application deployment
4. **Performance Tests**: k6 load tests (main branch only)
5. **Security Tests**: Dependency vulnerability scanning

### Test Artifacts
- Coverage reports uploaded to Codecov
- Screenshots and videos from failed E2E tests
- Performance test results

## Testing Best Practices

### Unit Tests
- Test component behavior, not implementation
- Use meaningful test descriptions
- Mock external dependencies
- Test error conditions and edge cases
- Keep tests focused and isolated

### Integration Tests
- Test API endpoints with real database
- Verify response formats and status codes
- Test error handling and validation
- Use test database with cleanup

### E2E Tests
- Test critical user journeys
- Use data attributes for selectors
- Implement proper waiting strategies
- Test across different viewport sizes
- Keep tests independent and idempotent

### Performance Tests
- Set realistic performance thresholds
- Test under various load conditions
- Monitor resource usage
- Include setup and teardown procedures

## Debugging Tests

### Jest Debugging
```bash
# Run specific test file
npm test -- button.test.tsx

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Cypress Debugging
```bash
# Open Cypress in debug mode
npm run test:e2e:open

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

### Performance Test Debugging
```bash
# Run k6 in verbose mode
k6 run --verbose tests/performance/load-test.js

# Run with custom options
k6 run --stage 30s:5 tests/performance/load-test.js
```

## Environment Setup

### Required Environment Variables
```bash
# Test environment
MONGODB_URI=mongodb://localhost:27017/test
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
```

### Local Development
```bash
# Install dependencies
npm install

# Setup test database
npm run setup

# Run tests
npm run test:all
```

## Troubleshooting

### Common Issues

#### Jest Configuration
- Ensure `jest.config.js` is properly configured
- Check module path mappings in `tsconfig.json`
- Verify test environment setup

#### Cypress Issues
- Check if application is running on correct port
- Verify database connection for E2E tests
- Ensure proper element selectors

#### Performance Test Issues
- Verify k6 installation
- Check application availability
- Monitor system resources during tests

### Getting Help
- Check test logs for detailed error messages
- Review GitHub Actions workflow logs
- Consult testing documentation and examples
- Report issues with reproduction steps

## Future Enhancements

### Planned Improvements
- Visual regression testing with Percy
- Accessibility testing with axe-core
- Contract testing with Pact
- Chaos engineering tests
- Mobile device testing
- Cross-browser compatibility tests

### Monitoring and Alerting
- Test failure notifications
- Performance regression alerts
- Coverage trend analysis
- Test execution time monitoring