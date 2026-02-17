import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting for demonstration
// In production, use Redis (Upstash) for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - clientData.lastReset > windowMs) {
    clientData.count = 1;
    clientData.lastReset = now;
    rateLimitMap.set(ip, clientData);
    return false;
  }

  clientData.count++;
  rateLimitMap.set(ip, clientData);

  return clientData.count > limit;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || '127.0.0.1';

  // 1. Rate Limiting for Auth Routes
  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register')) {
    // Limit to 5 attempts per minute per IP
    if (isRateLimited(`auth:${ip}`, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }
  }

  // 2. Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // 3. Admin Route Protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('token');

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Note: Actual token verification and role check should happen in the API route 
    // or using a more robust auth library like NextAuth.js/Clerk/Lucia.
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
