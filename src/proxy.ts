import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // We only want to password protect the /admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // These will be securely set in your Vercel/Netlify dashboard
      const validUser = process.env.ADMIN_USER || 'admin';
      const validPwd = process.env.ADMIN_PASSWORD || 'admin123';

      if (user === validUser && pwd === validPwd) {
        return NextResponse.next();
      }
    }

    // Force the browser to show the native Username/Password prompt
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
