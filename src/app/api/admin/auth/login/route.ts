import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setSessionCookie, dummyVerify, rateLimit, logAction, getClientIp } from '@/lib/admin-auth';

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

    const user = await db.adminUser.findUnique({ where: { email } });

    // Timing normalization: always run a bcrypt compare so response time doesn't
    // reveal whether the email exists (user enumeration).
    const ok = user ? await verifyPassword(password, user.password) : (await dummyVerify(), false);

    if (!user || !ok) {
      await logAction({ action: 'login_failed', entity: 'adminUser', details: email, req });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await setSessionCookie(email);
    await logAction({ userId: user.id, action: 'login_success', entity: 'adminUser', entityId: user.id, req });
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Login failed', 
      details: error.message,
      code: error.code 
    }, { status: 500 });
  }
}
