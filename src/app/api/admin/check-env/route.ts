import { NextResponse } from 'next/server';

/**
 * Check environment variables
 */
export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (length: ' + (process.env.TURSO_AUTH_TOKEN?.length || 0) + ')' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
