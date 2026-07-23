import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with Turso adapter if configured, otherwise use local SQLite
function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  
  if (tursoUrl && tursoToken) {
    // Use Turso (cloud database)
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    
    const adapter = new PrismaLibSql(libsql)
    console.log('✅ Using Turso cloud database:', tursoUrl.replace(/\/\/.*@/, '//***@'))
    
    return new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    })
  } else {
    // Fallback: if DATABASE_URL is set and looks like Turso, throw error
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl && dbUrl.startsWith('libsql://')) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set when using Turso database')
    }
    
    // Use local SQLite
    console.log('📁 Using local SQLite database')
    return new PrismaClient({
      log: ['error', 'warn'],
    })
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db