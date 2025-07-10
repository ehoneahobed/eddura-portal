"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useOverviewMetrics, formatNumber, formatCurrency } from "@/hooks/use-analytics";

interface AnalyticsWidgetProps {
  title?: string;
  showGrowth?: boolean;
  compact?: boolean;
  className?: string;
}

export default function AnalyticsWidget({ 
  title = "Platform Overview", 
  showGrowth = true, 
  compact = false,
  className = "" 
}: AnalyticsWidgetProps) {
  const { metrics, isLoading, isError } = useOverviewMetrics();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Analytics...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Analytics Unavailable</CardTitle>
          <CardDescription>Unable to load analytics data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const stats = [
    {
      label: "Schools",
      value: formatNumber(metrics.totalSchools),
      growth: metrics.growthRate,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Programs", 
      value: formatNumber(metrics.totalPrograms),
      growth: metrics.growthRate,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Scholarships",
      value: formatNumber(metrics.totalScholarships),
      growth: metrics.growthRate,
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    },
    {
      label: "Templates",
      value: formatNumber(metrics.totalTemplates),
      growth: metrics.growthRate,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                {showGrowth && (
                  <div className="flex items-center justify-center mt-1">
                    {stat.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={`text-xs ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(stat.growth)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Real-time platform statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <div className={`w-4 h-4 ${stat.color} rounded-full`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{stat.label}</div>
                  <div className="text-xs text-gray-500">Total count</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                {showGrowth && (
                  <div className="flex items-center justify-end mt-1">
                    {stat.growth >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={`text-xs ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(stat.growth)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Financial Summary */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Total Value</div>
                <div className="text-xs text-gray-500">Scholarships</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(metrics.totalValue)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatNumber(metrics.activeUsers)} active users
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini widget for very compact display
export function MiniAnalyticsWidget() {
  const { metrics, isLoading } = useOverviewMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{formatNumber(metrics.totalSchools)}</div>
          <div className="text-xs text-gray-500">Schools</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{formatNumber(metrics.totalPrograms)}</div>
          <div className="text-xs text-gray-500">Programs</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{formatNumber(metrics.totalScholarships)}</div>
          <div className="text-xs text-gray-500">Scholarships</div>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={metrics.growthRate >= 0 ? "default" : "destructive"}>
          {metrics.growthRate >= 0 ? "+" : ""}{metrics.growthRate}%
        </Badge>
        <div className="text-xs text-gray-500 mt-1">Growth</div>
      </div>
    </div>
  );
} 