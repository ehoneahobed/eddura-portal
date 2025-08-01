import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
// Import models index to ensure proper registration order
import '@/models/index';
import School from '@/models/School';
import Program from '@/models/Program';
import Scholarship from '@/models/Scholarship';
import ApplicationTemplate from '@/models/ApplicationTemplate';
import UserSession from '@/models/UserSession';
import PageView from '@/models/PageView';
import UserEvent from '@/models/UserEvent';
import User from '@/models/User';

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

    // Get user analytics data
    const userAnalytics = await getUserAnalytics(startDate, now);

    // Get growth data (last 6 months)
    const trends = await getTrendsData();

    // Get geographic distribution
    const geographic = await getGeographicData();

    // Get top content based on real page views
    const topContent = await getTopContentData(startDate, now);

    // Get recent activity
    const recentActivity = await getRecentActivityData(startDate, now);

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
        activeUsers: userAnalytics.activeUsers,
        totalValue: financial.totalScholarshipValue,
        totalSessions: userAnalytics.totalSessions,
        totalPageViews: userAnalytics.totalPageViews,
        averageSessionDuration: userAnalytics.averageSessionDuration,
        bounceRate: userAnalytics.bounceRate
      },
      trends,
      geographic,
      topContent,
      recentActivity,
      financial,
      userAnalytics
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

async function getTopContentData(startDate: Date, endDate: Date) {
  // Get top pages by views
  const topPages = await PageView.aggregate([
    {
      $match: {
        visitTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$pageUrl',
        views: { $sum: 1 },
        pageTitle: { $first: '$pageTitle' },
        pageType: { $first: '$pageType' }
      }
    },
    {
      $sort: { views: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Calculate growth (compare with previous period)
  const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
  const previousEndDate = new Date(startDate);

  const previousViews = await PageView.aggregate([
    {
      $match: {
        visitTime: { $gte: previousStartDate, $lte: previousEndDate }
      }
    },
    {
      $group: {
        _id: '$pageUrl',
        views: { $sum: 1 }
      }
    }
  ]);

  const previousViewsMap = new Map(previousViews.map(p => [p._id, p.views]));

  return topPages.map(page => {
    const previousViewCount = previousViewsMap.get(page._id) || 0;
    const growth = previousViewCount > 0 
      ? ((page.views - previousViewCount) / previousViewCount) * 100
      : 0;

    return {
      name: page.pageTitle || page._id,
      type: page.pageType as 'school' | 'program' | 'scholarship',
      views: page.views,
      growth: Math.round(growth * 10) / 10
    };
  });
}

async function getRecentActivityData(startDate: Date, endDate: Date) {
  // Get recent user events
  const recentEvents = await UserEvent.find({
    eventTime: { $gte: startDate, $lte: endDate },
    eventCategory: { $in: ['engagement', 'content', 'authentication'] }
  })
    .sort({ eventTime: -1 })
    .limit(10)
    .populate('userId', 'firstName lastName email')
    .lean();

  // Get recent content creation
  const recentSchools = await School.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .sort({ createdAt: -1 })
    .limit(2)
    .select('name createdAt')
    .lean();

  const recentPrograms = await Program.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .sort({ createdAt: -1 })
    .limit(2)
    .select('name schoolId createdAt')
    .populate('schoolId', 'name')
    .lean();

  const recentScholarships = await Scholarship.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .sort({ createdAt: -1 })
    .limit(2)
    .select('title createdAt')
    .lean();

  // Combine events and content creation
  const activities = [
    ...recentEvents.map((event, index) => ({
      id: `event-${event._id}`,
      type: event.eventType,
      action: event.eventName,
      title: event.pageTitle || event.eventName,
      timestamp: event.eventTime,
      user: event.userId ? `${(event.userId as any).firstName} ${(event.userId as any).lastName}` : 'Anonymous'
    })),
    ...recentSchools.map((school, index) => ({
      id: `school-${school._id}`,
      type: 'school',
      action: 'created',
      title: school.name,
      timestamp: school.createdAt,
      user: 'Admin'
    })),
    ...recentPrograms.map((program, index) => ({
      id: `program-${program._id}`,
      type: 'program',
      action: 'created',
      title: program.name,
      timestamp: program.createdAt,
      user: 'Admin'
    })),
    ...recentScholarships.map((scholarship, index) => ({
      id: `scholarship-${scholarship._id}`,
      type: 'scholarship',
      action: 'created',
      title: scholarship.title,
      timestamp: scholarship.createdAt,
      user: 'Admin'
    }))
  ];

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
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

async function getUserAnalytics(startDate: Date, endDate: Date) {
  // Get active users (sessions in the last 30 days)
  const activeUsers = await UserSession.countDocuments({
    startTime: { $gte: startDate },
    isActive: true
  });

  // Get total sessions
  const totalSessions = await UserSession.countDocuments({
    startTime: { $gte: startDate }
  });

  // Get total page views
  const totalPageViews = await PageView.countDocuments({
    visitTime: { $gte: startDate }
  });

  // Get average session duration
  const sessionsWithDuration = await UserSession.find({
    startTime: { $gte: startDate },
    duration: { $exists: true, $ne: null }
  });

  const averageSessionDuration = sessionsWithDuration.length > 0
    ? sessionsWithDuration.reduce((sum, session) => sum + (session.duration || 0), 0) / sessionsWithDuration.length
    : 0;

  // Get bounce rate
  const bounceSessions = await UserSession.countDocuments({
    startTime: { $gte: startDate },
    bounceRate: true
  });

  const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;

  // Get user engagement metrics
  const userEngagement = await UserSession.aggregate([
    {
      $match: {
        startTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgTimeOnSite: { $avg: '$totalTimeOnSite' },
        avgPagesPerSession: { $avg: '$totalPages' },
        totalUniqueUsers: { $addToSet: '$userId' }
      }
    }
  ]);

  const engagement = userEngagement[0] || {
    avgTimeOnSite: 0,
    avgPagesPerSession: 0,
    totalUniqueUsers: []
  };

  return {
    activeUsers,
    totalSessions,
    totalPageViews,
    averageSessionDuration: Math.round(averageSessionDuration),
    bounceRate: Math.round(bounceRate * 100) / 100,
    avgTimeOnSite: Math.round(engagement.avgTimeOnSite || 0),
    avgPagesPerSession: Math.round(engagement.avgPagesPerSession || 0),
    uniqueUsers: engagement.totalUniqueUsers.length
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