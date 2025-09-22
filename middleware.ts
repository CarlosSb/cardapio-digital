import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get("user_email")?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/api/auth/signin", "/api/auth/signup"]

  // Menu routes are public (for QR code access)
  const isMenuRoute = pathname.startsWith("/menu/")

  if (publicRoutes.includes(pathname) || isMenuRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!userEmail) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
