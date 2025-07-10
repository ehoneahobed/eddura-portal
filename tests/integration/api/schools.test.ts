import { NextRequest } from 'next/server'
import { createMockSchool } from '../../utils/test-utils'

describe('Schools API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/schools', () => {
    it('returns schools with pagination', async () => {
      const mockSchools = [
        createMockSchool({ id: '1', name: 'University A' }),
        createMockSchool({ id: '2', name: 'University B' }),
      ]

      // Mock the modules after reset
      jest.doMock('@/models/School', () => ({
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
          save: jest.fn(),
          toObject: () => ({ _id: 'test-id' })
        }))
      }))

      const mockSchool = require('@/models/School').default
      mockSchool.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockSchools),
          }),
        }),
      })
      mockSchool.countDocuments = jest.fn().mockResolvedValue(2)

      const { GET } = await import('@/app/api/schools/route')
      const request = new NextRequest('http://localhost:3000/api/schools?page=1&limit=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schools).toHaveLength(2)
      expect(data.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalCount: 2,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 10,
      })
    })

    it('handles search parameter', async () => {
      const mockSchools = [createMockSchool({ id: '1', name: 'MIT' })]

      // Mock the modules after reset
      jest.doMock('@/models/School', () => ({
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
          save: jest.fn(),
          toObject: () => ({ _id: 'test-id' })
        }))
      }))

      const mockSchool = require('@/models/School').default
      mockSchool.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockSchools),
          }),
        }),
      })
      mockSchool.countDocuments = jest.fn().mockResolvedValue(1)

      const { GET } = await import('@/app/api/schools/route')
      const request = new NextRequest('http://localhost:3000/api/schools?search=MIT')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.schools).toHaveLength(1)
      expect(mockSchool.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'MIT', $options: 'i' } },
          { country: { $regex: 'MIT', $options: 'i' } },
          { city: { $regex: 'MIT', $options: 'i' } },
        ],
      })
    })

    it('handles database connection errors', async () => {
      // Mock the database connection to fail
      jest.doMock('@/lib/mongodb', () => ({
        __esModule: true,
        default: jest.fn().mockRejectedValue(new Error('ENOTFOUND'))
      }))

      const { GET } = await import('@/app/api/schools/route')
      const request = new NextRequest('http://localhost:3000/api/schools')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('Database connection failed. Please try again later.')
    })

    it('handles general errors', async () => {
      // Mock the database connection to fail
      jest.doMock('@/lib/mongodb', () => ({
        __esModule: true,
        default: jest.fn().mockRejectedValue(new Error('Unknown error'))
      }))

      const { GET } = await import('@/app/api/schools/route')
      const request = new NextRequest('http://localhost:3000/api/schools')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch schools')
    })
  })

  describe('POST /api/schools', () => {
    it('creates a new school successfully', async () => {
      const schoolData = {
        name: 'Test University',
        country: 'United States',
        city: 'Test City',
        ranking: 100,
        description: 'A test university',
        website: 'https://test.edu',
      }

      // Mock the save method to return a proper school object
      const mockSave = jest.fn().mockResolvedValue({
        ...schoolData,
        _id: 'test-id',
        toObject: () => ({ ...schoolData, _id: 'test-id' })
      })

      // Mock the School constructor to return instances with our mocked save method
      jest.doMock('@/models/School', () => ({
        __esModule: true,
        default: jest.fn().mockImplementation((data) => ({
          ...data,
          save: mockSave,
          toObject: () => ({ ...data, _id: 'test-id' })
        }))
      }))

      const { POST } = await import('@/app/api/schools/route')
      const request = new NextRequest('http://localhost:3000/api/schools', {
        method: 'POST',
        body: JSON.stringify(schoolData),
      })

      const response = await POST(request)
      const data = await response.json()
      
      // Debug: Log the actual response
      console.log('Response status:', response.status)
      console.log('Response data:', data)

      expect(response.status).toBe(201)
      expect(data.name).toBe(schoolData.name)
      expect(data.id).toBe('test-id')
    })

    it('handles validation errors', async () => {
      const validationError = new Error('Validation failed')
      validationError.name = 'ValidationError'
      
      // Mock the save method to throw validation error
      const mockSave = jest.fn().mockRejectedValue(validationError)
      
      // Mock the School constructor to return instances with our mocked save method
      jest.doMock('@/models/School', () => ({
        __esModule: true,
        default: jest.fn().mockImplementation((data) => ({
          ...data,
          save: mockSave,
          toObject: () => ({ ...data, _id: 'test-id' })
        }))
      }))

      const { POST } = await import('@/app/api/schools/route')
      const request = new NextRequest('http://localhost:3000/api/schools', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()
      
      // Debug: Log the actual response
      console.log('Validation error response status:', response.status)
      console.log('Validation error response data:', data)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('handles general errors', async () => {
      // Mock the save method to throw general error
      const mockSave = jest.fn().mockRejectedValue(new Error('Database error'))
      
      // Mock the School constructor to return instances with our mocked save method
      jest.doMock('@/models/School', () => ({
        __esModule: true,
        default: jest.fn().mockImplementation((data) => ({
          ...data,
          save: mockSave,
          toObject: () => ({ ...data, _id: 'test-id' })
        }))
      }))

      const { POST } = await import('@/app/api/schools/route')
      const request = new NextRequest('http://localhost:3000/api/schools', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })

      const response = await POST(request)
      const data = await response.json()
      
      // Debug: Log the actual response
      console.log('General error response status:', response.status)
      console.log('General error response data:', data)

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create school')
    })
  })
})