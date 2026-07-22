/**
 * Turso Database Client
 * 
 * This module provides a connection to Turso (libSQL) database
 * Falls back to local SQLite if Turso is not configured
 */

import { createClient } from '@libsql/client';

// Check if Turso is configured
const isTursoConfigured = () => {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
};

// Create Turso client
export const turso = isTursoConfigured() 
  ? createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  : null;

// Helper to check if using Turso
export const isUsingTurso = () => turso !== null;

// Log current database mode
if (isUsingTurso()) {
  console.log('✅ Using Turso cloud database');
} else {
  console.log('📁 Using local SQLite database');
}
