import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { setSessionCookie, rateLimit, getClientIp } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req) || 'unknown';

    // Rate limit: 10 login attempts per minute per IP to mitigate brute force.
    if (!rateLimit(`login:${ip}`, 10)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again in a minute.' }, { status: 429 });
    }

    let email = '';
    let password = '';
    try {
      const body = await req.json();
      email = String(body.email || '').trim().toLowerCase();
      password = String(body.password || '');
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Use direct Turso client to avoid Prisma caching issues
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    // Query the user
    const result = await client.execute({
      sql: 'SELECT id, email, password, name, role FROM AdminUser WHERE email = ?',
      args: [email]
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password as string);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await client.execute({
      sql: 'UPDATE AdminUser SET lastLoginAt = ? WHERE id = ?',
      args: [new Date().toISOString(), user.id]
    });

    await setSessionCookie(email);
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Login failed', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
