# Eddura - Educational Management Platform

[![Eddura](https://img.shields.io/badge/Eddura-Educational%20Management-blue.svg)](https://eddura.com)
[![Next.js](https://img.shields.io/badge/Next.js-13.5.1-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)

## Overview

**Eddura** is a comprehensive educational management platform designed to streamline the administration of schools, programs, and scholarships. Built with modern web technologies, Eddura provides powerful tools for educational institutions to manage their operations efficiently and effectively.

## 🌟 Key Features

### 🏫 School Management
- Comprehensive institution profiles
- Global ranking integration
- Multi-location support
- Administrative dashboard

### 📚 Program Management
- Academic program creation and management
- Curriculum tracking
- Tuition fee management
- Multi-language support
- Degree type categorization

### 🎓 Scholarship Management
- Scholarship opportunity creation
- Application tracking
- Value and coverage management
- Deadline management
- Provider categorization

### 📊 Analytics & Insights
- Real-time dashboard analytics
- Growth tracking
- Performance metrics
- Data visualization

## 🚀 Technology Stack

- **Frontend**: Next.js 13.5.1, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB Atlas
- **State Management**: SWR for data fetching
- **Authentication**: NextAuth.js (ready for integration)
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/eddura-portal.git
   cd eddura-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Launch Status - Set to 'true' when ready to launch, 'false' for coming soon page
   NEXT_PUBLIC_LAUNCHED=false
   
   # Database Configuration
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
eddura-portal/
├── app/                    # Next.js 13 app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard-specific components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── seo/              # SEO components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── models/               # MongoDB models
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🔧 Configuration

### SEO Configuration

Eddura includes comprehensive SEO optimization:

- **Meta Tags**: Dynamic meta tags for all pages
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine crawling instructions

### Database Models

- **School**: Educational institution data
- **Program**: Academic program information
- **Scholarship**: Scholarship opportunities

## 📱 Features

### Dashboard
- Real-time statistics
- Recent activity tracking
- Quick action buttons
- Top items by various metrics
- Data health monitoring

### Data Management
- CRUD operations for all entities
- Bulk operations support
- Search and filtering
- Pagination
- Export capabilities

### User Experience
- Responsive design
- Loading states
- Error handling
- Toast notifications
- Keyboard navigation

### Launch Management
- **Coming Soon Page**: Pre-launch landing page with Telegram channel integration
- **Environment Control**: Toggle between coming soon and full application via `NEXT_PUBLIC_LAUNCHED`
- **Early Access Collection**: Email signup for pre-launch notifications
- **Social Integration**: Direct link to [Eddura Official Telegram Channel](https://t.me/edduraofficial)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** with automatic CI/CD

### Other Platforms

The application is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security

- Environment variable protection
- API route validation
- Input sanitization
- CORS configuration
- Rate limiting ready

## 📈 Performance

- **SWR Integration**: Fast, stable data fetching
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting
- **Caching**: Intelligent caching strategies
- **Bundle Analysis**: Built-in bundle analyzer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.eddura.com](https://docs.eddura.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/eddura-portal/issues)
- **Email**: support@eddura.com
- **Discord**: [Eddura Community](https://discord.gg/eddura)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [MongoDB](https://www.mongodb.com/) for the database
- [SWR](https://swr.vercel.app/) for data fetching

---

**Built with ❤️ by the Eddura Team**

*Transforming educational management with innovative technology solutions.*
