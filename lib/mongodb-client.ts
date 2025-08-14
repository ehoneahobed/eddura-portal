import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '5', 10),
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '0', 10),
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  appName: process.env.VERCEL ? 'eddura-vercel' : 'eddura-local'
};

let client;
let clientPromise: Promise<MongoClient>;

// During build time, return a mock promise to prevent build failures
if (!uri) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('MONGODB_URI not available during build, using mock client');
    clientPromise = Promise.resolve({} as MongoClient);
  } else {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }
} else if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;