import mongoose from 'mongoose';
// Import models to ensure they are registered
try {
  require('./models');
} catch (error) {
  // Ignore if models can't be loaded (e.g., during build)
}

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global variable to cache the database connection
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // During build time, return a mock connection to prevent build failures
  if (process.env.NODE_ENV === 'production' && !MONGODB_URI) {
    console.warn('MONGODB_URI not available during build, skipping connection');
    return mongoose;
  }

  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not available in development, using mock connection');
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;