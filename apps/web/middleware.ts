import { NextResponse, NextRequest } from 'next/server';
import { rateLimit } from '../lib/security';

export function middleware(req: NextRequest) {
  const ip = (req.ip || req.headers.get('x-forwarded-for') || 'anon').toString();
  if (!rateLimit(ip)) return new NextResponse('Too Many Requests', { status: 429 });

  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'geolocation=()');
  return res;
}
export const config = { matcher: ['/api/:path*'] };