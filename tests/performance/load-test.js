import http from 'k6/http'
import { check, sleep } from 'k6'

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be less than 10%
  },
}

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test scenarios
export default function () {
  // Test homepage
  const homeResponse = http.get(`${BASE_URL}/`)
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads fast': (r) => r.timings.duration < 1000,
  })

  // Test schools API
  const schoolsResponse = http.get(`${BASE_URL}/api/schools?page=1&limit=10`)
  check(schoolsResponse, {
    'schools API status is 200': (r) => r.status === 200,
    'schools API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    'schools API response time < 500ms': (r) => r.timings.duration < 500,
  })

  // Test scholarships API
  const scholarshipsResponse = http.get(`${BASE_URL}/api/scholarships?page=1&limit=10`)
  check(scholarshipsResponse, {
    'scholarships API status is 200': (r) => r.status === 200,
    'scholarships API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    'scholarships API response time < 500ms': (r) => r.timings.duration < 500,
  })

  // Test programs API
  const programsResponse = http.get(`${BASE_URL}/api/programs?page=1&limit=10`)
  check(programsResponse, {
    'programs API status is 200': (r) => r.status === 200,
    'programs API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    'programs API response time < 500ms': (r) => r.timings.duration < 500,
  })

  // Test search functionality
  const searchResponse = http.get(`${BASE_URL}/api/schools?search=university&page=1&limit=5`)
  check(searchResponse, {
    'search API status is 200': (r) => r.status === 200,
    'search API response time < 1000ms': (r) => r.timings.duration < 1000,
  })

  // Test pagination
  const paginationResponse = http.get(`${BASE_URL}/api/schools?page=2&limit=5`)
  check(paginationResponse, {
    'pagination API status is 200': (r) => r.status === 200,
    'pagination API response time < 500ms': (r) => r.timings.duration < 500,
  })

  // Simulate user think time
  sleep(1)
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting performance test against:', BASE_URL)
  
  // Test that the application is running
  const healthCheck = http.get(`${BASE_URL}/`)
  if (healthCheck.status !== 200) {
    throw new Error(`Application is not responding. Status: ${healthCheck.status}`)
  }
  
  console.log('Application is running and ready for testing')
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('Performance test completed')
}