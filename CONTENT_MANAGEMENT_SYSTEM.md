# Content Management System

A comprehensive content management system for Eddura that handles blog posts, opportunities, events, and other educational content with SEO optimization and strategic CTAs.

## Features

### 🎯 Content Types
- **Blog Posts**: Educational articles, tips, guides, and insights
- **Opportunities**: Scholarships, fellowships, internships, jobs, grants
- **Events**: Webinars, conferences, workshops, networking events

### 🔍 SEO Optimization
- Meta titles and descriptions
- Keywords management
- Canonical URLs
- Social media optimization
- Structured data (Schema.org)
- Automatic sitemap generation
- Open Graph and Twitter Card support

### 📈 CTA Management
- Configurable call-to-action sections
- Multiple positioning options (top, bottom, sidebar, inline)
- Different styling options (primary, secondary, outline)
- Strategic placement to drive platform signups

### 🛠️ Admin Features
- Rich text editor (React Quill)
- Content scheduling
- Draft/published/archived status
- Categories and tags management
- Featured images
- Analytics tracking (view counts)
- Content versioning

### 🌐 Public Features
- Responsive content listing
- Advanced filtering and search
- Related content suggestions
- Social sharing
- Reading time estimation
- Type-specific information display

## Architecture

### Database Schema

The content is stored in a MongoDB collection with the following structure:

```typescript
interface IContent {
  // Basic Information
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: 'blog' | 'opportunity' | 'event';
  status: 'draft' | 'published' | 'archived';
  
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  
  // Content Specific
  featuredImage?: string;
  author: string;
  publishDate?: Date;
  scheduledDate?: Date;
  categories: string[];
  tags: string[];
  
  // Event Specific
  eventDate?: Date;
  eventEndDate?: Date;
  eventLocation?: string;
  eventType?: 'online' | 'in-person' | 'hybrid';
  registrationLink?: string;
  
  // Opportunity Specific
  opportunityType?: 'scholarship' | 'fellowship' | 'internship' | 'job' | 'grant';
  deadline?: Date;
  value?: string;
  eligibility?: string;
  applicationLink?: string;
  
  // CTA Configuration
  cta: {
    enabled: boolean;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    position: 'top' | 'bottom' | 'sidebar' | 'inline';
    style: 'primary' | 'secondary' | 'outline';
  };
  
  // Analytics
  viewCount: number;
  engagementRate?: number;
  conversionRate?: number;
  
  // Social Media
  socialShareImage?: string;
  socialTitle?: string;
  socialDescription?: string;
  
  // Management
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Content Management
- `GET /api/content` - List content with filtering and pagination
- `POST /api/content` - Create new content
- `GET /api/content/[id]` - Get specific content by ID or slug
- `PUT /api/content/[id]` - Update content
- `DELETE /api/content/[id]` - Delete content

#### Filters
- `GET /api/content/filters` - Get available categories and tags

### File Structure

```
app/
├── admin/content/
│   ├── page.tsx              # Content management dashboard
│   └── new/
│       └── page.tsx          # Content creation form
├── content/
│   ├── page.tsx              # Public content listing
│   └── [slug]/
│       └── page.tsx          # Individual content display
├── api/content/
│   ├── route.ts              # Main content API
│   ├── [id]/
│   │   └── route.ts          # Individual content API
│   └── filters/
│       └── route.ts          # Filter data API
components/
└── content/
    ├── ContentCard.tsx       # Content card component
    ├── ContentFilters.tsx    # Filter sidebar component
    └── ContentCTA.tsx        # CTA component
models/
└── Content.ts               # Content model
scripts/
└── seed-content.ts          # Sample content seeding
```

## Usage

### For Content Team

#### Creating Content

1. **Access Admin Panel**
   - Navigate to `/admin/content`
   - Click "Create Content"

2. **Fill Content Form**
   - **Content Tab**: Basic information, rich text content, type-specific fields
   - **SEO Tab**: Meta titles, descriptions, keywords, social media
   - **Settings Tab**: Categories, tags, scheduling, status
   - **CTA Tab**: Configure call-to-action sections

3. **Publish Content**
   - Set status to "Published"
   - Set publish date (or leave for immediate publishing)
   - Click "Save Content"

#### Managing Content

- **Dashboard**: View all content with filtering and search
- **Edit**: Click edit button to modify existing content
- **Preview**: Use preview mode to see how content will appear
- **Delete**: Remove content (with confirmation)

### For Developers

#### Adding New Content Types

1. **Update Model**
   ```typescript
   // In models/Content.ts
   type: 'blog' | 'opportunity' | 'event' | 'new-type';
   ```

2. **Update API Validation**
   ```typescript
   // In API routes
   const contentSchema = z.object({
     type: z.enum(['blog', 'opportunity', 'event', 'new-type']),
     // ... other fields
   });
   ```

3. **Update UI Components**
   - Add type to ContentCard component
   - Update ContentFilters component
   - Add type-specific fields to creation form

#### Customizing CTAs

1. **Add New CTA Positions**
   ```typescript
   position: 'top' | 'bottom' | 'sidebar' | 'inline' | 'new-position';
   ```

2. **Add New CTA Styles**
   ```typescript
   style: 'primary' | 'secondary' | 'outline' | 'new-style';
   ```

3. **Update ContentCTA Component**
   - Add styling for new positions/styles
   - Update icon mapping

## SEO Features

### Automatic SEO
- Auto-generated meta titles from content titles
- Auto-generated meta descriptions from excerpts
- Automatic slug generation from titles
- Structured data for different content types

### Manual SEO Control
- Custom meta titles and descriptions
- Keyword management
- Canonical URL specification
- Social media optimization

### Technical SEO
- Sitemap generation with content URLs
- Proper heading structure
- Image alt tags
- Internal linking suggestions

## CTA Strategy

### Positioning Options
- **Top**: Early engagement, high visibility
- **Bottom**: After content consumption, conversion-focused
- **Sidebar**: Persistent presence, non-intrusive
- **Inline**: Contextual placement within content

### Styling Options
- **Primary**: High-contrast, main conversion focus
- **Secondary**: Subtle but noticeable
- **Outline**: Minimal, non-intrusive

### Best Practices
- Use relevant, benefit-focused copy
- Include social proof elements
- Test different positions and styles
- Track conversion rates
- A/B test different approaches

## Analytics & Performance

### Tracking Metrics
- View counts (automatic)
- Engagement rates (manual input)
- Conversion rates (manual input)
- Reading time estimation

### Performance Optimization
- Database indexing on frequently queried fields
- Pagination for large content lists
- Image optimization
- Caching strategies

## Content Guidelines

### Blog Posts
- Minimum 500 words
- Include relevant images
- Use proper heading structure
- Include internal/external links
- Add relevant tags and categories

### Opportunities
- Include all deadline information
- Specify eligibility clearly
- Provide application links
- Include value/benefits information
- Add relevant tags for discoverability

### Events
- Include complete event details
- Specify event type (online/in-person/hybrid)
- Provide registration links
- Include speaker information
- Add relevant tags and categories

## Setup Instructions

### 1. Database Setup
```bash
# The Content model will be automatically created when first accessed
```

### 2. Seed Sample Content
```bash
npm run seed:content
```

### 3. Access Admin Panel
- Navigate to `/admin/content`
- Create your first content piece

### 4. View Public Content
- Navigate to `/content`
- Browse and filter content

## Maintenance

### Regular Tasks
- Review and update content regularly
- Monitor analytics and conversion rates
- Update CTA strategies based on performance
- Clean up old/unused tags and categories
- Backup content regularly

### Performance Monitoring
- Monitor page load times
- Track SEO performance
- Analyze user engagement
- Review conversion funnel

## Troubleshooting

### Common Issues

1. **Content Not Appearing**
   - Check if status is set to "published"
   - Verify publish date is not in the future
   - Check for any validation errors

2. **SEO Issues**
   - Verify meta titles and descriptions are set
   - Check canonical URLs
   - Ensure proper heading structure

3. **CTA Not Showing**
   - Verify CTA is enabled
   - Check position settings
   - Ensure button link is valid

4. **Performance Issues**
   - Check database indexes
   - Monitor query performance
   - Optimize images

## Future Enhancements

### Planned Features
- Content analytics dashboard
- A/B testing for CTAs
- Content scheduling improvements
- Advanced search functionality
- Content recommendation engine
- Email newsletter integration
- Social media auto-posting
- Content performance insights

### Technical Improvements
- Content caching layer
- Image optimization pipeline
- Advanced SEO tools
- Content versioning system
- Bulk content operations
- API rate limiting
- Content backup system

## Support

For technical support or questions about the content management system, please refer to the development team or create an issue in the project repository.