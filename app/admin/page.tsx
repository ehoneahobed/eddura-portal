'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Program, Scholarship } from '@/types';
import { School as SchoolIcon, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    schools: 0,
    programs: 0,
    scholarships: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [schoolsRes, programsRes, scholarshipsRes] = await Promise.all([
          fetch('/api/schools'),
          fetch('/api/programs'),
          fetch('/api/scholarships')
        ]);

        const [schools, programs, scholarships]: [School[], Program[], Scholarship[]] = await Promise.all([
          schoolsRes.json(),
          programsRes.json(),
          scholarshipsRes.json()
        ]);

        setStats({
          schools: schools.length,
          programs: programs.length,
          scholarships: scholarships.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Schools',
      value: stats.schools,
      icon: SchoolIcon,
      description: 'Educational institutions',
      color: 'text-blue-600'
    },
    {
      title: 'Total Programs',
      value: stats.programs,
      icon: BookOpen,
      description: 'Academic programs',
      color: 'text-green-600'
    },
    {
      title: 'Total Scholarships',
      value: stats.scholarships,
      icon: GraduationCap,
      description: 'Financial aid opportunities',
      color: 'text-purple-600'
    },
    {
      title: 'Growth Rate',
      value: '+12%',
      icon: TrendingUp,
      description: 'Month over month',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your educational platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New school added: Stanford University</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Program updated: Computer Science MS</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New scholarship: Rhodes Scholarship</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="font-medium text-sm">Add New School</div>
                <div className="text-xs text-gray-500">Create a new educational institution</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                <div className="font-medium text-sm">Create Program</div>
                <div className="text-xs text-gray-500">Add a new academic program</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <div className="font-medium text-sm">New Scholarship</div>
                <div className="text-xs text-gray-500">Set up a scholarship opportunity</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}