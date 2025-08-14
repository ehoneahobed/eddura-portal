import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './i18n/config';

// Get locale from various sources
function getLocale(request: NextRequest): string {
  // 1. Check if locale is stored in cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => {
        const langCode = lang.split('-')[0];
        return locales.includes(langCode as any);
      });
    
    if (preferredLocale) {
      const langCode = preferredLocale.split('-')[0];
      if (locales.includes(langCode as any)) {
        return langCode;
      }
    }
  }

  // 3. Default to defaultLocale
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const locale = getLocale(request);
  const response = NextResponse.next();

  // Set the locale in a header for the app to use
  response.headers.set('x-locale', locale);

  // Set locale cookie if not already set or different
  const currentCookie = request.cookies.get('locale')?.value;
  if (currentCookie !== locale) {
    response.cookies.set('locale', locale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};