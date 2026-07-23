/**
 * Direct Turso client wrapper
 * Use this instead of Prisma to avoid schema caching issues
 */
import { createClient, Client } from '@libsql/client';

let cachedClient: Client | null = null;

export function getTursoClient(): Client {
  if (cachedClient) return cachedClient;
  
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!tursoUrl || !tursoToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  }
  
  cachedClient = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
  
  return cachedClient;
}

/**
 * Execute a query and return the first row or null
 */
export async function queryOne<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const client = getTursoClient();
  const result = await client.execute({ sql, args });
  if (result.rows.length === 0) return null;
  return result.rows[0] as T;
}

/**
 * Execute a query and return all rows
 */
export async function queryMany<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const client = getTursoClient();
  const result = await client.execute({ sql, args });
  return result.rows as T[];
}

/**
 * Execute an insert/update/delete and return affected rows
 */
export async function execute(sql: string, args: any[] = []): Promise<number> {
  const client = getTursoClient();
  const result = await client.execute({ sql, args });
  return result.rowsAffected;
}
