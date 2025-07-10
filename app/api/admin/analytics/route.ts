import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import School from '@/models/School';
import Program from '@/models/Program';
import Scholarship from '@/models/Scholarship';
import ApplicationTemplate from '@/models/ApplicationTemplate';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.type !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to view analytics
    if (!session.user.permissions?.includes("analytics:read")) {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get basic counts
    const [schoolsCount, programsCount, scholarshipsCount, templatesCount] = await Promise.all([
      School.countDocuments(),
      Program.countDocuments(),
      Scholarship.countDocuments(),
      ApplicationTemplate.countDocuments()
    ]);

    // Get growth data (last 6 months)
    const trends = await getTrendsData();

    // Get geographic distribution
    const geographic = await getGeographicData();

    // Get top content (mock data for now - would need view tracking)
    const topContent = await getTopContentData();

    // Get recent activity
    const recentActivity = await getRecentActivityData();

    // Get financial data
    const financial = await getFinancialData();

    // Calculate growth rate
    const growthRate = calculateGrowthRate(trends);

    const analyticsData = {
      overview: {
        totalSchools: schoolsCount,
        totalPrograms: programsCount,
        totalScholarships: scholarshipsCount,
        totalTemplates: templatesCount,
        growthRate,
        activeUsers: 1234, // Mock data - would need user tracking
        totalValue: financial.totalScholarshipValue
      },
      trends,
      geographic,
      topContent,
      recentActivity,
      financial
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getTrendsData() {
  // Get data for the last 6 months
  const trends = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    
    const [schools, programs, scholarships, templates] = await Promise.all([
      School.countDocuments({ createdAt: { $lt: nextDate } }),
      Program.countDocuments({ createdAt: { $lt: nextDate } }),
      Scholarship.countDocuments({ createdAt: { $lt: nextDate } }),
      ApplicationTemplate.countDocuments({ createdAt: { $lt: nextDate } })
    ]);

    trends.push({
      date: date.toISOString().slice(0, 7), // YYYY-MM format
      schools,
      programs,
      scholarships,
      templates
    });
  }

  return trends;
}

async function getGeographicData() {
  const countries = await School.aggregate([
    {
      $group: {
        _id: '$country',
        schools: { $sum: 1 }
      }
    },
    {
      $sort: { schools: -1 }
    },
    {
      $limit: 6
    }
  ]);

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'];
  
  const geographic = await Promise.all(
    countries.map(async (country, index) => {
      const [programs, scholarships] = await Promise.all([
        Program.countDocuments({ 'schoolId': { $in: await School.find({ country: country._id }).distinct('_id') } }),
        Scholarship.countDocuments({ linkedSchool: { $regex: country._id, $options: 'i' } })
      ]);

      return {
        country: country._id,
        schools: country.schools,
        programs,
        scholarships,
        color: colors[index] || '#6B7280'
      };
    })
  );

  return geographic;
}

async function getTopContentData() {
  // Mock data - in a real implementation, you'd track views/clicks
  const topSchools = await School.find()
    .sort({ createdAt: -1 })
    .limit(2)
    .select('name')
    .lean();

  const topPrograms = await Program.find()
    .sort({ createdAt: -1 })
    .limit(2)
    .select('name')
    .populate('schoolId', 'name')
    .lean();

  const topScholarships = await Scholarship.find()
    .sort({ createdAt: -1 })
    .limit(1)
    .select('title')
    .lean();

  return [
    ...topPrograms.map((program, index) => ({
      name: `${program.name} at ${(program.schoolId as any)?.name || 'Unknown School'}`,
      type: 'program' as const,
      views: 1200 - (index * 100),
      growth: 15.2 - (index * 2)
    })),
    ...topSchools.map((school, index) => ({
      name: school.name,
      type: 'school' as const,
      views: 1000 - (index * 100),
      growth: 8.7 - (index * 1)
    })),
    ...topScholarships.map((scholarship) => ({
      name: scholarship.title,
      type: 'scholarship' as const,
      views: 956,
      growth: 22.1
    }))
  ].sort((a, b) => b.views - a.views).slice(0, 5);
}

async function getRecentActivityData() {
  const recentSchools = await School.find()
    .sort({ createdAt: -1 })
    .limit(2)
    .select('name createdAt')
    .lean();

  const recentPrograms = await Program.find()
    .sort({ createdAt: -1 })
    .limit(1)
    .select('name schoolId createdAt')
    .populate('schoolId', 'name')
    .lean();

  const recentScholarships = await Scholarship.find()
    .sort({ createdAt: -1 })
    .limit(1)
    .select('title createdAt')
    .lean();

  const activities = [
    ...recentSchools.map((school, index) => ({
      id: `school-${index}`,
      type: 'school',
      action: 'created',
      title: school.name,
      timestamp: school.createdAt,
      user: 'admin@example.com'
    })),
    ...recentPrograms.map((program, index) => ({
      id: `program-${index}`,
      type: 'program',
      action: 'created',
      title: program.name,
      timestamp: program.createdAt,
      user: 'moderator@example.com'
    })),
    ...recentScholarships.map((scholarship, index) => ({
      id: `scholarship-${index}`,
      type: 'scholarship',
      action: 'created',
      title: scholarship.title,
      timestamp: scholarship.createdAt,
      user: 'admin@example.com'
    }))
  ];

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);
}

async function getFinancialData() {
  // Get scholarships with numeric values
  const scholarships = await Scholarship.find({
    value: { $type: 'number' }
  })
    .sort({ value: -1 })
    .limit(4)
    .select('title value currency')
    .lean();

  // Get programs with tuition fees
  const programs = await Program.find({
    'tuitionFees.international': { $exists: true, $ne: null }
  })
    .select('tuitionFees.international')
    .lean();

  const totalScholarshipValue = scholarships.reduce((sum, s) => sum + (s.value as number), 0);
  const averageProgramCost = programs.length > 0 
    ? programs.reduce((sum, p) => sum + (p.tuitionFees?.international || 0), 0) / programs.length
    : 45000;

  // Calculate cost distribution
  const costRanges = [
    { min: 0, max: 25000, label: '$0-25K', color: '#10B981' },
    { min: 25000, max: 50000, label: '$25K-50K', color: '#3B82F6' },
    { min: 50000, max: 75000, label: '$50K-75K', color: '#F59E0B' },
    { min: 75000, max: Infinity, label: '$75K+', color: '#EF4444' }
  ];

  const costDistribution = costRanges.map(range => ({
    range: range.label,
    count: programs.filter(p => {
      const cost = p.tuitionFees?.international || 0;
      return cost >= range.min && cost < range.max;
    }).length,
    color: range.color
  }));

  return {
    totalScholarshipValue,
    averageProgramCost,
    topScholarships: scholarships.map(s => ({
      title: s.title,
      value: s.value as number,
      currency: s.currency || 'USD'
    })),
    costDistribution
  };
}

function calculateGrowthRate(trends: any[]) {
  if (trends.length < 2) return 0;
  
  const current = trends[trends.length - 1];
  const previous = trends[trends.length - 2];
  
  const currentTotal = current.schools + current.programs + current.scholarships + current.templates;
  const previousTotal = previous.schools + previous.programs + previous.scholarships + previous.templates;
  
  if (previousTotal === 0) return 0;
  
  return Math.round(((currentTotal - previousTotal) / previousTotal) * 100 * 10) / 10;
} 