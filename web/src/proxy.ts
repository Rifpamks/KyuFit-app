import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Let public files, APIs, and next assets through
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Public pages: /login and /register
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      // If logged in, check onboarding status from token payload
      const onboardingComplete = getOnboardingStatus(token);
      if (!onboardingComplete && pathname !== '/register') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      if (onboardingComplete) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Onboarding page: allow if not complete
  if (pathname === '/onboarding') {
    const onboardingComplete = getOnboardingStatus(token);
    if (onboardingComplete) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // All other pages: must have completed onboarding
  const onboardingComplete = getOnboardingStatus(token);
  if (!onboardingComplete) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

/**
 * Extract onboardingComplete from token payload without crypto verification.
 * This is safe enough for routing decisions; actual auth is handled server-side.
 * Edge Runtime cannot use Node.js crypto, so we parse the base64 payload directly.
 */
function getOnboardingStatus(token: string): boolean {
  try {
    const [base64Payload] = token.split('.');
    if (!base64Payload) return false;
    const data = JSON.parse(atob(base64Payload));
    return data.onboardingComplete === true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
