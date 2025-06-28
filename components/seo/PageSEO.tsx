'use client';

import Head from 'next/head';

interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
}

export function PageSEO({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  noindex = false
}: PageSEOProps) {
  const fullTitle = title ? `${title} | Eddura` : 'Eddura - Educational Management Platform';
  const fullDescription = description || 'Eddura is a comprehensive educational management platform for schools, programs, and scholarships.';
  const fullUrl = url ? `https://eddura.com${url}` : 'https://eddura.com';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={`https://eddura.com${image}`} />
      <meta property="og:site_name" content="Eddura" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={`https://eddura.com${image}`} />
      <meta name="twitter:creator" content="@eddura" />
      
      {/* Robots */}
      {noindex && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
} 