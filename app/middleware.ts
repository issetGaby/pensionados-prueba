import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const protectedRoutes = ['/dashboard', '/me'];
  const authRoutes = ['/login'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Simular verificación de autenticación en middleware
  // En un caso real, verificarías un token JWT en cookies
  const hasAuth = request.cookies.get('auth-token'); // Esto es simulado

  if (isProtectedRoute && !hasAuth) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirigir al dashboard si está autenticado y trata de acceder a login
  if (isAuthRoute && hasAuth) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/me/:path*', '/login'],
};