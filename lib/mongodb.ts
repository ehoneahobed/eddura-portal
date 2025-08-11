import mongoose from 'mongoose';
// Import models to ensure they are registered
try {
  require('./models');
} catch (error) {
  // Ignore if models can't be loaded (e.g., during build)
}

// Silence Mongoose debug in production
if (process.env.NODE_ENV === 'production') {
  mongoose.set('debug', false);
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
    return mongoose;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Cap pool and fail fast to avoid exhausting free-tier connections
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 7000,
      socketTimeoutMS: 20000,
    } as any;

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (process.env.NODE_ENV !== 'production') console.log('✅ Connected to MongoDB Atlas');
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
export const connectToDatabase = connectDB;