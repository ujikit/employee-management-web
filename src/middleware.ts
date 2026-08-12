import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Retrieve the access_token set during OTP verification
  const token = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/otp')
  const isDashboardPage = pathname.startsWith('/dashboard')

  // 1. If user HAS a valid token and tries to open /login or /otp, redirect to /dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. If user DOES NOT have a token and tries to open /dashboard, redirect to /login
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Config matcher ensures middleware runs on specified routes
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/otp'],
}
