import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

/**
 * Test login endpoint using direct Turso client (bypassing Prisma)
 */
export async function POST(req: NextRequest) {
  try {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
      }, { status: 500 });
    }

    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        error: 'Email and password required' 
      }, { status: 400 });
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
      return NextResponse.json({ 
        success: false,
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password as string);

    if (!passwordMatch) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid credentials' 
      }, { status: 401 });
    }

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
    console.error('Test login error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Login failed', 
      details: error.message 
    }, { status: 500 });
  }
}
