import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Script from 'next/script';
import { 
  School, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Globe, 
  Shield, 
  Zap, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Eddura - Educational Management Platform',
  description: 'Eddura is a comprehensive educational management platform for schools, programs, and scholarships. Streamline your educational institution management with our powerful tools.',
  keywords: [
    'Eddura',
    'educational management',
    'school management',
    'program management',
    'scholarship management',
    'education platform',
    'academic programs',
    'educational institutions'
  ],
  openGraph: {
    title: 'Eddura - Educational Management Platform',
    description: 'Comprehensive platform for managing schools, programs, and scholarships. Streamline your educational institution management.',
    url: 'https://eddura.com',
    siteName: 'Eddura',
  },
};

const features = [
  {
    icon: School,
    title: 'School Management',
    description: 'Comprehensive tools for managing educational institutions, student records, and administrative tasks.',
    color: 'text-blue-600'
  },
  {
    icon: BookOpen,
    title: 'Program Management',
    description: 'Create and manage academic programs, courses, and curriculum with detailed tracking and analytics.',
    color: 'text-green-600'
  },
  {
    icon: GraduationCap,
    title: 'Scholarship Management',
    description: 'Streamline scholarship applications, tracking, and distribution with automated workflows.',
    color: 'text-purple-600'
  },
  {
    icon: Users,
    title: 'Student Portal',
    description: 'Provide students with easy access to programs, applications, and educational resources.',
    color: 'text-orange-600'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connect with educational institutions and students worldwide through our platform.',
    color: 'text-indigo-600'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security and reliability to protect your educational data.',
    color: 'text-red-600'
  }
];

const benefits = [
  'Streamlined administrative processes',
  'Real-time data analytics and insights',
  'Automated workflow management',
  'Multi-institution support',
  'Mobile-responsive design',
  '24/7 technical support',
  'Customizable dashboards',
  'Integration with existing systems'
];

export default function Home() {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Eddura',
              url: 'https://eddura.com',
              logo: 'https://eddura.com/logo.png',
              description: 'Eddura is a comprehensive educational management platform for schools, programs, and scholarships.',
              sameAs: [
                'https://twitter.com/eddura',
                'https://linkedin.com/company/eddura',
                'https://facebook.com/eddura'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-123-4567',
                contactType: 'customer service',
                email: 'support@eddura.com'
              },
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'US',
                addressLocality: 'San Francisco',
                addressRegion: 'CA'
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Eddura Educational Management Platform',
              description: 'Comprehensive platform for managing schools, programs, and scholarships.',
              url: 'https://eddura.com',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              },
              author: {
                '@type': 'Organization',
                name: 'Eddura'
              }
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Eddura',
              url: 'https://eddura.com',
              description: 'Educational management platform for schools, programs, and scholarships.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://eddura.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            }
          ])
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900">Eddura</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/admin">
                  <Button variant="outline">Admin Portal</Button>
                </Link>
                <Link href="/admin">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Transform Your
                <span className="text-blue-600"> Educational</span> Management
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Eddura is a comprehensive platform designed to streamline the management of schools, 
                programs, and scholarships. Empower your educational institution with powerful tools 
                and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/admin">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Start Managing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for Modern Education
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage your educational institution efficiently and effectively.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Icon className={`h-12 w-12 ${feature.color} mb-4`} />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Choose Eddura?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Our platform is designed with educators in mind, providing the tools and insights 
                  you need to succeed in today&apos;s digital education landscape.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                  <Zap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Get Started?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Join thousands of educational institutions already using Eddura to streamline 
                    their operations and improve student outcomes.
                  </p>
                  <Link href="/admin">
                    <Button size="lg" className="w-full">
                      Access Admin Portal
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Eddura</h3>
                <p className="text-gray-400">
                  Transforming educational management with innovative technology solutions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/admin" className="hover:text-white">Admin Portal</Link></li>
                  <li><Link href="#features" className="hover:text-white">Features</Link></li>
                  <li><Link href="#" className="hover:text-white">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                  <li><Link href="#" className="hover:text-white">Status</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="#" className="hover:text-white">About</Link></li>
                  <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-white">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Eddura. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}