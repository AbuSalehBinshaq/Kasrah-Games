import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // HSTS - Only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    // Check for admin token in cookies
    const token = request.cookies.get('token');

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // In a real app, you would verify the token and check admin role
    // For now, we'll just allow access if token exists
  }

  // API route protection (except public endpoints)
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  // Auth route redirection (if already logged in)
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    const token = request.cookies.get('token');

    if (token) {
      // Redirect to home if already logged in
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
