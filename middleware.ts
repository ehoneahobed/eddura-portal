import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes
const protectedRoutes = [
  '/admin',
  '/admin-auth',
  '/api/admin',
  '/api/auth'
];

// Define admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin'
];

// Define public routes that should be accessible without authentication
const publicRoutes = [
  '/',
  '/auth',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/providers',
  '/api/auth/verify',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if the route needs authentication
  const needsAuth = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  try {
    // Get the token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // If no token, redirect to login
    if (!token) {
      console.log('🔒 [MIDDLEWARE] No token found, redirecting to login');
      
      // For admin routes, redirect to admin login
      if (adminRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
        const loginUrl = new URL('/admin-auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // For other protected routes, redirect to user login
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if route requires admin access
    const requiresAdmin = adminRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    if (requiresAdmin) {
      // Verify user is admin
      if (token.type !== 'admin') {
        console.log('🔒 [MIDDLEWARE] Non-admin user trying to access admin route:', token.email);
        const loginUrl = new URL('/admin-auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }

      // Check if admin is active (you might want to add this check)
      if (!token.email) {
        console.log('🔒 [MIDDLEWARE] Admin token missing email');
        const loginUrl = new URL('/admin-auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      console.log('✅ [MIDDLEWARE] Admin access granted:', token.email);
    } else {
      // For other protected routes, just verify user is authenticated
      if (!token.email) {
        console.log('🔒 [MIDDLEWARE] User token missing email');
        const loginUrl = new URL('/auth/signin', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      console.log('✅ [MIDDLEWARE] User access granted:', token.email);
    }

    // Add user info to headers for API routes (optional)
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', token.sub || '');
      requestHeaders.set('x-user-email', token.email || '');
      requestHeaders.set('x-user-type', token.type || '');
      
      if (token.type === 'admin') {
        requestHeaders.set('x-user-role', token.role || '');
        requestHeaders.set('x-user-permissions', token.permissions || '');
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Error in middleware:', error);
    
    // On error, redirect to login
    const loginUrl = new URL('/auth/signin', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    loginUrl.searchParams.set('error', 'middleware_error');
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};