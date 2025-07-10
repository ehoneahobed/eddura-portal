import { createMockUser, createMockSchool, mockApiResponse } from '../utils/test-utils'

describe('Test Utilities', () => {
  describe('createMockUser', () => {
    it('should create a user with default values', () => {
      const user = createMockUser()
      expect(user).toEqual({
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('should create a user with custom overrides', () => {
      const user = createMockUser({ role: 'admin', name: 'Admin User' })
      expect(user.role).toBe('admin')
      expect(user.name).toBe('Admin User')
      expect(user.email).toBe('test@example.com') // default value
    })
  })

  describe('createMockSchool', () => {
    it('should create a school with default values', () => {
      const school = createMockSchool()
      expect(school).toEqual({
        id: 'test-school-id',
        name: 'Test University',
        country: 'United States',
        city: 'Test City',
        ranking: 100,
        description: 'A test university',
        website: 'https://test.edu',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    })

    it('should create a school with custom overrides', () => {
      const school = createMockSchool({ name: 'MIT', ranking: 1 })
      expect(school.name).toBe('MIT')
      expect(school.ranking).toBe(1)
      expect(school.country).toBe('United States') // default value
    })
  })

  describe('mockApiResponse', () => {
    it('should create a successful API response', () => {
      const data = { message: 'Success' }
      const response = mockApiResponse(data, 200)
      
      expect(response.ok).toBe(true)
      expect(response.status).toBe(200)
      expect(response.json()).resolves.toEqual(data)
    })

    it('should create an error API response', () => {
      const data = { error: 'Not found' }
      const response = mockApiResponse(data, 404)
      
      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
      expect(response.json()).resolves.toEqual(data)
    })

    it('should handle text responses', async () => {
      const data = { message: 'Success' }
      const response = mockApiResponse(data, 200)
      
      const text = await response.text()
      expect(text).toBe(JSON.stringify(data))
    })
  })
})