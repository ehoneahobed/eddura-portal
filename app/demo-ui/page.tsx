'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack, ResponsiveText, Breakpoint } from '@/components/ui/responsive-container';
import { ModernCard, FeatureCard, StatCard, LinkCard } from '@/components/ui/modern-card';
import { LoadingSpinner, LoadingDots, FullPageLoading, CardSkeleton, ListSkeleton } from '@/components/ui/enhanced-loading';
import { ResponsiveNav } from '@/components/ui/responsive-nav';
import { useDemoNavigation } from '@/lib/navigation';
import { useCommonTranslation } from '@/hooks/useTranslation';
import { 
  Zap, 
  Shield, 
  Rocket, 
  TrendingUp, 
  Users, 
  Star,
  Search,
  Mail,
  Lock,
  User,
  Heart,
  BookOpen,
  Award
} from 'lucide-react';

export default function UIDemo() {
  const [loading, setLoading] = useState(false);
  const [showFullLoading, setShowFullLoading] = useState(false);
  const navItems = useDemoNavigation();
  const { t } = useCommonTranslation();

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleFullLoadingDemo = () => {
    setShowFullLoading(true);
    setTimeout(() => setShowFullLoading(false), 2000);
  };

  if (showFullLoading) {
    return <FullPageLoading message="Loading amazing UI..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-eddura-900">
      {/* Navigation Demo */}
      <ResponsiveNav 
        items={navItems}
        rightContent={
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">{t('navigation.signIn')}</Button>
            <Button size="sm">{t('navigation.getStarted')}</Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="pt-20">
        <ResponsiveContainer maxWidth="8xl" padding="lg">
          {/* Header Section */}
          <div className="text-center py-16">
            <ResponsiveText 
              as="h1" 
              size="6xl" 
              weight="bold" 
              color="primary"
              responsive
              className="mb-6"
            >
              Enhanced UI Components
            </ResponsiveText>
            <ResponsiveText 
              size="xl" 
              color="secondary"
              responsive
              className="mb-8 max-w-3xl mx-auto"
            >
              A comprehensive showcase of modern, responsive, and accessible UI components 
              with perfect dark mode support and mobile optimization.
            </ResponsiveText>
            
            <ResponsiveStack direction="responsive" spacing="md" justify="center" className="mb-12">
              <Button size="lg" className="min-w-[200px]">
                <Rocket className="mr-2 h-5 w-5" />
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <BookOpen className="mr-2 h-5 w-5" />
                Documentation
              </Button>
            </ResponsiveStack>

            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>

          {/* Stats Section */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Performance Stats
            </ResponsiveText>
            
            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="lg">
              <StatCard
                label="Performance Score"
                value="98%"
                change={{ value: "+12% from last month", trend: "up" }}
                icon={<TrendingUp className="h-6 w-6 text-eddura-500" />}
              />
              <StatCard
                label="Active Users"
                value="12.5K"
                change={{ value: "+2.1K this week", trend: "up" }}
                icon={<Users className="h-6 w-6 text-eddura-500" />}
              />
              <StatCard
                label="Satisfaction"
                value="4.9"
                change={{ value: "★ Rating", trend: "neutral" }}
                icon={<Star className="h-6 w-6 text-eddura-500" />}
              />
              <StatCard
                label="Load Time"
                value="0.8s"
                change={{ value: "-0.3s improved", trend: "up" }}
                icon={<Zap className="h-6 w-6 text-eddura-500" />}
              />
            </ResponsiveGrid>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Key Features
            </ResponsiveText>
            
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-eddura-500" />}
                title="Lightning Fast"
                description="Optimized for performance with lazy loading, code splitting, and efficient rendering."
                action={{ label: "Learn more", href: "/performance" }}
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-eddura-500" />}
                title="Secure by Default"
                description="Built with security best practices, including XSS protection and secure authentication."
                action={{ label: "Security docs", href: "/security" }}
              />
              <FeatureCard
                icon={<Heart className="h-6 w-6 text-eddura-500" />}
                title="Accessible"
                description="WCAG 2.1 compliant with keyboard navigation, screen reader support, and focus management."
                action={{ label: "Accessibility guide", href: "/accessibility" }}
              />
            </ResponsiveGrid>
          </section>

          {/* Form Components Demo */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Enhanced Form Components
            </ResponsiveText>
            
            <div className="max-w-2xl mx-auto">
              <ModernCard variant="elevated" className="p-8">
                <ResponsiveStack spacing="lg">
                  <div>
                    <label className="block text-sm font-medium text-eddura-700 dark:text-eddura-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      leftIcon={<Mail className="h-4 w-4" />}
                      success={true}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-eddura-700 dark:text-eddura-300 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      leftIcon={<Lock className="h-4 w-4" />}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-eddura-700 dark:text-eddura-300 mb-2">
                      Full Name (with error)
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      leftIcon={<User className="h-4 w-4" />}
                      error="This field is required"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-eddura-700 dark:text-eddura-300 mb-2">
                      Search (filled variant)
                    </label>
                    <Input
                      variant="filled"
                      type="text"
                      placeholder="Search anything..."
                      leftIcon={<Search className="h-4 w-4" />}
                    />
                  </div>
                  
                  <ResponsiveStack direction="responsive" spacing="md">
                    <Button 
                      className="flex-1" 
                      onClick={handleLoadingDemo}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Submit Form'
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </ResponsiveStack>
                </ResponsiveStack>
              </ModernCard>
            </div>
          </section>

          {/* Loading States Demo */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Loading States
            </ResponsiveText>
            
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
              <ModernCard variant="outlined" className="p-6">
                <div className="text-center space-y-4">
                  <ResponsiveText weight="semibold">Spinner Loading</ResponsiveText>
                  <LoadingSpinner size="lg" />
                  <Button size="sm" onClick={handleFullLoadingDemo}>
                    Demo Full Page
                  </Button>
                </div>
              </ModernCard>
              
              <ModernCard variant="outlined" className="p-6">
                <div className="text-center space-y-4">
                  <ResponsiveText weight="semibold">Dots Loading</ResponsiveText>
                  <LoadingDots />
                  <ResponsiveText size="sm" color="muted">
                    Perfect for inline loading
                  </ResponsiveText>
                </div>
              </ModernCard>
              
              <ModernCard variant="outlined" className="p-6">
                <ResponsiveText weight="semibold" className="mb-4">Skeleton Loading</ResponsiveText>
                <CardSkeleton />
              </ModernCard>
            </ResponsiveGrid>
          </section>

          {/* Card Variants Demo */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Card Variants
            </ResponsiveText>
            
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 4 }} gap="lg">
              <ModernCard variant="default" hover="lift" className="p-6">
                <ResponsiveText weight="semibold" className="mb-2">Default Card</ResponsiveText>
                <ResponsiveText size="sm" color="muted">
                  Standard card with subtle shadow and hover lift effect.
                </ResponsiveText>
              </ModernCard>
              
              <ModernCard variant="elevated" hover="glow" className="p-6">
                <ResponsiveText weight="semibold" className="mb-2">Elevated Card</ResponsiveText>
                <ResponsiveText size="sm" color="muted">
                  Enhanced shadow with glow hover effect.
                </ResponsiveText>
              </ModernCard>
              
              <ModernCard variant="outlined" hover="scale" className="p-6">
                <ResponsiveText weight="semibold" className="mb-2">Outlined Card</ResponsiveText>
                <ResponsiveText size="sm" color="muted">
                  Clean border design with scale hover effect.
                </ResponsiveText>
              </ModernCard>
              
              <ModernCard variant="gradient" hover="lift" className="p-6">
                <ResponsiveText weight="semibold" className="mb-2">Gradient Card</ResponsiveText>
                <ResponsiveText size="sm" color="muted">
                  Subtle gradient background with lift effect.
                </ResponsiveText>
              </ModernCard>
            </ResponsiveGrid>
          </section>

          {/* Link Cards Demo */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Interactive Link Cards
            </ResponsiveText>
            
            <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg" className="max-w-4xl mx-auto">
              <LinkCard
                title="Documentation"
                description="Comprehensive guides and API references"
                href="/docs"
              />
              <LinkCard
                title="GitHub Repository"
                description="View source code and contribute"
                href="https://github.com/example/repo"
                external
              />
              <LinkCard
                title="Community Forum"
                description="Get help and share knowledge"
                href="/community"
              />
              <LinkCard
                title="Blog"
                description="Latest updates and tutorials"
                href="/blog"
              />
            </ResponsiveGrid>
          </section>

          {/* Responsive Breakpoints Demo */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Responsive Breakpoints
            </ResponsiveText>
            
            <ModernCard variant="outlined" className="p-8">
              <ResponsiveStack spacing="lg">
                <Breakpoint show={['xs', 'sm']}>
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <ResponsiveText weight="semibold" color="error">
                      📱 Mobile View (xs, sm)
                    </ResponsiveText>
                    <ResponsiveText size="sm" color="muted">
                      This content is only visible on mobile devices
                    </ResponsiveText>
                  </div>
                </Breakpoint>
                
                <Breakpoint show={['md']}>
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <ResponsiveText weight="semibold" color="warning">
                      💻 Tablet View (md)
                    </ResponsiveText>
                    <ResponsiveText size="sm" color="muted">
                      This content is only visible on tablets
                    </ResponsiveText>
                  </div>
                </Breakpoint>
                
                <Breakpoint show={['lg', 'xl', '2xl']}>
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <ResponsiveText weight="semibold" color="success">
                      🖥️ Desktop View (lg+)
                    </ResponsiveText>
                    <ResponsiveText size="sm" color="muted">
                      This content is only visible on desktop screens
                    </ResponsiveText>
                  </div>
                </Breakpoint>
                
                <div className="p-4 bg-eddura-100 dark:bg-eddura-800 rounded-lg">
                  <ResponsiveText weight="semibold">
                    🌐 Always Visible
                  </ResponsiveText>
                  <ResponsiveText size="sm" color="muted">
                    This content is visible on all screen sizes
                  </ResponsiveText>
                </div>
              </ResponsiveStack>
            </ModernCard>
          </section>

          {/* Button Variants Demo */}
          <section className="py-16">
            <ResponsiveText as="h2" size="3xl" weight="bold" color="primary" className="text-center mb-12">
              Button Variants
            </ResponsiveText>
            
            <ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="destructive">Destructive</Button>
            </ResponsiveGrid>
            
            <div className="mt-8">
              <ResponsiveText weight="semibold" className="mb-4">Button Sizes</ResponsiveText>
              <ResponsiveStack direction="responsive" spacing="md" align="center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </ResponsiveStack>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-16 text-center border-t border-eddura-200 dark:border-eddura-700">
            <ResponsiveText color="muted">
              Enhanced UI Components Demo - Built with Next.js, Tailwind CSS, and Framer Motion
            </ResponsiveText>
          </footer>
        </ResponsiveContainer>
      </div>
    </div>
  );
}