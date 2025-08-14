import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

function getReadyStateName(state: number): string {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}

export async function GET(_req: NextRequest) {
  try {
    const start = Date.now();
    await connectDB();

    const conn = mongoose.connection;
    const client = typeof (conn as any).getClient === 'function'
      ? (conn as any).getClient()
      : (conn as any).client;

    // Ping latency
    let pingMs: number | null = null;
    try {
      await conn.db?.command({ ping: 1 });
      pingMs = Date.now() - start;
    } catch {
      pingMs = null;
    }

    // Pool options (from client if available, else from env)
    const clientOptions = client?.options || {};
    const pool = {
      maxPoolSize: clientOptions.maxPoolSize ?? parseInt(process.env.MONGODB_MAX_POOL_SIZE || '5', 10),
      minPoolSize: clientOptions.minPoolSize ?? parseInt(process.env.MONGODB_MIN_POOL_SIZE || '0', 10),
      maxIdleTimeMS: clientOptions.maxIdleTimeMS ?? 60000,
      serverSelectionTimeoutMS: clientOptions.serverSelectionTimeoutMS ?? 5000,
      socketTimeoutMS: clientOptions.socketTimeoutMS ?? 45000,
      appName: clientOptions.appName ?? (process.env.VERCEL ? 'eddura-vercel' : 'eddura-local')
    };

    // Server-reported connection metrics (may require privileges)
    let serverConnections: any = null;
    try {
      const admin = conn.db?.admin();
      const status = await admin?.command({ serverStatus: 1 });
      if (status && status.connections) {
        serverConnections = {
          current: status.connections.current,
          available: status.connections.available,
          totalCreated: status.connections.totalCreated,
          active: status.connections.active
        };
      }
    } catch (err) {
      serverConnections = { error: (err as Error).message || 'unavailable' };
    }

    const body = {
      success: true,
      runtime: {
        nodeEnv: process.env.NODE_ENV,
        pid: process.pid
      },
      mongoose: {
        readyState: conn.readyState,
        state: getReadyStateName(conn.readyState),
        connectionsCount: mongoose.connections.length,
        modelsCount: Object.keys(mongoose.models).length
      },
      pool,
      server: {
        connections: serverConnections
      },
      pingMs
    };

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}