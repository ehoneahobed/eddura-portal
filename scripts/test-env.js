const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔍 Environment Test - Starting...');

// Test environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('🔍 Environment Test - Checking required environment variables:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '[HIDDEN]' : value}`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
  }
});

// Test MongoDB connection
async function testMongoConnection() {
  try {
    console.log('🔍 Environment Test - Testing MongoDB connection...');
    const mongoose = require('mongoose');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('❌ Environment Test - MONGODB_URI not set');
      return;
    }
    
    console.log('🔍 Environment Test - Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Environment Test - MongoDB connected successfully');
    
    // Test if we can access the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('🔍 Environment Test - Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Environment Test - MongoDB disconnected');
    
  } catch (error) {
    console.error('❌ Environment Test - MongoDB connection failed:', error.message);
  }
}

testMongoConnection();