import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import path from 'path'

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
    let url = process.env.DATABASE_URL || 'file:./db/custom.db'
    if (url.startsWith('file:')) {
      const filePath = url.slice(5)
      if (!path.isAbsolute(filePath)) {
        const normalized = filePath.startsWith('./') ? filePath.slice(2) : filePath
        const resolved = path.resolve(process.cwd(), normalized)
        url = `file:${resolved.replace(/\\/g, '/')}`
      }
    }
    console.log('📁 Using local SQLite database:', url)
    return new PrismaClient({
      datasources: { db: { url } },
      log: ['error', 'warn'],
    })
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db