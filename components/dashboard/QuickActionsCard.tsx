import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, BookOpen, GraduationCap, Plus } from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  hoverColor: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Add New School',
    description: 'Create a new educational institution',
    icon: School,
    href: '/admin/schools/create',
    color: 'border-blue-200',
    hoverColor: 'hover:border-blue-300 hover:bg-blue-50'
  },
  {
    title: 'Create Program',
    description: 'Add a new academic program',
    icon: BookOpen,
    href: '/admin/programs/create',
    color: 'border-green-200',
    hoverColor: 'hover:border-green-300 hover:bg-green-50'
  },
  {
    title: 'New Scholarship',
    description: 'Set up a scholarship opportunity',
    icon: GraduationCap,
    href: '/admin/scholarships/create',
    color: 'border-purple-200',
    hoverColor: 'hover:border-purple-300 hover:bg-purple-50'
  }
];

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className={`w-full justify-start p-4 h-auto ${action.color} ${action.hoverColor} transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                    <Plus className="h-4 w-4 ml-auto opacity-50" />
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 