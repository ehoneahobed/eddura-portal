import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = { maxPoolSize: 5 } as any;

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
} else {
  // Reuse a global client in all environments to minimize pool fan-out in serverless
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;