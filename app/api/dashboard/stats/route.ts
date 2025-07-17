import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
// Import models index to ensure proper registration order
import '@/models/index';
import School from '@/models/School';
import Program from '@/models/Program';
import Scholarship from '@/models/Scholarship';
import ApplicationTemplate from '@/models/ApplicationTemplate';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Set cache headers for better real-time performance
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Get basic counts
    const [schoolsCount, programsCount, scholarshipsCount, applicationTemplatesCount] = await Promise.all([
      School.countDocuments(),
      Program.countDocuments(),
      Scholarship.countDocuments(),
      ApplicationTemplate.countDocuments()
    ]);

    // Get recent activity (last 10 items created/updated)
    const recentSchools = await School.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name createdAt updatedAt')
      .lean();

    const recentPrograms = await Program.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name schoolId createdAt updatedAt')
      .populate('schoolId', 'name')
      .lean();

    const recentScholarships = await Scholarship.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title provider createdAt updatedAt')
      .lean();

    const recentApplicationTemplates = await ApplicationTemplate.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title scholarshipId createdAt updatedAt')
      .populate('scholarshipId', 'title')
      .lean();

    // Transform recent activity
    const recentActivity = [
      ...recentSchools.map(school => ({
        id: school._id.toString(),
        type: 'school' as const,
        action: 'created' as const,
        title: school.name,
        timestamp: school.createdAt,
        description: `New school added: ${school.name}`
      })),
      ...recentPrograms.map(program => ({
        id: program._id.toString(),
        type: 'program' as const,
        action: 'created' as const,
        title: program.name,
        timestamp: program.createdAt,
        description: `New program added: ${program.name} at ${(program.schoolId as any)?.name || 'Unknown School'}`
      })),
      ...recentScholarships.map(scholarship => ({
        id: scholarship._id.toString(),
        type: 'scholarship' as const,
        action: 'created' as const,
        title: scholarship.title,
        timestamp: scholarship.createdAt,
        description: `New scholarship added: ${scholarship.title} by ${scholarship.provider}`
      })),
      ...recentApplicationTemplates.map((template: any) => ({
        id: template._id.toString(),
        type: 'template' as const,
        action: 'created' as const,
        title: template.title,
        timestamp: template.createdAt,
        description: `New application template added: ${template.title} for ${template.scholarshipId?.title || 'Unknown Scholarship'}`
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

    // Get top schools by program count
    const topSchools = await School.aggregate([
      {
        $lookup: {
          from: 'programs',
          localField: '_id',
          foreignField: 'schoolId',
          as: 'programs'
        }
      },
      {
        $project: {
          name: 1,
          country: 1,
          globalRanking: 1,
          programCount: { $size: '$programs' }
        }
      },
      {
        $sort: { programCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get top programs by tuition fees
    const topPrograms = await Program.find()
      .sort({ 'tuitionFees.international': -1 })
      .limit(5)
      .select('name schoolId degreeType fieldOfStudy tuitionFees')
      .populate('schoolId', 'name')
      .lean();

    // Get top scholarships by value (numeric values only)
    const topScholarships = await Scholarship.find({
      value: { $type: 'number' }
    })
      .sort({ value: -1 })
      .limit(5)
      .select('title provider value currency deadline')
      .lean();

    // Calculate growth rate (mock data for now - could be based on historical data)
    const growthRate = 12.5; // This could be calculated from historical data

    const stats = {
      schools: schoolsCount,
      programs: programsCount,
      scholarships: scholarshipsCount,
      applicationTemplates: applicationTemplatesCount,
      recentActivity,
      topSchools: topSchools.map(school => ({
        id: school._id.toString(),
        name: school.name,
        country: school.country,
        programCount: school.programCount,
        globalRanking: school.globalRanking
      })),
      topPrograms: topPrograms.map(program => ({
        id: program._id.toString(),
        name: program.name,
        schoolName: (program.schoolId as any)?.name || 'Unknown School',
        degreeType: program.degreeType,
        fieldOfStudy: program.fieldOfStudy,
        tuitionFees: program.tuitionFees
      })),
      topScholarships: topScholarships.map(scholarship => ({
        id: scholarship._id.toString(),
        title: scholarship.title,
        provider: scholarship.provider,
        value: scholarship.value,
        currency: scholarship.currency,
        deadline: scholarship.deadline
      })),
      growthRate
    };

    return NextResponse.json(stats, { headers });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 