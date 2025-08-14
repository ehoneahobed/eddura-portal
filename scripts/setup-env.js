#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Eddura Environment Setup\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env.local already exists. Please update it manually with the following variables:\n');
} else {
  console.log('📝 Creating .env.local file...\n');
}

const envContent = `# Eddura Environment Configuration

# Launch Status
# Set to 'true' when ready to launch, 'false' for coming soon page
NEXT_PUBLIC_LAUNCHED=false

# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here
# Optional: Connection pool tuning (keeps Atlas connections low)
MONGODB_MAX_POOL_SIZE=5
MONGODB_MIN_POOL_SIZE=0

# Authentication (NextAuth.js)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics and Monitoring
# GOOGLE_ANALYTICS_ID=your_ga_id_here
# SENTRY_DSN=your_sentry_dsn_here

# Optional: Email Service
# EMAIL_SERVER_HOST=your_smtp_host
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=your_email_user
# EMAIL_SERVER_PASSWORD=your_email_password
# EMAIL_FROM=noreply@eddura.com
`;

if (!envExists) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created successfully!\n');
}

console.log('📋 Required Environment Variables:');
console.log('   • NEXT_PUBLIC_LAUNCHED: Controls whether to show full app or coming soon page');
console.log('   • MONGODB_URI: Your MongoDB connection string');
console.log('   • MONGODB_MAX_POOL_SIZE (optional): Default 5 (adjust for Atlas limits)');
console.log('   • MONGODB_MIN_POOL_SIZE (optional): Default 0');
console.log('   • NEXTAUTH_SECRET: Secret for NextAuth.js (generate with: openssl rand -base64 32)');
console.log('   • NEXTAUTH_URL: Your application URL (http://localhost:3000 for development)\n');

console.log('🔗 Telegram Channel: https://t.me/edduraofficial');
console.log('📚 Documentation: Check README.md for more details\n');

if (envExists) {
  console.log('💡 To update your existing .env.local, add the missing variables above.');
} else {
  console.log('🎉 Environment setup complete! Update the values in .env.local and run:');
  console.log('   npm run dev');
} 