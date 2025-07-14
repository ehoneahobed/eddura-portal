import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContent extends Document {
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
  
  // Content Specific Fields
  featuredImage?: string;
  author: string;
  publishDate?: Date;
  scheduledDate?: Date;
  
  // Categories and Tags
  categories: string[];
  tags: string[];
  
  // Event Specific Fields
  eventDate?: Date;
  eventEndDate?: Date;
  eventLocation?: string;
  eventType?: 'online' | 'in-person' | 'hybrid';
  registrationLink?: string;
  
  // Opportunity Specific Fields
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
  
  // Analytics and Performance
  viewCount: number;
  engagementRate?: number;
  conversionRate?: number;
  
  // Social Media
  socialShareImage?: string;
  socialTitle?: string;
  socialDescription?: string;
  
  // Related Content
  relatedContent?: string[];
  
  // Content Management
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema: Schema = new Schema<IContent>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    content: { 
      type: String, 
      required: true,
      trim: true
    },
    excerpt: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 300
    },
    type: {
      type: String,
      enum: ['blog', 'opportunity', 'event'],
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    
    // SEO Fields
    metaTitle: { 
      type: String, 
      trim: true,
      maxlength: 60
    },
    metaDescription: { 
      type: String, 
      trim: true,
      maxlength: 160
    },
    keywords: [{ 
      type: String, 
      trim: true 
    }],
    canonicalUrl: { 
      type: String, 
      trim: true 
    },
    
    // Content Specific Fields
    featuredImage: { 
      type: String, 
      trim: true 
    },
    author: { 
      type: String, 
      required: true,
      trim: true 
    },
    publishDate: { 
      type: Date 
    },
    scheduledDate: { 
      type: Date 
    },
    
    // Categories and Tags
    categories: [{ 
      type: String, 
      trim: true 
    }],
    tags: [{ 
      type: String, 
      trim: true 
    }],
    
    // Event Specific Fields
    eventDate: { 
      type: Date 
    },
    eventEndDate: { 
      type: Date 
    },
    eventLocation: { 
      type: String, 
      trim: true 
    },
    eventType: {
      type: String,
      enum: ['online', 'in-person', 'hybrid']
    },
    registrationLink: { 
      type: String, 
      trim: true 
    },
    
    // Opportunity Specific Fields
    opportunityType: {
      type: String,
      enum: ['scholarship', 'fellowship', 'internship', 'job', 'grant']
    },
    deadline: { 
      type: Date 
    },
    value: { 
      type: String, 
      trim: true 
    },
    eligibility: { 
      type: String, 
      trim: true 
    },
    applicationLink: { 
      type: String, 
      trim: true 
    },
    
    // CTA Configuration
    cta: {
      enabled: { 
        type: Boolean, 
        default: true 
      },
      title: { 
        type: String, 
        trim: true,
        maxlength: 100
      },
      description: { 
        type: String, 
        trim: true,
        maxlength: 200
      },
      buttonText: { 
        type: String, 
        trim: true,
        maxlength: 50
      },
      buttonLink: { 
        type: String, 
        trim: true 
      },
      position: {
        type: String,
        enum: ['top', 'bottom', 'sidebar', 'inline'],
        default: 'bottom'
      },
      style: {
        type: String,
        enum: ['primary', 'secondary', 'outline'],
        default: 'primary'
      }
    },
    
    // Analytics and Performance
    viewCount: { 
      type: Number, 
      default: 0 
    },
    engagementRate: { 
      type: Number, 
      min: 0, 
      max: 100 
    },
    conversionRate: { 
      type: Number, 
      min: 0, 
      max: 100 
    },
    
    // Social Media
    socialShareImage: { 
      type: String, 
      trim: true 
    },
    socialTitle: { 
      type: String, 
      trim: true,
      maxlength: 100
    },
    socialDescription: { 
      type: String, 
      trim: true,
      maxlength: 200
    },
    
    // Related Content
    relatedContent: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Content' 
    }],
    
    // Content Management
    createdBy: { 
      type: String, 
      required: true 
    },
    lastModifiedBy: { 
      type: String, 
      required: true 
    },
    version: { 
      type: Number, 
      default: 1 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
ContentSchema.index({ slug: 1 });
ContentSchema.index({ type: 1, status: 1 });
ContentSchema.index({ status: 1, publishDate: -1 });
ContentSchema.index({ categories: 1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ author: 1 });
ContentSchema.index({ 'cta.enabled': 1 });
ContentSchema.index({ viewCount: -1 });

// Virtual for full URL
ContentSchema.virtual('url').get(function() {
  return `/content/${this.slug}`;
});

// Virtual for reading time (estimated)
ContentSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to generate slug if not provided
ContentSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // Set publish date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishDate) {
    this.publishDate = new Date();
  }
  
  next();
});

const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;