import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get("user_email")?.value
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0"

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/api/auth/signin", "/api/auth/signup"]

  // Menu routes are public (for QR code access)
  const isMenuRoute = pathname.startsWith("/menu/")

  // Apply rate limiting for auth and admin APIs
  if (pathname.startsWith("/api/auth/")) {
    const limited = isRateLimited(ip, "auth", 5, 60_000) // 5 req/min
    if (limited) {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  } else if (pathname.startsWith("/api/admin/")) {
    const limited = isRateLimited(ip, "admin", 60, 60_000) // 60 req/min
    if (limited) {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
  }

  if (publicRoutes.includes(pathname) || isMenuRoute) {
    const res = NextResponse.next()
    applySecurityHeaders(res)
    return res
  }

  // Redirect to login if not authenticated
  if (!userEmail) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const res = NextResponse.next()
  applySecurityHeaders(res)
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

function applySecurityHeaders(res: NextResponse) {
  // Basic hardening headers
  res.headers.set("X-Frame-Options", "SAMEORIGIN")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  res.headers.set("X-DNS-Prefetch-Control", "off")
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
  // Minimal CSP, can be tightened later
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'"
  ].join('; ')
  res.headers.set("Content-Security-Policy", csp)
}

// Naive in-memory rate limiter (per instance/region). Replace with durable KV in production.
const RATE_BUCKETS: Map<string, { count: number; resetAt: number }> = (globalThis as any).__RATE_BUCKETS__ || new Map()
;(globalThis as any).__RATE_BUCKETS__ = RATE_BUCKETS

function isRateLimited(ip: string, bucket: string, limit: number, windowMs: number): boolean {
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const entry = RATE_BUCKETS.get(key)
  if (!entry || now > entry.resetAt) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= limit) {
    return true
  }
  entry.count += 1
  return false
}
