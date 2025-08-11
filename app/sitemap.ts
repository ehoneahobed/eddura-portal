import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';

export const revalidate = 3600; // 1 hour revalidation to avoid blocking builds

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eddura.com';
  let contentUrls: MetadataRoute.Sitemap = [];

  try {
    // Only attempt DB if URI exists; otherwise skip silently
    if (process.env.MONGODB_URI) {
      await connectDB();
      const publishedContent = await Content.find({ status: 'published' })
        .select('slug updatedAt')
        .lean();
      contentUrls = publishedContent.map((content) => ({
        url: `${baseUrl}/content/${content.slug}`,
        lastModified: content.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn('Sitemap DB fetch skipped:', error instanceof Error ? error.message : error);
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/content`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/admin`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/admin/schools`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/admin/programs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/admin/scholarships`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/admin/content`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ...contentUrls,
  ];
} 