'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Award } from 'lucide-react';

interface CTAProps {
  cta: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    position: 'top' | 'bottom' | 'sidebar' | 'inline';
    style: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

export default function ContentCTA({ cta, className = '' }: CTAProps) {
  if (!cta.enabled) return null;

  const getButtonVariant = (style: string) => {
    switch (style) {
      case 'primary': return 'default';
      case 'secondary': return 'secondary';
      case 'outline': return 'outline';
      default: return 'default';
    }
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'sidebar':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200';
      case 'inline':
        return 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200';
      default:
        return 'bg-gradient-to-r from-purple-50 to-blue-100 border-purple-200';
    }
  };

  const getIcon = (position: string) => {
    switch (position) {
      case 'sidebar':
        return <Users className="w-5 h-5" />;
      case 'inline':
        return <Star className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  return (
    <Card className={`${getPositionClasses(cta.position)} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-white/50 rounded-lg">
            {getIcon(cta.position)}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {cta.title}
            </h3>
            <p className="text-gray-700 mb-4">
              {cta.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild
                variant={getButtonVariant(cta.style)}
                className="flex items-center gap-2"
              >
                <a href={cta.buttonLink}>
                  {cta.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              
              {/* Additional benefits */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>10K+ members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}