import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Allow access to login page
      if (req.nextUrl.pathname === '/admin/login') {
        return NextResponse.next();
      }

      // Check if user is authenticated
      if (!req.nextauth.token) {
        // Redirect to login page
        const loginUrl = new URL('/admin/login', req.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has admin role
      const userRole = req.nextauth.token.role as string;
      if (!['admin', 'manager', 'staff'].includes(userRole)) {
        // Redirect to unauthorized page or login
        const loginUrl = new URL('/admin/login', req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname === '/admin/login') {
          return true;
        }

        // For admin routes, require token with appropriate role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && ['admin', 'manager', 'staff'].includes(token.role as string);
        }

        // For API routes, we'll handle auth in the route handlers
        if (req.nextUrl.pathname.startsWith('/api/admin')) {
          return true; // Let the API route handle auth
        }

        // Allow all other routes
        return true;
      },
    },
  }
);

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match admin API routes
    '/api/admin/:path*',
  ],
};