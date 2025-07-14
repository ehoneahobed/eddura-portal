import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Content from '@/models/Content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eddura.com';
  
  // Get all published content for sitemap
  let contentUrls: MetadataRoute.Sitemap = [];
  
  try {
    await connectToDatabase();
    const publishedContent = await Content.find({ status: 'published' })
      .select('slug updatedAt')
      .lean();
    
    contentUrls = publishedContent.map((content) => ({
      url: `${baseUrl}/content/${content.slug}`,
      lastModified: content.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating content sitemap:', error);
  }
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/content`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/admin/schools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/admin/programs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/admin/scholarships`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/admin/content`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    ...contentUrls,
  ];
} 