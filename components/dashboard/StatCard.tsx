import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  color: string;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  color, 
  isLoading = false,
  trend 
}: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {isLoading ? '...' : value}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">
            {description}
          </p>
          {trend && (
            <div className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 