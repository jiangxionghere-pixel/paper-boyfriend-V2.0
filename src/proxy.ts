import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    publicPaths.some(
      (p) => pathname === p || pathname.startsWith("/api/") || pathname.startsWith("/_next")
    )
  ) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get("pb-session")
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
}
