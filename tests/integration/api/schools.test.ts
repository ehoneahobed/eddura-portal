import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/schools/route'
import { createMockSchool } from '../../utils/test-utils'

// Mock MongoDB connection and models
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/models/School', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    save: jest.fn(),
  },
}))

import connectDB from '@/lib/mongodb'
import School from '@/models/School'

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>
const mockSchool = School as jest.Mocked<typeof School>

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

      mockSchool.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockSchools),
          }),
        }),
      } as any)

      mockSchool.countDocuments.mockResolvedValue(2)

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

      mockSchool.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockSchools),
          }),
        }),
      } as any)

      mockSchool.countDocuments.mockResolvedValue(1)

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
      mockConnectDB.mockRejectedValue(new Error('ENOTFOUND'))

      const request = new NextRequest('http://localhost:3000/api/schools')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('Database connection failed. Please try again later.')
    })

    it('handles general errors', async () => {
      mockConnectDB.mockRejectedValue(new Error('Unknown error'))

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

      const savedSchool = { ...schoolData, _id: 'test-id', toObject: () => ({ ...schoolData, _id: 'test-id' }) }
      mockSchool.save.mockResolvedValue(savedSchool)

      const request = new NextRequest('http://localhost:3000/api/schools', {
        method: 'POST',
        body: JSON.stringify(schoolData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe(schoolData.name)
      expect(data.id).toBe('test-id')
    })

    it('handles validation errors', async () => {
      const validationError = new Error('Validation failed')
      validationError.name = 'ValidationError'
      mockSchool.save.mockRejectedValue(validationError)

      const request = new NextRequest('http://localhost:3000/api/schools', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('handles general errors', async () => {
      mockSchool.save.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/schools', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create school')
    })
  })
})