'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Lock, 
  Mail, 
  User, 
  CheckCircle, 
  Star,
  Download,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentGatingProps {
  isGated: boolean;
  gateType: 'email' | 'premium' | 'download';
  title: string;
  excerpt: string;
  benefits?: string[];
  onUnlock?: (email?: string) => void;
  className?: string;
}

export default function ContentGating({
  isGated,
  gateType,
  title,
  excerpt,
  benefits = [],
  onUnlock,
  className = ''
}: ContentGatingProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleUnlock = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store email in localStorage for demo
      localStorage.setItem('unlockedContent', JSON.stringify({
        email,
        timestamp: new Date().toISOString()
      }));
      
      onUnlock?.(email);
      setIsDialogOpen(false);
      toast.success('Content unlocked successfully!');
    } catch (error) {
      toast.error('Failed to unlock content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGateIcon = () => {
    switch (gateType) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'premium':
        return <Star className="w-5 h-5" />;
      case 'download':
        return <Download className="w-5 h-5" />;
      default:
        return <Lock className="w-5 h-5" />;
    }
  };

  const getGateTitle = () => {
    switch (gateType) {
      case 'email':
        return 'Get Free Access';
      case 'premium':
        return 'Premium Content';
      case 'download':
        return 'Download Resource';
      default:
        return 'Unlock Content';
    }
  };

  const getGateDescription = () => {
    switch (gateType) {
      case 'email':
        return 'Enter your email to get instant access to this exclusive content.';
      case 'premium':
        return 'This premium content is available to our paid subscribers.';
      case 'download':
        return 'Download this resource by providing your email address.';
      default:
        return 'This content requires authentication to access.';
    }
  };

  const getGateButtonText = () => {
    switch (gateType) {
      case 'email':
        return 'Get Free Access';
      case 'premium':
        return 'Upgrade to Premium';
      case 'download':
        return 'Download Now';
      default:
        return 'Unlock Content';
    }
  };

  if (!isGated) {
    return null;
  }

  return (
    <div className={className}>
      <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              {getGateIcon()}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{excerpt}</p>
          
          {/* Preview Toggle */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>

          {/* Content Preview */}
          {showPreview && (
            <div className="mb-6 p-4 bg-white rounded-lg border max-h-32 overflow-hidden relative">
              <div className="text-sm text-gray-600 leading-relaxed">
                This is a preview of the gated content. The full content includes detailed insights, 
                actionable strategies, and comprehensive resources that will help you achieve your goals...
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          )}

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">What you&apos;ll get:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gate Type Badge */}
          <div className="mb-6">
            <Badge variant="outline" className="text-xs">
              {gateType === 'email' && 'Free with Email'}
              {gateType === 'premium' && 'Premium Content'}
              {gateType === 'download' && 'Downloadable Resource'}
            </Badge>
          </div>

          {/* Unlock Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full max-w-xs">
                {getGateButtonText()}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getGateIcon()}
                  {getGateTitle()}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {getGateDescription()}
                </p>
                
                {gateType === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                    />
                    <p className="text-xs text-gray-500">
                      We&apos;ll send you the content and keep you updated with valuable insights.
                    </p>
                  </div>
                )}
                
                {gateType === 'premium' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Premium Benefits:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Access to all premium content</li>
                        <li>• Exclusive templates and resources</li>
                        <li>• Priority support</li>
                        <li>• Advanced analytics</li>
                      </ul>
                    </div>
                    <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
                      View Pricing Plans
                    </Button>
                  </div>
                )}
                
                {gateType === 'download' && (
                  <div className="space-y-2">
                    <Label htmlFor="download-email">Email Address</Label>
                    <Input
                      id="download-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                    />
                    <p className="text-xs text-gray-500">
                      We&apos;ll email you the download link and keep you updated with new resources.
                    </p>
                  </div>
                )}
                
                {(gateType === 'email' || gateType === 'download') && (
                  <Button 
                    onClick={handleUnlock} 
                    disabled={isSubmitting || !email}
                    className="w-full"
                  >
                    {isSubmitting ? 'Processing...' : getGateButtonText()}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>No spam</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Unsubscribe anytime</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Privacy protected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 