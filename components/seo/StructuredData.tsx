'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

// Organization structured data
export const organizationStructuredData = {
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
};

// Software application structured data
export const softwareApplicationStructuredData = {
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
};

// WebSite structured data
export const websiteStructuredData = {
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
}; 