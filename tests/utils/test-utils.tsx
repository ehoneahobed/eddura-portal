import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock next-auth/react to avoid ES module issues
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useSession: () => ({
    data: {
      expires: new Date(Date.now() + 2 * 86400).toISOString(),
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock session for testing
const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  },
}

// Mock admin session
const mockAdminSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: {
    id: 'test-admin-id',
    email: 'admin@example.com',
    name: 'Test Admin',
    role: 'admin',
  },
}

// Custom render function with providers
const AllTheProviders = ({ children, session = mockSession }: { children: ReactNode; session?: any }) => {
  return (
    <div>
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { session?: any }
) => {
  const { session, ...renderOptions } = options || {}
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => <AllTheProviders session={session} children={children} />,
    ...renderOptions,
  })
}

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockSchool = (overrides = {}) => ({
  id: 'test-school-id',
  name: 'Test University',
  country: 'United States',
  city: 'Test City',
  ranking: 100,
  description: 'A test university',
  website: 'https://test.edu',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockProgram = (overrides = {}) => ({
  id: 'test-program-id',
  name: 'Test Program',
  schoolId: 'test-school-id',
  level: 'undergraduate',
  field: 'Computer Science',
  duration: '4 years',
  tuition: 50000,
  description: 'A test program',
  requirements: ['High school diploma'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockScholarship = (overrides = {}) => ({
  id: 'test-scholarship-id',
  name: 'Test Scholarship',
  amount: 10000,
  currency: 'USD',
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  country: 'United States',
  level: 'undergraduate',
  field: 'Computer Science',
  description: 'A test scholarship',
  requirements: ['GPA 3.5+'],
  website: 'https://test-scholarship.org',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// API response mocks
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
})

// Database mock helpers
export const mockDatabase = {
  users: {
    find: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
  schools: {
    find: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
  programs: {
    find: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
  scholarships: {
    find: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { mockSession, mockAdminSession }