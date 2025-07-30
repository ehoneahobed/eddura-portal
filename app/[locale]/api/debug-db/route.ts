import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('=== DATABASE DEBUG ENDPOINT ===');
    
    // Check environment variables
    const mongoUri = process.env.MONGODB_URI;
    console.log('Environment variables check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- MONGODB_URI exists:', !!mongoUri);
    console.log('- MONGODB_URI length:', mongoUri?.length || 0);
    console.log('- MONGODB_URI type:', typeof mongoUri);
    
    if (!mongoUri) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable is not set',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          hasMongoUri: false
        }
      }, { status: 500 });
    }
    
    // Test database connection
    console.log('Testing database connection...');
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Check collections
    const db = await connectDB();
    if (!db.connection.db) {
      throw new Error('Database connection failed - no database instance');
    }
    const collections = await db.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check documents
    const documentCount = await Document.countDocuments();
    console.log('Total documents in database:', documentCount);
    
    // Check users
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);
    
    // Get sample documents
    const sampleDocuments = await Document.find().limit(5).lean();
    console.log('Sample documents:', sampleDocuments);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      collections: collections.map(c => c.name),
      documentCount,
      userCount,
      sampleDocuments,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongoUri: true,
        mongoUriLength: mongoUri.length,
        mongoUriPrefix: mongoUri.substring(0, 25)
      }
    });
    
  } catch (error) {
    console.error('=== DATABASE DEBUG ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error details:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : { message: 'Unknown error type', error },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}