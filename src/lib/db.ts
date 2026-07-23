import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveDbUrl() {
  let url = process.env.DATABASE_URL || 'file:./db/custom.db'
  if (url.startsWith('file:')) {
    const filePath = url.slice(5)
    if (!path.isAbsolute(filePath)) {
      const normalized = filePath.startsWith('./') ? filePath.slice(2) : filePath
      const resolved = path.resolve(process.cwd(), normalized)
      url = `file:${resolved.replace(/\\/g, '/')}`
    }
  }
  return url
}

// Ensure process.env.DATABASE_URL is always an absolute file URL for local SQLite
process.env.DATABASE_URL = resolveDbUrl()

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    try {
      const { PrismaLibSql } = require('@prisma/adapter-libsql')
      const { createClient } = require('@libsql/client')
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      })

      const adapter = new PrismaLibSql(libsql)
      console.log('✅ Using Turso cloud database')

      return new PrismaClient({
        adapter,
        log: ['error', 'warn'],
      })
    } catch (e) {
      console.warn('Failed to load Turso adapter, falling back to SQLite:', e)
    }
  }

  console.log('📁 Using SQLite database:', process.env.DATABASE_URL)

  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}