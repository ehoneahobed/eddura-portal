import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock database models
vi.mock('@/models/ApplicationRequirement', () => ({
  ApplicationRequirement: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('@/models/RequirementsTemplate', () => ({
  RequirementsTemplate: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('@/models/Application', () => ({
  Application: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

describe('Requirements Management System - Integration Tests', () => {
  let mockSession: any;
  let mockUser: any;

  beforeEach(() => {
    // Setup mock session
    mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    };

    mockSession = {
      user: mockUser,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    (getServerSession as any).mockResolvedValue(mockSession);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Application Requirements API', () => {
    describe('GET /api/application-requirements', () => {
      it('should return requirements for an application', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: {
            applicationId: 'app123',
            status: 'pending',
            category: 'academic',
          },
        });

        const mockRequirements = [
          {
            _id: 'req1',
            applicationId: 'app123',
            name: 'Personal Statement',
            requirementType: 'document',
            category: 'academic',
            status: 'pending',
            isRequired: true,
            order: 1,
          },
        ];

        const { ApplicationRequirement } = await import('@/models/ApplicationRequirement');
        (ApplicationRequirement.find as any).mockResolvedValue(mockRequirements);

        const handler = await import('@/app/api/application-requirements/route');
        await handler.GET(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].name).toBe('Personal Statement');
      });

      it('should handle missing applicationId', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: {},
        });

        const handler = await import('@/app/api/application-requirements/route');
        await handler.GET(req, res);

        expect(res._getStatusCode()).toBe(400);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error).toContain('applicationId is required');
      });

      it('should handle unauthorized access', async () => {
        (getServerSession as any).mockResolvedValue(null);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: { applicationId: 'app123' },
        });

        const handler = await import('@/app/api/application-requirements/route');
        await handler.GET(req, res);

        expect(res._getStatusCode()).toBe(401);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error).toContain('Unauthorized');
      });
    });

    describe('POST /api/application-requirements', () => {
      it('should create a new requirement', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: {
            applicationId: 'app123',
            name: 'TOEFL Score',
            requirementType: 'test_score',
            category: 'academic',
            isRequired: true,
            testType: 'toefl',
            minScore: 80,
          },
        });

        const mockRequirement = {
          _id: 'req2',
          applicationId: 'app123',
          name: 'TOEFL Score',
          requirementType: 'test_score',
          category: 'academic',
          status: 'pending',
          isRequired: true,
          testType: 'toefl',
          minScore: 80,
        };

        const { ApplicationRequirement } = await import('@/models/ApplicationRequirement');
        (ApplicationRequirement.create as any).mockResolvedValue(mockRequirement);

        const handler = await import('@/app/api/application-requirements/route');
        await handler.POST(req, res);

        expect(res._getStatusCode()).toBe(201);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.data.name).toBe('TOEFL Score');
      });

      it('should validate required fields', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: {
            applicationId: 'app123',
            // Missing required fields
          },
        });

        const handler = await import('@/app/api/application-requirements/route');
        await handler.POST(req, res);

        expect(res._getStatusCode()).toBe(400);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error).toContain('name is required');
      });
    });

    describe('PUT /api/application-requirements/[id]/status', () => {
      it('should update requirement status', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          body: {
            status: 'completed',
            notes: 'Submitted successfully',
          },
        });

        const mockRequirement = {
          _id: 'req1',
          applicationId: 'app123',
          name: 'Personal Statement',
          status: 'completed',
          notes: 'Submitted successfully',
        };

        const { ApplicationRequirement } = await import('@/models/ApplicationRequirement');
        (ApplicationRequirement.findByIdAndUpdate as any).mockResolvedValue(mockRequirement);

        const handler = await import('@/app/api/application-requirements/[id]/status/route');
        await handler.PUT(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.data.status).toBe('completed');
      });

      it('should validate status values', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'PUT',
          body: {
            status: 'invalid_status',
          },
        });

        const handler = await import('@/app/api/application-requirements/[id]/status/route');
        await handler.PUT(req, res);

        expect(res._getStatusCode()).toBe(400);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid status');
      });
    });
  });

  describe('Requirements Templates API', () => {
    describe('GET /api/requirements-templates', () => {
      it('should return templates with filtering', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          query: {
            category: 'graduate',
            isActive: 'true',
          },
        });

        const mockTemplates = [
          {
            _id: 'template1',
            name: 'Graduate School Application',
            category: 'graduate',
            requirements: [],
            usageCount: 15,
            isSystemTemplate: true,
            isActive: true,
          },
        ];

        const { RequirementsTemplate } = await import('@/models/RequirementsTemplate');
        (RequirementsTemplate.find as any).mockResolvedValue(mockTemplates);

        const handler = await import('@/app/api/requirements-templates/route');
        await handler.GET(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].name).toBe('Graduate School Application');
      });
    });

    describe('POST /api/requirements-templates/[id]/apply', () => {
      it('should apply template to application', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: {
            applicationId: 'app123',
          },
        });

        const mockTemplate = {
          _id: 'template1',
          name: 'Graduate School Application',
          requirements: [
            {
              name: 'Personal Statement',
              requirementType: 'document',
              category: 'academic',
              isRequired: true,
            },
          ],
        };

        const { RequirementsTemplate } = await import('@/models/RequirementsTemplate');
        (RequirementsTemplate.findById as any).mockResolvedValue(mockTemplate);

        const { ApplicationRequirement } = await import('@/models/ApplicationRequirement');
        (ApplicationRequirement.create as any).mockResolvedValue([]);

        const handler = await import('@/app/api/requirements-templates/[id]/apply/route');
        await handler.POST(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.message).toContain('Template applied successfully');
      });
    });
  });

  describe('Application Progress API', () => {
    describe('GET /api/applications/[id]/requirements/progress', () => {
      it('should return progress data', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
        });

        const mockRequirements = [
          { status: 'completed', isRequired: true },
          { status: 'pending', isRequired: true },
          { status: 'completed', isRequired: false },
        ];

        const { ApplicationRequirement } = await import('@/models/ApplicationRequirement');
        (ApplicationRequirement.find as any).mockResolvedValue(mockRequirements);

        const handler = await import('@/app/api/applications/[id]/requirements/progress/route');
        await handler.GET(req, res);

        expect(res._getStatusCode()).toBe(200);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.data.total).toBe(3);
        expect(data.data.completed).toBe(2);
        expect(data.data.required).toBe(2);
        expect(data.data.requiredCompleted).toBe(1);
      });
    });
  });

  describe('Admin Templates API', () => {
    describe('POST /api/requirements-templates/setup-system', () => {
      it('should create system templates for admin users', async () => {
        // Mock admin user
        mockUser.role = 'admin';
        mockSession.user = mockUser;

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: {
            templates: [
              {
                name: 'Graduate School Application',
                category: 'graduate',
                requirements: [],
              },
            ],
          },
        });

        const { RequirementsTemplate } = await import('@/models/RequirementsTemplate');
        (RequirementsTemplate.create as any).mockResolvedValue([]);

        const handler = await import('@/app/api/requirements-templates/setup-system/route');
        await handler.POST(req, res);

        expect(res._getStatusCode()).toBe(201);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(true);
        expect(data.message).toContain('System templates created successfully');
      });

      it('should deny access to non-admin users', async () => {
        // Mock regular user
        mockUser.role = 'user';
        mockSession.user = mockUser;

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: { templates: [] },
        });

        const handler = await import('@/app/api/requirements-templates/setup-system/route');
        await handler.POST(req, res);

        expect(res._getStatusCode()).toBe(403);
        const data = JSON.parse(res._getData());
        expect(data.success).toBe(false);
        expect(data.error).toContain('Admin access required');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { applicationId: 'app123' },
      });

      const { ApplicationRequirement } = await import('@/models/ApplicationRequirement');
      (ApplicationRequirement.find as any).mockRejectedValue(new Error('Database connection failed'));

      const handler = await import('@/app/api/application-requirements/route');
      await handler.GET(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should handle invalid JSON in request body', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: 'invalid json',
      });

      const handler = await import('@/app/api/application-requirements/route');
      await handler.POST(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request body');
    });
  });

  describe('Data Validation', () => {
    it('should validate requirement type specific fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          applicationId: 'app123',
          name: 'Test Requirement',
          requirementType: 'test_score',
          category: 'academic',
          isRequired: true,
          // Missing testType for test_score requirement
        },
      });

      const handler = await import('@/app/api/application-requirements/route');
      await handler.POST(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('testType is required for test_score requirements');
    });

    it('should validate document requirement fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          applicationId: 'app123',
          name: 'Document Requirement',
          requirementType: 'document',
          category: 'academic',
          isRequired: true,
          maxFileSize: -1, // Invalid file size
        },
      });

      const handler = await import('@/app/api/application-requirements/route');
      await handler.POST(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('maxFileSize must be positive');
    });
  });
}); 